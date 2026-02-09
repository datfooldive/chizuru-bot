export default {
  name: "link",
  description: "Ambil link undangan grup",
  group: "Grup",
  isGroup: true,
  isAdmin: true,
  execute: async ({ sock, msg, jid }) => {
    try {
      const code = await sock.groupInviteCode(jid);
      await sock.sendMessage(jid, { text: `https://chat.whatsapp.com/${code}` }, { quoted: msg });
    } catch {
      await sock.sendMessage(jid, { text: "Gagal mengambil link undangan." }, { quoted: msg });
    }
  },
};
