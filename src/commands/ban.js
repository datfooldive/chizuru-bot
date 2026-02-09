import { db } from "../utils/db.js";
import { users, groupBans } from "../db/schema.js";
import { getMentionedJid, fromJid } from "../utils/helper.js";
import logger from "../utils/logger.js";
import { eq, and } from "drizzle-orm";

export default {
  name: "ban",
  description: "Ban anggota dari grup",
  group: "Grup",
  isGroup: true,
  isAdmin: true,
  execute: async ({ sock, msg, jid }) => {
    const targetJid = getMentionedJid(msg);

    if (!targetJid) {
      await sock.sendMessage(jid, { text: "Tag anggota yang ingin di-ban." }, { quoted: msg });
      return;
    }

    const targetPhone = fromJid(targetJid);

    try {
      const groupMetadata = await sock.groupMetadata(jid);
      const targetIsAdmin = groupMetadata.participants.some(
        (p) => p.id === targetJid && (p.admin === "admin" || p.admin === "superadmin"),
      );

      if (targetIsAdmin) {
        await sock.sendMessage(jid, { text: "Tidak bisa ban sesama admin." }, { quoted: msg });
        return;
      }

      const [targetUser] = await db
        .select({ isOwner: users.isOwner })
        .from(users)
        .where(eq(users.phone, targetPhone))
        .limit(1);

      if (targetUser?.isOwner) {
        await sock.sendMessage(jid, { text: "Tidak bisa ban owner bot." }, { quoted: msg });
        return;
      }

      const [existing] = await db
        .select()
        .from(groupBans)
        .where(and(eq(groupBans.groupId, jid), eq(groupBans.phone, targetPhone)))
        .limit(1);

      if (!existing) {
        await db.insert(groupBans).values({ groupId: jid, phone: targetPhone });
      }

      await sock.groupParticipantsUpdate(jid, [targetJid], "remove");
      await sock.sendMessage(
        jid,
        {
          text: `@${targetPhone} telah di-ban dari grup ini.`,
          mentions: [targetJid],
        },
        { quoted: msg },
      );
    } catch (err) {
      logger.error(err);
      await sock.sendMessage(jid, { text: "Gagal melakukan ban." }, { quoted: msg });
    }
  },
};
