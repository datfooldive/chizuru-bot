import { db } from "../utils/db.js";
import { users, warnings } from "../db/schema.js";
import { getMentionedJid } from "../utils/helper.js";
import logger from "../utils/logger.js";
import { eq, and } from "drizzle-orm";

export default {
  name: "warn",
  description: "Beri peringatan ke anggota",
  group: "Grup",
  isGroup: true,
  isAdmin: true,
  execute: async ({ sock, msg, jid }) => {
    const targetJid = getMentionedJid(msg);

    if (!targetJid) {
      await sock.sendMessage(
        jid,
        { text: "Tag anggota yang ingin diberi peringatan." },
        { quoted: msg },
      );
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
          { text: "Tidak bisa memberi peringatan kepada admin." },
          { quoted: msg },
        );
        return;
      }

      const targetPhone = targetJid.split("@")[0];

      let [targetUser] = await db
        .select({ isOwner: users.isOwner })
        .from(users)
        .where(eq(users.phone, targetPhone))
        .limit(1);

      if (!targetUser) {
        await db.insert(users).values({ phone: targetPhone, name: "User" });
        targetUser = { isOwner: false };
      }

      if (targetUser?.isOwner) {
        await sock.sendMessage(
          jid,
          { text: "Tidak bisa memberi peringatan kepada owner bot." },
          { quoted: msg },
        );
        return;
      }

      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
      const reason = text.split(" ").slice(2).join(" ") || "Melanggar aturan";

      const [existingWarning] = await db
        .select()
        .from(warnings)
        .where(and(eq(warnings.groupId, jid), eq(warnings.phone, targetPhone)))
        .limit(1);

      let newCount = 1;

      if (existingWarning) {
        newCount = existingWarning.count + 1;
        await db
          .update(warnings)
          .set({ count: newCount, reason })
          .where(eq(warnings.id, existingWarning.id));
      } else {
        await db.insert(warnings).values({ groupId: jid, phone: targetPhone, count: 1, reason });
      }

      if (newCount >= 3) {
        await sock.sendMessage(
          jid,
          {
            text: `@${targetPhone} telah mencapai 3 peringatan dan dikeluarkan.`,
            mentions: [targetJid],
          },
          { quoted: msg },
        );

        await sock.groupParticipantsUpdate(jid, [targetJid], "remove");

        await db
          .delete(warnings)
          .where(and(eq(warnings.groupId, jid), eq(warnings.phone, targetPhone)));
      } else {
        await sock.sendMessage(
          jid,
          {
            text: `Peringatan untuk @${targetPhone} ${newCount}/3\nAlasan: ${reason}`,
            mentions: [targetJid],
          },
          { quoted: msg },
        );
      }
    } catch (err) {
      logger.error(err);
      await sock.sendMessage(jid, { text: "Gagal memproses peringatan." }, { quoted: msg });
    }
  },
};
