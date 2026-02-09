import axios from "axios";
import logger from "../utils/logger.js";

export default {
  name: "askai",
  description: "Tanya AI",
  group: "Umum",
  execute: async ({ sock, msg, jid }) => {
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
    const userPrompt = text.split(" ").slice(1).join(" ");

    if (!userPrompt) {
      await sock.sendMessage(jid, { text: "Sertakan pertanyaan untuk AI." }, { quoted: msg });
      return;
    }

    const systemPrompt =
      "Instruksi: Jawab dengan singkat, padat, dan jelas. Jangan gunakan format Markdown apapun, hanya teks biasa. Pastikan jawaban relevan.";
    const finalPrompt = `${systemPrompt}\n\nPertanyaan: ${userPrompt}`;

    try {
      const response = await axios.get(
        `https://text.pollinations.ai/${encodeURIComponent(finalPrompt)}`,
      );
      const replyText = response.data;

      await sock.sendMessage(jid, { text: replyText }, { quoted: msg });
    } catch (err) {
      logger.error(err);
      await sock.sendMessage(jid, { text: "Gagal menghubungi AI." }, { quoted: msg });
    }
  },
};
