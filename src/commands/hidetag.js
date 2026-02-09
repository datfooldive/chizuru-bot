export default {
  name: "hidetag",
  description: "Tag semua anggota tanpa terlihat teks tag",
  group: "Grup",
  isGroup: true,
  isAdmin: true,
  execute: async ({ sock, msg, jid }) => {
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
    const query = text.split(" ").slice(1).join(" ");

    const groupMetadata = await sock.groupMetadata(jid);
    const participants = groupMetadata.participants;

    await sock.sendMessage(
      jid,
      {
        text: query || "",
        mentions: participants.map((p) => p.id),
      },
      { quoted: msg },
    );
  },
};
