export default {
  name: "help",
  description: "Menampilkan daftar perintah yang tersedia",
  group: "Umum",
  execute: async ({ sock, msg, jid, commands }) => {
    const categories = {};

    commands.forEach((cmd) => {
      const group = cmd.group || "Lainnya";
      if (!categories[group]) {
        categories[group] = [];
      }
      categories[group].push(cmd);
    });

    let helpText = "";

    Object.keys(categories)
      .sort()
      .forEach((category) => {
        helpText += `*${category.toUpperCase()}:*\n`;
        categories[category].forEach((cmd) => {
          helpText += `- !${cmd.name}`;
          if (cmd.description) {
            helpText += ` : ${cmd.description}`;
          }
          helpText += "\n";
        });
        helpText += "\n";
      });

    await sock.sendMessage(jid, { text: helpText.trim() }, { quoted: msg });
  },
};
