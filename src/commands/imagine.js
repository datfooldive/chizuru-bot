import axios from "axios";
import logger from "../utils/logger.js";

export default {
  name: "imagine",
  description: "Generate AI image",
  group: "Umum",
  execute: async ({ sock, msg, jid }) => {
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
    const userPrompt = text.split(" ").slice(1).join(" ");

    if (!userPrompt) {
      await sock.sendMessage(
        jid,
        { text: "Sertakan prompt untuk generate gambar." },
        { quoted: msg },
      );
      return;
    }

    await sock.sendMessage(
      jid,
      { text: "_Sedang men-generate gambar, mohon tunggu..._" },
      { quoted: msg },
    );

    try {
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(userPrompt)}?nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      const buffer = Buffer.from(response.data, "binary");

      await sock.sendMessage(
        jid,
        {
          image: buffer,
          caption: `Hasil imagine: ${userPrompt}`,
        },
        { quoted: msg },
      );
    } catch (err) {
      logger.error(err);
      await sock.sendMessage(jid, { text: "Gagal men-generate gambar." }, { quoted: msg });
    }
  },
};
