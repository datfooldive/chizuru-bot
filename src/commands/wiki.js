import axios from "axios";
import logger from "../utils/logger.js";

export default {
  name: "wiki",
  description: "Cari informasi di Wikipedia",
  group: "Umum",
  execute: async ({ sock, msg, jid }) => {
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
    const query = text.split(" ").slice(1).join(" ");

    if (!query) {
      await sock.sendMessage(jid, { text: "Sertakan kata kunci pencarian." }, { quoted: msg });
      return;
    }

    try {
      const searchUrl = `https://id.wikipedia.org/w/api.php?action=opensearch&format=json&limit=5&search=${encodeURIComponent(query)}`;
      const searchRes = await axios.get(searchUrl);

      if (!searchRes.data[1] || searchRes.data[1].length === 0) {
        const enRes = await axios.get(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
        );

        if (enRes.data?.extract) {
          const resText = `*${enRes.data.title} (English Wiki)*\n\n${enRes.data.extract}`;
          await sock.sendMessage(jid, { text: resText }, { quoted: msg });
          return;
        }

        await sock.sendMessage(jid, { text: "Informasi tidak ditemukan." }, { quoted: msg });
        return;
      }

      const bestTitle = searchRes.data[1][0];
      const summaryUrl = `https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestTitle)}`;
      const summaryRes = await axios.get(summaryUrl);

      const resultText = `*${summaryRes.data.title}*\n\n${summaryRes.data.extract}`;
      await sock.sendMessage(jid, { text: resultText }, { quoted: msg });
    } catch (err) {
      logger.error(err);
      await sock.sendMessage(
        jid,
        { text: "Gagal mengambil data dari Wikipedia." },
        { quoted: msg },
      );
    }
  },
};
