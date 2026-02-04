const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendBirthdayDiscountEmail = async ({ to, name, code, percent, expiresAt }) => {
  const formattedDate = new Date(expiresAt).toLocaleDateString("pt-BR");
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Parabéns, ${name}!</h2>
      <p>Para comemorar seu aniversário, criamos um desconto especial para você.</p>
      <p><strong>Código:</strong> ${code}</p>
      <p><strong>Desconto:</strong> ${percent}%</p>
      <p><strong>Válido até:</strong> ${formattedDate}</p>
      <p>Apresente este código na recepção no momento do atendimento.</p>
    </div>
  `;

  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Seu desconto de aniversário na Barbearia MB",
    html
  });
};

module.exports = { sendBirthdayDiscountEmail };
