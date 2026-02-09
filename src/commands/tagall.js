import { fromJid } from "../utils/helper.js";

export default {
  name: "tagall",
  description: "Tag semua anggota grup",
  group: "Grup",
  isGroup: true,
  isAdmin: true,
  execute: async ({ sock, msg, jid }) => {
    const groupMetadata = await sock.groupMetadata(jid);
    const participants = groupMetadata.participants;

    let message = "*TAG ALL*\n\n";
    const mentions = [];

    for (const participant of participants) {
      message += `@${fromJid(participant.id)} `;
      mentions.push(participant.id);
    }

    await sock.sendMessage(
      jid,
      {
        text: message.trim(),
        mentions: mentions,
      },
      { quoted: msg },
    );
  },
};
