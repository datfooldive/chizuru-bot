import { getMentionedJid } from "../utils/helper.js";
import { db } from "../utils/db.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export default {
  name: "kick",
  description: "Keluarkan anggota dari grup",
  group: "Grup",
  isGroup: true,
  isAdmin: true,
  execute: async ({ sock, msg, jid }) => {
    const targetJid = getMentionedJid(msg);

    if (!targetJid) {
      await sock.sendMessage(jid, { text: "Tag orang yang ingin dikeluarkan." }, { quoted: msg });
      return;
    }

    try {
      const groupMetadata = await sock.groupMetadata(jid);
      const targetIsAdmin = groupMetadata.participants.some(
        (p) => p.id === targetJid && (p.admin === "admin" || p.admin === "superadmin"),
      );

      if (targetIsAdmin) {
        await sock.sendMessage(
          jid,
          { text: "Tidak bisa mengeluarkan sesama admin." },
          { quoted: msg },
        );
        return;
      }

      const targetPhone = targetJid.split("@")[0];
      const [targetUser] = await db
        .select({ isOwner: users.isOwner })
        .from(users)
        .where(eq(users.phone, targetPhone))
        .limit(1);

      if (targetUser?.isOwner) {
        await sock.sendMessage(
          jid,
          { text: "Tidak bisa mengeluarkan owner bot." },
          { quoted: msg },
        );
        return;
      }

      await sock.groupParticipantsUpdate(jid, [targetJid], "remove");
      await sock.sendMessage(jid, { text: "Anggota telah dikeluarkan." }, { quoted: msg });
    } catch {
      await sock.sendMessage(jid, { text: "Gagal mengeluarkan anggota." }, { quoted: msg });
    }
  },
};
