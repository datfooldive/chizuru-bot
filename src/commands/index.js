import { readdirSync } from "node:fs";
import { join } from "node:path";

const commands = new Map();

const commandFiles = readdirSync(import.meta.dirname).filter(
  (file) => file.endsWith(".js") && file !== "index.js",
);

for (const file of commandFiles) {
  const mod = await import(join(import.meta.dirname, file));
  commands.set(`!${mod.default.name}`, mod.default);
}

export default commands;
