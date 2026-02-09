import { db } from "../utils/db.js";
import { afkStatus } from "../db/schema.js";
import { eq } from "drizzle-orm";

export default {
  name: "afk",
  description: "Set status AFK",
  group: "Umum",
  execute: async ({ sock, msg, jid, sender }) => {
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
    const reason = text.split(" ").slice(1).join(" ") || "Tanpa alasan";

    await db.delete(afkStatus).where(eq(afkStatus.jid, sender));
    await db.insert(afkStatus).values({
      jid: sender,
      reason,
      time: new Date(),
    });

    await sock.sendMessage(
      jid,
      { text: `Kamu sekarang AFK dengan alasan: ${reason}` },
      { quoted: msg },
    );
  },
};
