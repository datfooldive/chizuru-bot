import { db } from "../utils/db.js";
import { users } from "../db/schema.js";
import logger from "../utils/logger.js";

export default {
  name: "broadcast",
  description: "Kirim pesan ke semua pengguna",
  group: "Owner",
  isOwner: true,
  execute: async ({ sock, msg, jid }) => {
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
    const messageToSend = text.split(" ").slice(1).join(" ");

    if (!messageToSend) {
      await sock.sendMessage(
        jid,
        { text: "Sertakan pesan yang ingin disiarkan." },
        { quoted: msg },
      );
      return;
    }

    try {
      const userRows = await db.select({ phone: users.phone }).from(users);

      if (!userRows) {
        await sock.sendMessage(jid, { text: "Gagal mengambil daftar pengguna." }, { quoted: msg });
        return;
      }

      await sock.sendMessage(
        jid,
        { text: `Mengirim pesan ke ${userRows.length} pengguna...` },
        { quoted: msg },
      );

      let successCount = 0;
      for (const user of userRows) {
        try {
          const userJid = `${user.phone}@s.whatsapp.net`;
          await new Promise((resolve) => setTimeout(resolve, 1000));
          await sock.sendMessage(userJid, { text: messageToSend });
          successCount++;
        } catch (e) {
          logger.error(e);
        }
      }

      await sock.sendMessage(
        jid,
        {
          text: `Broadcast selesai. Terkirim ke ${successCount}/${userRows.length} pengguna.`,
        },
        { quoted: msg },
      );
    } catch (err) {
      logger.error(err);
      await sock.sendMessage(
        jid,
        { text: "Terjadi kesalahan sistem saat broadcast." },
        { quoted: msg },
      );
    }
  },
};
