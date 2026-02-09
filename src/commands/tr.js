import { translate } from "google-translate-api-x";
import { extractMessageContent } from "baileys";
import logger from "../utils/logger.js";

export default {
  name: "tr",
  description: "Terjemahkan teks",
  group: "Umum",
  execute: async ({ sock, msg, jid }) => {
    const messageContent = extractMessageContent(msg.message);
    const quotedMessage = messageContent?.extendedTextMessage?.contextInfo?.quotedMessage;

    let textToTranslate = "";
    let targetLang = "id";

    const args = (messageContent?.conversation || messageContent?.extendedTextMessage?.text || "")
      .split(" ")
      .slice(1);

    if (args.length > 0 && args[0].length === 2) {
      targetLang = args[0];
      textToTranslate = args.slice(1).join(" ");
    } else {
      textToTranslate = args.join(" ");
    }

    if (quotedMessage && !textToTranslate) {
      const quotedContent = extractMessageContent(quotedMessage);
      textToTranslate =
        quotedContent?.conversation || quotedContent?.extendedTextMessage?.text || "";
    }

    if (!textToTranslate) {
      await sock.sendMessage(
        jid,
        { text: "Sertakan teks atau balas pesan yang ingin diterjemahkan." },
        { quoted: msg },
      );
      return;
    }

    try {
      const res = await translate(textToTranslate, { to: targetLang });
      const resultText = `*Hasil Terjemahan (${res.from.language.iso} -> ${targetLang})*\n\n${res.text}`;
      await sock.sendMessage(jid, { text: resultText }, { quoted: msg });
    } catch (error) {
      logger.error(error);
      await sock.sendMessage(jid, { text: "Gagal menerjemahkan teks." }, { quoted: msg });
    }
  },
};
