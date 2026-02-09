export default {
  name: "group",
  description: "Buka atau tutup grup",
  group: "Grup",
  isGroup: true,
  isAdmin: true,
  execute: async ({ sock, msg, jid }) => {
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
    const action = text.split(" ")[1];

    if (action === "open") {
      await sock.groupSettingUpdate(jid, "not_announcement");
      await sock.sendMessage(jid, { text: "Grup telah dibuka." }, { quoted: msg });
    } else if (action === "close") {
      await sock.groupSettingUpdate(jid, "announcement");
      await sock.sendMessage(jid, { text: "Grup telah ditutup." }, { quoted: msg });
    } else {
      await sock.sendMessage(
        jid,
        { text: "Gunakan: !group open atau !group close" },
        { quoted: msg },
      );
    }
  },
};
