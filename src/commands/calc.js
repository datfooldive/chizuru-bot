import { evaluate } from "mathjs";
import { extractMessageContent } from "baileys";
import logger from "../utils/logger.js";

export default {
  name: "calc",
  description: "Kalkulator dan konversi satuan",
  group: "Umum",
  execute: async ({ sock, msg, jid }) => {
    const messageContent = extractMessageContent(msg.message);
    const text = messageContent?.conversation || messageContent?.extendedTextMessage?.text || "";

    const expression = text.split(" ").slice(1).join(" ").trim();

    if (!expression) {
      await sock.sendMessage(
        jid,
        {
          text: "Sertakan ekspresi matematika atau konversi.\nContoh: !calc 50 * 2 / 4\nContoh: !calc 10km to miles",
        },
        { quoted: msg },
      );
      return;
    }

    try {
      const result = evaluate(expression);
      await sock.sendMessage(jid, { text: `*Hasil:* ${result}` }, { quoted: msg });
    } catch (error) {
      logger.error(error);
      await sock.sendMessage(jid, { text: "Ekspresi tidak valid." }, { quoted: msg });
    }
  },
};
