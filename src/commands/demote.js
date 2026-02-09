import { getMentionedJid } from "../utils/helper.js";
import { db } from "../utils/db.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export default {
  name: "demote",
  description: "Hapus jabatan admin anggota",
  group: "Grup",
  isGroup: true,
  isAdmin: true,
  execute: async ({ sock, msg, jid }) => {
    const targetJid = getMentionedJid(msg);

    if (!targetJid) {
      await sock.sendMessage(
        jid,
        { text: "Tag orang yang ingin diturunkan jabatannya." },
        { quoted: msg },
      );
      return;
    }

    try {
      const targetPhone = targetJid.split("@")[0];
      const [targetUser] = await db
        .select({ isOwner: users.isOwner })
        .from(users)
        .where(eq(users.phone, targetPhone))
        .limit(1);

      if (targetUser?.isOwner) {
        await sock.sendMessage(
          jid,
          { text: "Tidak bisa menurunkan jabatan owner bot." },
          { quoted: msg },
        );
        return;
      }

      await sock.groupParticipantsUpdate(jid, [targetJid], "demote");
      await sock.sendMessage(jid, { text: "Jabatan admin telah dihapus." }, { quoted: msg });
    } catch {
      await sock.sendMessage(jid, { text: "Gagal menurunkan jabatan." }, { quoted: msg });
    }
  },
};
