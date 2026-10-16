// Builds the lab's capture: corpx_network.pcap (normal traffic, in the repo)
// plus the DNS exfiltration the player has to find, generated from the flag:
// base32(flag), lowercase, no padding, 13 characters per query label,
// <chunk>.data.corpx-sync.net, each query answered with NXDOMAIN.
const fs = require('fs');
const path = require('path');

const TEMPLATE = path.join(__dirname, '../../files/corpx_network.pcap');
const INSERT_AT = 7;          // exfil starts after the first web session
const T0 = 1731060125;        // seconds of the first exfil query
const CHUNK = 13;

function base32(buf) {
  const A = 'abcdefghijklmnopqrstuvwxyz234567';
  let bits = 0, val = 0, out = '';
  for (const b of buf) {
    val = (val << 8) | b; bits += 8;
    while (bits >= 5) { out += A[(val >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += A[(val << (5 - bits)) & 31];
  return out;
}

function ipChecksum(h) {
  let sum = 0;
  for (let i = 0; i < h.length; i += 2) sum += h.readUInt16BE(i);
  while (sum >> 16) sum = (sum & 0xffff) + (sum >> 16);
  return ~sum & 0xffff;
}

function readRecords(buf) {
  const recs = [];
  for (let off = 24; off < buf.length;) {
    const len = buf.readUInt32LE(off + 8);
    recs.push(buf.subarray(off, off + 16 + len));
    off += 16 + len;
  }
  return recs;
}

function qname(labels) {
  return Buffer.concat([...labels.map((l) => Buffer.concat([Buffer.from([l.length]), Buffer.from(l)])), Buffer.from([0])]);
}

// One DNS packet, Ethernet + IPv4 headers copied from a template packet of the
// same direction (query: host -> resolver, response: resolver -> host).
function dnsRecord(tpl, sec, usec, sport, dport, id, flags, name, ipId) {
  const eth = tpl.subarray(16, 30);
  const ip = Buffer.from(tpl.subarray(30, 50));
  const dns = Buffer.concat([
    Buffer.from([id >> 8, id & 0xff, flags >> 8, flags & 0xff, 0, 1, 0, 0, 0, 0, 0, 0]),
    name, Buffer.from([0, 1, 0, 1]),
  ]);
  const udp = Buffer.alloc(8);
  udp.writeUInt16BE(sport, 0); udp.writeUInt16BE(dport, 2); udp.writeUInt16BE(8 + dns.length, 4); // checksum 0 = none (IPv4)
  ip.writeUInt16BE(20 + 8 + dns.length, 2); ip.writeUInt16BE(ipId, 4); ip.writeUInt16BE(0, 10);
  ip.writeUInt16BE(ipChecksum(ip), 10);
  const pkt = Buffer.concat([eth, ip, udp, dns]);
  const hdr = Buffer.alloc(16);
  hdr.writeUInt32LE(sec, 0); hdr.writeUInt32LE(usec, 4); hdr.writeUInt32LE(pkt.length, 8); hdr.writeUInt32LE(pkt.length, 12);
  return Buffer.concat([hdr, pkt]);
}

function buildPcap(flag) {
  const tpl = fs.readFileSync(TEMPLATE);
  const recs = readRecords(tpl);
  // The last two records are a DNS query/response pair (home.corpx.local).
  const q = recs[recs.length - 2], r = recs[recs.length - 1];
  const enc = base32(Buffer.from(flag));
  const exfil = [];
  for (let i = 0; i * CHUNK < enc.length; i++) {
    const name = qname([enc.slice(i * CHUNK, (i + 1) * CHUNK), 'data', 'corpx-sync', 'net']);
    const sec = T0 + 2 * i, us = 100000 + 40000 * i, port = 33211 + i, id = 0x3300 + i;
    exfil.push(dnsRecord(q, sec, us, port, 53, id, 0x0100, name, 0x4a00 + 2 * i));
    exfil.push(dnsRecord(r, sec, us + 20000, 53, port, id, 0x8183, name, 0x4a01 + 2 * i));
  }
  const all = [...recs.slice(0, INSERT_AT), ...exfil, ...recs.slice(INSERT_AT)];
  return { buf: Buffer.concat([tpl.subarray(0, 24), ...all]), packets: all.length };
}

module.exports = { buildPcap, base32 };
