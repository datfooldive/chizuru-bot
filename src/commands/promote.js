import { getMentionedJid } from "../utils/helper.js";

export default {
  name: "promote",
  description: "Jadikan anggota sebagai admin",
  group: "Grup",
  isGroup: true,
  isAdmin: true,
  execute: async ({ sock, msg, jid }) => {
    const participant = getMentionedJid(msg);

    if (!participant) {
      await sock.sendMessage(
        jid,
        { text: "Tag orang yang ingin dijadikan admin." },
        { quoted: msg },
      );
      return;
    }

    try {
      await sock.groupParticipantsUpdate(jid, [participant], "promote");
      await sock.sendMessage(jid, { text: "Anggota telah dijadikan admin." }, { quoted: msg });
    } catch {
      await sock.sendMessage(jid, { text: "Gagal menjadikan admin." }, { quoted: msg });
    }
  },
};
