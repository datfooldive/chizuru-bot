<div align="center">

# Chizuru Bot

WhatsApp bot built with [Baileys](https://github.com/WhiskeySockets/Baileys) and Node.js.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

</div>

## About

Chizuru Bot is a multi-purpose WhatsApp bot with 30+ commands. It handles group management, media conversion, utilities, and AI features. Data is stored in SQLite via Drizzle ORM.

## Getting Started

### Prerequisites

- Node.js 22+
- FFmpeg (for video stickers)

### Installation

```bash
git clone https://github.com/datfooldive/chizuru-bot.git
cd chizuru-bot
npm install
```

### Usage

```bash
npm start
```

Scan the QR code with your WhatsApp app, then send `!register` to get started.

### Docker

```bash
docker compose up -d
```

## Commands

| Command | Description |
|---|---|
| `!ping` | Check bot status |
| `!register` | Register to use the bot |
| `!help` | Show all commands |
| `!sticker` | Convert image/video to sticker |
| `!toimg` | Convert sticker to image |
| `!tr [lang] <text>` | Translate text |
| `!wiki <query>` | Search Wikipedia |
| `!calc <expr>` | Calculator / unit conversion |
| `!askai <question>` | Ask AI |
| `!imagine <prompt>` | Generate AI image |
| `!afk [reason]` | Set AFK status |

**Group admin:** `!ban` `!unban` `!mute` `!unmute` `!warn` `!unwarn` `!listwarning` `!kick` `!promote` `!demote` `!group` `!tagall` `!hidetag` `!link` `!revoke` `!setname` `!setdesc` `!delete` `!admins`

**Owner:** `!broadcast` `!debug`

## Project Structure

```
src/
  bot.js                # entry point
  commands/
    index.js            # auto-loader
    *.js                # individual commands
  db/
    schema.js           # Drizzle ORM schema
  utils/
    db.js               # database connection
    logger.js           # Pino logger
    helper.js           # Baileys helpers
    exif.js             # sticker metadata
```

Adding a command: create `src/commands/yourcommand.js` with `export default { name, description, group, execute }`.

## Development

```bash
npm run format    # oxfmt
npm run lint      # oxlint
npx drizzle-kit push   # sync schema to DB
```

## License

Distributed under the ISC License. See [LICENSE](LICENSE) for more information.
