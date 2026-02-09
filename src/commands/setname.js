export default {
  name: "setname",
  description: "Ubah nama grup",
  group: "Grup",
  isGroup: true,
  isAdmin: true,
  execute: async ({ sock, msg, jid }) => {
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
    const name = text.split(" ").slice(1).join(" ");

    if (!name) {
      await sock.sendMessage(jid, { text: "Sertakan nama baru." }, { quoted: msg });
      return;
    }

    try {
      await sock.groupUpdateSubject(jid, name);
      await sock.sendMessage(jid, { text: "Nama grup telah diubah." }, { quoted: msg });
    } catch {
      await sock.sendMessage(jid, { text: "Gagal mengubah nama grup." }, { quoted: msg });
    }
  },
};
