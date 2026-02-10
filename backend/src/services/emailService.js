const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const DEFAULT_SUBJECT = "Seu desconto de aniversário na Barbearia MB";

function fillTemplate(text, vars) {
  let out = text;
  for (const [key, value] of Object.entries(vars)) {
    out = out.replace(new RegExp(`{{${key}}}`, "gi"), value ?? "");
  }
  return out;
}

function bodyToHtml(body) {
  return body
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/**
 * Envia e-mail de desconto de aniversário.
 * @param {Object} params - to, name, code, percent, expiresAt
 * @param {Object} [options] - subject, body (templates com {{name}}, {{code}}, {{percent}}, {{expiresAt}})
 */
const sendBirthdayDiscountEmail = async (
  { to, name, code, percent, expiresAt },
  options = {}
) => {
  const formattedDate = new Date(expiresAt).toLocaleDateString("pt-BR");
  const vars = {
    name,
    code,
    percent: String(percent),
    expiresAt: formattedDate,
  };

  const subject = fillTemplate(
    options.subject ?? DEFAULT_SUBJECT,
    vars
  );
  const bodyText = options.body
    ? fillTemplate(options.body, vars)
    : `Parabéns, ${name}!\n\nPara comemorar seu aniversário, criamos um desconto especial para você.\n\nCódigo: ${code}\nDesconto: ${percent}%\nVálido até: ${formattedDate}\n\nApresente este código na recepção no momento do atendimento.`;
  const html = `<div style="font-family: Arial, sans-serif;">${bodyToHtml(bodyText)}</div>`;

  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });
};

module.exports = { sendBirthdayDiscountEmail, fillTemplate };
