import logger from "../utils/logger.js";
import { fromJid } from "../utils/helper.js";

export default {
  name: "admins",
  description: "Tag semua admin grup",
  group: "Grup",
  isGroup: true,
  execute: async ({ sock, msg, jid }) => {
    try {
      const groupMetadata = await sock.groupMetadata(jid);
      const participants = groupMetadata.participants;
      const admins = participants.filter((p) => p.admin === "admin" || p.admin === "superadmin");

      let message = "*ADMIN GRUP*\n\n";
      const mentions = [];

      for (const admin of admins) {
        message += `@${fromJid(admin.id)} `;
        mentions.push(admin.id);
      }

      if (admins.length === 0) {
        message += "Tidak ada admin ditemukan.";
      }

      await sock.sendMessage(
        jid,
        {
          text: message.trim(),
          mentions: mentions,
        },
        { quoted: msg },
      );
    } catch (error) {
      logger.error(error);
      await sock.sendMessage(jid, { text: "Gagal mengambil daftar admin." }, { quoted: msg });
    }
  },
};
