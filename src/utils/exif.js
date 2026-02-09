import WebP from "node-webpmux";

async function addMetadata(buffer, packname, author) {
  const img = new WebP.Image();
  await img.load(buffer);
  const exif = {
    "sticker-pack-id": "https://github.com/datfooldive/chizuru-bot",
    "sticker-pack-name": packname,
    "sticker-pack-publisher": author,
    emojis: [],
  };
  const exifHeader = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
  ]);
  const jsonPayload = Buffer.from(JSON.stringify(exif), "utf-8");
  const exifData = Buffer.concat([exifHeader, jsonPayload]);
  exifData.writeUIntLE(jsonPayload.length, 14, 4);
  img.exif = exifData;
  return await img.save(null);
}

export { addMetadata };
