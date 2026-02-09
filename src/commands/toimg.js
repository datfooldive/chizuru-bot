import { downloadMediaMessage } from "baileys";
import sharp from "sharp";
import logger from "../utils/logger.js";

export default {
  name: "toimg",
  description: "Ubah stiker menjadi gambar",
  group: "Umum",
  execute: async ({ sock, msg, jid }) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stickerMessage = quoted?.stickerMessage || msg.message?.stickerMessage;

    if (!stickerMessage) {
      await sock.sendMessage(
        jid,
        { text: "Balas stiker yang ingin diubah menjadi gambar." },
        { quoted: msg },
      );
      return;
    }

    try {
      const buffer = await downloadMediaMessage(
        { message: { stickerMessage } },
        "buffer",
        {},
        { reuploadRequest: sock.updateMediaMessage },
      );

      const imgBuffer = await sharp(buffer).png().toBuffer();
      await sock.sendMessage(jid, { image: imgBuffer }, { quoted: msg });
    } catch (err) {
      logger.error(err);
      await sock.sendMessage(
        jid,
        { text: "Gagal mengubah stiker menjadi gambar." },
        { quoted: msg },
      );
    }
  },
};
