export default {
  name: "debug",
  description: "Tampilkan info JSON pesan",
  group: "Owner",
  isOwner: true,
  execute: async ({ sock, msg, jid }) => {
    try {
      const jsonString = JSON.stringify(msg, null, 2);
      await sock.sendMessage(jid, { text: jsonString }, { quoted: msg });
    } catch {
      await sock.sendMessage(jid, { text: "Gagal menampilkan debug info." }, { quoted: msg });
    }
  },
};
