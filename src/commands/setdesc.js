export default {
  name: "setdesc",
  description: "Ubah deskripsi grup",
  group: "Grup",
  isGroup: true,
  isAdmin: true,
  execute: async ({ sock, msg, jid }) => {
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
    const desc = text.split(" ").slice(1).join(" ");

    if (!desc) {
      await sock.sendMessage(jid, { text: "Sertakan deskripsi baru." }, { quoted: msg });
      return;
    }

    try {
      await sock.groupUpdateDescription(jid, desc);
      await sock.sendMessage(jid, { text: "Deskripsi grup telah diubah." }, { quoted: msg });
    } catch {
      await sock.sendMessage(jid, { text: "Gagal mengubah deskripsi." }, { quoted: msg });
    }
  },
};
