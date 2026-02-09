import "dotenv/config";
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  isJidGroup,
  extractMessageContent,
  areJidsSameUser,
} from "baileys";
import qrcode from "qrcode-terminal";
import commands from "./commands/index.js";
import { db } from "./utils/db.js";
import { users, groupBans, groupMutes, afkStatus } from "./db/schema.js";
import { eq, and } from "drizzle-orm";

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  const sock = makeWASocket({
    auth: state,
    syncFullHistory: true,
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("group-participants.update", async (update) => {
    const { id, participants, action } = update;
    if (action === "add") {
      for (const participant of participants) {
        const phone = participant.split("@")[0];
        let isBanned = false;
        try {
          const [banned] = await db
            .select()
            .from(groupBans)
            .where(and(eq(groupBans.groupId, id), eq(groupBans.phone, phone)))
            .limit(1);

          isBanned = !!banned;
        } catch {
          isBanned = false;
        }

        if (isBanned) {
          await sock.sendMessage(id, {
            text: `@${phone} terdeteksi dalam daftar ban dan akan dikeluarkan.`,
            mentions: [participant],
          });
          await sock.groupParticipantsUpdate(id, [participant], "remove");
        }
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (!msg.message) continue;

      const jid = msg.key.remoteJid;

      const isGroup = isJidGroup(jid);

      let sender = msg.key.participantAlt || msg.key.participant;

      if (isGroup && !sender) {
        continue;
      }

      if (!sender) {
        sender = jid;
      }

      const phone = sender.split("@")[0];

      if (isGroup) {
        let isMuted = false;
        try {
          const [muted] = await db
            .select()
            .from(groupMutes)
            .where(and(eq(groupMutes.groupId, jid), eq(groupMutes.phone, phone)))
            .limit(1);

          isMuted = !!muted;
        } catch {
          isMuted = false;
        }

        if (isMuted) {
          await sock.sendMessage(jid, {
            delete: msg.key,
          });
          return;
        }
      }

      const messageContent = extractMessageContent(msg.message);
      const text =
        messageContent?.conversation ||
        messageContent?.extendedTextMessage?.text ||
        messageContent?.imageMessage?.caption ||
        "";

      let senderAfk = null;
      try {
        const [afkRow] = await db
          .select()
          .from(afkStatus)
          .where(eq(afkStatus.jid, sender))
          .limit(1);
        senderAfk = afkRow || null;
      } catch {
        senderAfk = null;
      }

      if (senderAfk && !text.startsWith("!afk")) {
        await db.delete(afkStatus).where(eq(afkStatus.jid, sender));
        await sock.sendMessage(jid, { text: "Kamu sudah kembali dari AFK." }, { quoted: msg });
      }

      const mentionedJids = messageContent?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      for (const mentionedJid of mentionedJids) {
        let afkData = null;
        try {
          const [afkRow] = await db
            .select()
            .from(afkStatus)
            .where(eq(afkStatus.jid, mentionedJid))
            .limit(1);
          afkData = afkRow || null;
        } catch {
          afkData = null;
        }

        if (afkData) {
          const sinceMs = new Date(afkData.time).getTime();
          const seconds = Math.floor((Date.now() - sinceMs) / 1000);
          const h = Math.floor(seconds / 3600);
          const m = Math.floor((seconds % 3600) / 60);
          const s = seconds % 60;
          const duration = `${h > 0 ? `${h}j ` : ""}${m > 0 ? `${m}m ` : ""}${s}s`;

          await sock.sendMessage(
            jid,
            {
              text: `Orang yang kamu tag sedang AFK sejak ${duration} yang lalu.\nAlasan: ${afkData.reason}`,
            },
            { quoted: msg },
          );
        }
      }

      const commandName = text.split(" ")[0].toLowerCase();

      if (commands.has(commandName)) {
        const command = commands.get(commandName);

        if (command.name !== "register") {
          const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);

          if (!user) {
            return sock.sendMessage(jid, { text: "Daftar dulu via !register" }, { quoted: msg });
          }

          if (command.isOwner && !user.isOwner) {
            await sock.sendMessage(
              jid,
              { text: "Perintah ini hanya untuk pemilik bot." },
              { quoted: msg },
            );
            return;
          }
        }

        if (command.isGroup && !isJidGroup(jid)) {
          await sock.sendMessage(
            jid,
            { text: "Perintah ini hanya bisa digunakan di dalam grup." },
            { quoted: msg },
          );
          return;
        }

        if (command.isAdmin && isJidGroup(jid)) {
          const groupMetadata = await sock.groupMetadata(jid);
          const senderJid = msg.key.participant;
          const participant = groupMetadata.participants.find((p) =>
            areJidsSameUser(p.id, senderJid),
          );

          if (!participant || !participant.admin) {
            await sock.sendMessage(
              jid,
              { text: "Perintah ini hanya untuk admin." },
              { quoted: msg },
            );
            return;
          }
        }

        await command.execute({
          sock,
          msg,
          jid,
          commands,
          sender,
          phone,
        });
      }
    }
  });
}

connectToWhatsApp();
