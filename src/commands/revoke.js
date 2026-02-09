export default {
  name: "revoke",
  description: "Reset link undangan grup",
  group: "Grup",
  isGroup: true,
  isAdmin: true,
  execute: async ({ sock, msg, jid }) => {
    try {
      await sock.groupRevokeInvite(jid);
      await sock.sendMessage(jid, { text: "Link undangan telah direset." }, { quoted: msg });
    } catch {
      await sock.sendMessage(jid, { text: "Gagal mereset link undangan." }, { quoted: msg });
    }
  },
};
