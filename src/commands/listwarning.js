import { db } from "../utils/db.js";
import { warnings } from "../db/schema.js";
import logger from "../utils/logger.js";
import { eq } from "drizzle-orm";

export default {
  name: "listwarning",
  description: "Lihat daftar peringatan di grup ini",
  group: "Grup",
  isGroup: true,
  execute: async ({ sock, msg, jid }) => {
    try {
      const warningRows = await db.select().from(warnings).where(eq(warnings.groupId, jid));

      if (!warningRows || warningRows.length === 0) {
        await sock.sendMessage(
          jid,
          { text: "Tidak ada anggota yang memiliki peringatan." },
          { quoted: msg },
        );
        return;
      }

      let text = "*DAFTAR PERINGATAN*\n\n";
      const mentions = [];

      for (const w of warningRows) {
        text += `• @${w.phone}: ${w.count}/3 - Alasan: ${w.reason}\n`;
        mentions.push(`${w.phone}@s.whatsapp.net`);
      }

      await sock.sendMessage(jid, { text, mentions }, { quoted: msg });
    } catch (err) {
      logger.error(err);
      await sock.sendMessage(jid, { text: "Terjadi kesalahan sistem." }, { quoted: msg });
    }
  },
};
