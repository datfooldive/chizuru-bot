import { isJidGroup, isPnUser, jidNormalizedUser, extractMessageContent } from "baileys";

const toJid = (number) => {
  if (!number) return null;
  if (isJidGroup(number) || isPnUser(number)) return number;
  return `${number.replace(/[^0-9]/g, "")}@s.whatsapp.net`;
};

const fromJid = (jid) => {
  if (!jid) return null;
  return jidNormalizedUser(jid).split("@")[0];
};

const getMentionedJid = (msg) => {
  const messageContent = extractMessageContent(msg.message);
  if (!messageContent) return null;

  if (messageContent.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
    return messageContent.extendedTextMessage.contextInfo.mentionedJid[0];
  }

  if (messageContent.extendedTextMessage?.contextInfo?.participant) {
    return messageContent.extendedTextMessage.contextInfo.participant;
  }

  return null;
};

const getPhoneFromJid = async (sock, jid) => {
  if (!jid) return null;
  const normalized = jidNormalizedUser(jid);
  const phone = normalized.split("@")[0];

  try {
    const [res] = await sock.onWhatsApp(normalized);
    if (res && res.jid) {
      return res.jid.split("@")[0];
    }
  } catch {}

  return phone;
};

export { toJid, fromJid, getMentionedJid, getPhoneFromJid };
