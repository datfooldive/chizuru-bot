export default {
  name: "delete",
  description: "Hapus pesan bot",
  group: "Grup",
  isGroup: true,
  isAdmin: true,
  execute: async ({ sock, msg, jid }) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const participant = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const id = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;

    if (!quoted) {
      await sock.sendMessage(jid, { text: "Balas pesan yang ingin dihapus." }, { quoted: msg });
      return;
    }

    try {
      await sock.sendMessage(jid, {
        delete: {
          remoteJid: jid,
          fromMe: participant === `${sock.user.id.split(":")[0]}@s.whatsapp.net`,
          id: id,
          participant: participant,
        },
      });
    } catch {
      await sock.sendMessage(jid, { text: "Gagal menghapus pesan." }, { quoted: msg });
    }
  },
};
