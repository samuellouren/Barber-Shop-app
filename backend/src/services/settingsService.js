// src/services/settingsService.js
const prisma = require("./prismaClient");

const BIRTHDAY_SUBJECT_KEY = "birthday_email_subject";
const BIRTHDAY_BODY_KEY = "birthday_email_body";

const DEFAULT_SUBJECT = "Seu desconto de aniversário na Barbearia MB";
const DEFAULT_BODY = `Parabéns, {{name}}!

Para comemorar seu aniversário, criamos um desconto especial para você.

Código: {{code}}
Desconto: {{percent}}%
Válido até: {{expiresAt}}

Apresente este código na recepção no momento do atendimento.`;

async function getSetting(key, defaultValue = "") {
  const row = await prisma.setting.findUnique({
    where: { key },
  });
  return row ? row.value : defaultValue;
}

async function setSetting(key, value) {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

async function getBirthdayMessageSettings() {
  const [subject, body] = await Promise.all([
    getSetting(BIRTHDAY_SUBJECT_KEY, DEFAULT_SUBJECT),
    getSetting(BIRTHDAY_BODY_KEY, DEFAULT_BODY),
  ]);
  return { subject, body };
}

module.exports = {
  getSetting,
  setSetting,
  getBirthdayMessageSettings,
  BIRTHDAY_SUBJECT_KEY,
  BIRTHDAY_BODY_KEY,
  DEFAULT_SUBJECT,
  DEFAULT_BODY,
};
