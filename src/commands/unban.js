import { db } from "../utils/db.js";
import { groupBans } from "../db/schema.js";
import { getMentionedJid, fromJid, toJid } from "../utils/helper.js";
import logger from "../utils/logger.js";
import { eq, and } from "drizzle-orm";

export default {
  name: "unban",
  description: "Hapus status ban anggota",
  group: "Grup",
  isGroup: true,
  isAdmin: true,
  execute: async ({ sock, msg, jid }) => {
    const targetJid = getMentionedJid(msg);
    let targetPhone;

    if (targetJid) {
      targetPhone = fromJid(targetJid);
    } else {
      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
      const args = text.split(" ");
      if (args.length > 1) {
        targetPhone = fromJid(toJid(args[1]));
      }
    }

    if (!targetPhone) {
      await sock.sendMessage(
        jid,
        { text: "Tag anggota atau masukkan nomor untuk unban." },
        { quoted: msg },
      );
      return;
    }

    try {
      await db
        .delete(groupBans)
        .where(and(eq(groupBans.groupId, jid), eq(groupBans.phone, targetPhone)));

      const responseJid = toJid(targetPhone);
      await sock.sendMessage(
        jid,
        {
          text: `@${targetPhone} telah di-unban dari grup ini.`,
          mentions: [responseJid],
        },
        { quoted: msg },
      );
    } catch (err) {
      logger.error(err);
      await sock.sendMessage(jid, { text: "Gagal melakukan unban." }, { quoted: msg });
    }
  },
};
