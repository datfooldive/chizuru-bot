export default {
  name: "ping",
  description: "Cek status bot",
  group: "Umum",
  execute: async ({ sock, msg, jid }) => {
    await sock.sendMessage(jid, { text: "pong" }, { quoted: msg });
  },
};
