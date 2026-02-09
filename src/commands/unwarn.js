import { db } from "../utils/db.js";
import { warnings } from "../db/schema.js";
import { getMentionedJid } from "../utils/helper.js";
import logger from "../utils/logger.js";
import { eq, and } from "drizzle-orm";

export default {
  name: "unwarn",
  description: "Kurangi peringatan anggota",
  group: "Grup",
  isGroup: true,
  isAdmin: true,
  execute: async ({ sock, msg, jid }) => {
    const targetJid = getMentionedJid(msg);

    if (!targetJid) {
      await sock.sendMessage(
        jid,
        { text: "Tag anggota yang ingin dikurangi peringatannya." },
        { quoted: msg },
      );
      return;
    }

    const targetPhone = targetJid.split("@")[0];

    try {
      const [existingWarning] = await db
        .select()
        .from(warnings)
        .where(and(eq(warnings.groupId, jid), eq(warnings.phone, targetPhone)))
        .limit(1);

      if (!existingWarning) {
        await sock.sendMessage(
          jid,
          { text: "Anggota tersebut tidak memiliki peringatan." },
          { quoted: msg },
        );
        return;
      }

      if (existingWarning.count <= 1) {
        await db
          .delete(warnings)
          .where(and(eq(warnings.groupId, jid), eq(warnings.phone, targetPhone)));
      } else {
        await db
          .update(warnings)
          .set({ count: existingWarning.count - 1 })
          .where(eq(warnings.id, existingWarning.id));
      }

      await sock.sendMessage(
        jid,
        {
          text: `Peringatan @${targetPhone} telah dikurangi.`,
          mentions: [targetJid],
        },
        { quoted: msg },
      );
    } catch (err) {
      logger.error(err);
      await sock.sendMessage(jid, { text: "Gagal mengurangi peringatan." }, { quoted: msg });
    }
  },
};
