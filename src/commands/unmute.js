import { db } from "../utils/db.js";
import { groupMutes } from "../db/schema.js";
import { getMentionedJid } from "../utils/helper.js";
import logger from "../utils/logger.js";
import { eq, and } from "drizzle-orm";

export default {
  name: "unmute",
  description: "Hapus status mute anggota",
  group: "Grup",
  isGroup: true,
  isAdmin: true,
  execute: async ({ sock, msg, jid }) => {
    const targetJid = getMentionedJid(msg);

    if (!targetJid) {
      await sock.sendMessage(jid, { text: "Tag anggota yang ingin di-unmute." }, { quoted: msg });
      return;
    }

    const targetPhone = targetJid.split("@")[0];

    try {
      await db
        .delete(groupMutes)
        .where(and(eq(groupMutes.groupId, jid), eq(groupMutes.phone, targetPhone)));

      await sock.sendMessage(
        jid,
        { text: `@${targetPhone} telah di-unmute.`, mentions: [targetJid] },
        { quoted: msg },
      );
    } catch (err) {
      logger.error(err);
      await sock.sendMessage(jid, { text: "Gagal melakukan unmute." }, { quoted: msg });
    }
  },
};
