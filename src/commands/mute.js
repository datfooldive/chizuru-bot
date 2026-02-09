import { db } from "../utils/db.js";
import { users, groupMutes } from "../db/schema.js";
import { getMentionedJid } from "../utils/helper.js";
import logger from "../utils/logger.js";
import { eq, and } from "drizzle-orm";

export default {
  name: "mute",
  description: "Bisukan anggota",
  group: "Grup",
  isGroup: true,
  isAdmin: true,
  execute: async ({ sock, msg, jid }) => {
    const targetJid = getMentionedJid(msg);

    if (!targetJid) {
      await sock.sendMessage(jid, { text: "Tag anggota yang ingin di-mute." }, { quoted: msg });
      return;
    }

    const targetPhone = targetJid.split("@")[0];

    try {
      const groupMetadata = await sock.groupMetadata(jid);
      const targetIsAdmin = groupMetadata.participants.some(
        (p) => p.id === targetJid && (p.admin === "admin" || p.admin === "superadmin"),
      );

      if (targetIsAdmin) {
        await sock.sendMessage(jid, { text: "Tidak bisa mute sesama admin." }, { quoted: msg });
        return;
      }

      const [targetUser] = await db
        .select({ isOwner: users.isOwner })
        .from(users)
        .where(eq(users.phone, targetPhone))
        .limit(1);

      if (targetUser?.isOwner) {
        await sock.sendMessage(jid, { text: "Tidak bisa mute owner bot." }, { quoted: msg });
        return;
      }

      const [existing] = await db
        .select()
        .from(groupMutes)
        .where(and(eq(groupMutes.groupId, jid), eq(groupMutes.phone, targetPhone)))
        .limit(1);

      if (!existing) {
        await db.insert(groupMutes).values({ groupId: jid, phone: targetPhone });
      }

      await sock.sendMessage(
        jid,
        {
          text: `@${targetPhone} telah di-mute.`,
          mentions: [targetJid],
        },
        { quoted: msg },
      );
    } catch (err) {
      logger.error(err);
      await sock.sendMessage(jid, { text: "Gagal melakukan mute." }, { quoted: msg });
    }
  },
};
