/* ═══════════════════════════════════════════════════════════
   AlexUtils - MAC Address OUI Lookup
   Uses the free macvendors.com API (no key, rate-limited to
   ~1 request/sec per IP on their side). Falls back to a small
   local table of common vendors if the API is unreachable or
   rate-limited, so the tool still returns something useful.
═══════════════════════════════════════════════════════════ */

const { fetchWithTimeout } = require('../alexrecon/modules/utils');

// Small fallback table - not exhaustive, just covers vendors likely
// to show up in a classroom/lab setting (VMs, Raspberry Pis, etc.)
const OUI_FALLBACK = {
  '00:1A:2B': 'Cisco Systems, Inc.',
  '00:50:56': 'VMware, Inc.',
  'B8:27:EB': 'Raspberry Pi Foundation',
  '3C:22:FB': 'Apple, Inc.',
  'F4:02:28': 'Intel Corporate',
  'DC:A6:32': 'Raspberry Pi Trading Ltd',
  '00:0C:29': 'VMware, Inc.',
  '08:00:27': 'PCS Systemtechnik GmbH (VirtualBox)',
  '00:15:5D': 'Microsoft (Hyper-V)',
  '52:54:00': 'QEMU/KVM virtual NIC'
};

function normalizeMac(raw) {
  const hex = raw.replace(/[^0-9a-fA-F]/g, '');
  if (hex.length < 6) return null;
  const bytes = hex.match(/.{1,2}/g);
  return {
    full: bytes.map(b => b.toUpperCase().padStart(2, '0')).join(':'),
    oui: bytes.slice(0, 3).map(b => b.toUpperCase().padStart(2, '0')).join(':'),
    firstByte: parseInt(bytes[0], 16)
  };
}

async function macLookup(rawMac) {
  const normalized = normalizeMac(rawMac);
  if (!normalized) {
    return { valid: false, note: 'Enter at least the first 3 bytes of a MAC address (e.g. 00:1A:2B).' };
  }

  const isLocallyAdministered = (normalized.firstByte & 2) !== 0;
  let vendor = null;
  let source = null;

  try {
    const res = await fetchWithTimeout(`https://api.macvendors.com/${normalized.oui}`, {}, 5000);
    if (res.ok) {
      vendor = (await res.text()).trim();
      source = 'macvendors.com';
    }
  } catch (e) {
    // fall through to local fallback below
  }

  if (!vendor) {
    vendor = OUI_FALLBACK[normalized.oui] || null;
    source = vendor ? 'local fallback table' : null;
  }

  return {
    valid: true,
    macAddress: normalized.full,
    ouiPrefix: normalized.oui,
    vendor: vendor || 'Unknown (not found in vendor registry or local fallback)',
    vendorSource: source,
    addressType: isLocallyAdministered ? 'Locally Administered' : 'Globally Unique'
  };
}

module.exports = { macLookup };
