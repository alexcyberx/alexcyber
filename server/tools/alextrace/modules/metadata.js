/* ═══════════════════════════════════════════════════════════
   AlexTrace - Image Metadata (EXIF) module
   ═══════════════════════════════════════════════════════════
   Reads EXIF data from an uploaded image buffer to show the
   user what a photo they're about to post might leak: GPS
   coordinates, device model, timestamp. Nothing is written to
   disk or stored - the buffer is processed in memory and
   discarded once the response is sent (privacy by design, since
   this is exactly the kind of data we're warning the user about).
═══════════════════════════════════════════════════════════ */

const exifr = require('exifr');

function gpsToMapsUrl(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;
  return `https://www.google.com/maps?q=${lat},${lon}`;
}

async function extractMetadata(buffer) {
  try {
    const data = await exifr.parse(buffer, { gps: true, exif: true, ifd0: true });
    if (!data) {
      return { hasMetadata: false, note: 'No EXIF metadata found in this image (it may have already been stripped, which is good for privacy).' };
    }

    const hasGps = typeof data.latitude === 'number' && typeof data.longitude === 'number';

    return {
      hasMetadata: true,
      gps: hasGps ? {
        latitude: data.latitude,
        longitude: data.longitude,
        mapsUrl: gpsToMapsUrl(data.latitude, data.longitude)
      } : null,
      device: {
        make: data.Make || null,
        model: data.Model || null,
        software: data.Software || null
      },
      timestamp: data.DateTimeOriginal || data.CreateDate || data.ModifyDate || null,
      dimensions: (data.ExifImageWidth && data.ExifImageHeight) ? { width: data.ExifImageWidth, height: data.ExifImageHeight } : null
    };
  } catch (err) {
    return { hasMetadata: false, note: `Could not read image metadata: ${err.message}` };
  }
}

module.exports = { extractMetadata };
