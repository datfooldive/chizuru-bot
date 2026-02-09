import { db } from "../utils/db.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export default {
  name: "register",
  description: "Daftar untuk menggunakan bot",
  group: "Umum",
  execute: async ({ sock, msg, jid, phone }) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
      if (user) {
        return sock.sendMessage(jid, { text: "Nomor kamu sudah terdaftar." }, { quoted: msg });
      }

      await db
        .insert(users)
        .values({
          phone,
          name: msg.pushName || "User",
        })
        .returning();

      await sock.sendMessage(jid, { text: "Pendaftaran berhasil." }, { quoted: msg });
    } catch {
      await sock.sendMessage(jid, { text: "Gagal mendaftar." }, { quoted: msg });
    }
  },
};
