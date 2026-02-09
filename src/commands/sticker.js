import { downloadMediaMessage, extractMessageContent } from "baileys";
import sharp from "sharp";
import { execa } from "execa";
import fs from "node:fs";
import path from "node:path";
import logger from "../utils/logger.js";
import { addMetadata } from "../utils/exif.js";

export default {
  name: "sticker",
  description: "Ubah gambar atau video menjadi stiker",
  group: "Umum",
  execute: async ({ sock, msg, jid }) => {
    const messageContent = extractMessageContent(msg.message);
    const quotedMessage = messageContent?.extendedTextMessage?.contextInfo?.quotedMessage;

    let mediaMsg = msg;
    let isVideo = false;

    if (messageContent?.imageMessage || messageContent?.videoMessage) {
      mediaMsg = msg;
      isVideo = !!messageContent?.videoMessage;
    } else if (quotedMessage?.imageMessage || quotedMessage?.videoMessage) {
      mediaMsg = {
        ...msg,
        message: quotedMessage?.imageMessage
          ? { imageMessage: quotedMessage.imageMessage }
          : { videoMessage: quotedMessage.videoMessage },
      };
      isVideo = !!quotedMessage?.videoMessage;
    } else {
      await sock.sendMessage(
        jid,
        {
          text: "Balas gambar atau video pendek (maks 10 detik) untuk membuat stiker.",
        },
        { quoted: msg },
      );
      return;
    }

    if (isVideo) {
      const duration =
        messageContent?.videoMessage?.seconds || quotedMessage?.videoMessage?.seconds;
      if (duration > 10) {
        await sock.sendMessage(
          jid,
          { text: "Video terlalu panjang. Maksimal 10 detik." },
          { quoted: msg },
        );
        return;
      }
    }

    try {
      const mediaBuffer = await downloadMediaMessage(
        mediaMsg,
        "buffer",
        {},
        {
          reuploadRequest: sock.updateMediaMessage,
        },
      );

      if (!mediaBuffer) return;

      if (!isVideo) {
        let stickerBuffer = await sharp(mediaBuffer)
          .resize(512, 512, {
            fit: "cover",
            position: "center",
          })
          .webp()
          .toBuffer();
        stickerBuffer = await addMetadata(stickerBuffer, "bot by", "@datfooldive");
        await sock.sendMessage(jid, { sticker: stickerBuffer }, { quoted: msg });
      } else {
        const tmpDir = path.join(import.meta.dirname, "../temp");
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

        const inputPath = path.join(tmpDir, `input_${Date.now()}.mp4`);
        const outputPath = path.join(tmpDir, `output_${Date.now()}.webp`);

        fs.writeFileSync(inputPath, mediaBuffer);

        try {
          await execa("ffmpeg", [
            "-i",
            inputPath,
            "-t",
            "7",
            "-vcodec",
            "libwebp",
            "-vf",
            "scale='if(gt(iw,ih),-1,512)':'if(gt(iw,ih),512,-1)',crop=512:512,fps=10",
            "-lossless",
            "0",
            "-compression_level",
            "5",
            "-q:v",
            "40",
            "-loop",
            "0",
            "-preset",
            "default",
            "-an",
            "-vsync",
            "0",
            "-f",
            "webp",
            outputPath,
          ]);

          let stickerBuffer = fs.readFileSync(outputPath);
          stickerBuffer = await addMetadata(stickerBuffer, "bot by", "@datfooldive");

          await sock.sendMessage(jid, { sticker: stickerBuffer }, { quoted: msg });
        } catch (err) {
          logger.error(err);
          await sock.sendMessage(jid, { text: "Gagal membuat stiker video." }, { quoted: msg });
        } finally {
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        }
      }
    } catch (error) {
      logger.error(error);
      await sock.sendMessage(
        jid,
        { text: "Terjadi kesalahan saat membuat stiker." },
        { quoted: msg },
      );
    }
  },
};
