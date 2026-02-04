const dayjs = require("dayjs");
const prisma = require("../services/prismaClient");
const { createBirthdayDiscount } = require("../services/discountService");
const { sendBirthdayDiscountEmail } = require("../services/emailService");

const checkBirthdays = async (req, res) => {
  const today = dayjs();

  const clients = await prisma.client.findMany();
  const birthdayClients = clients.filter((client) => {
    const birth = dayjs(client.birthDate);
    return birth.date() === today.date() && birth.month() === today.month();
  });

  const results = [];

  for (const client of birthdayClients) {
    if (!client.email) {
      results.push({ clientId: client.id, status: "sem-email" });
      continue;
    }

    const discount = await createBirthdayDiscount(client.id);

    await sendBirthdayDiscountEmail({
      to: client.email,
      name: client.name,
      code: discount.code,
      percent: discount.percent,
      expiresAt: discount.expiresAt
    });

    results.push({ clientId: client.id, status: "enviado" });
  }

  return res.json({ processed: results.length, results });
};

const validateCode = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Informe o código" });
  }

  const discount = await prisma.discountCode.findUnique({
    where: { code }
  });

  if (!discount) {
    return res.status(404).json({ error: "Código não encontrado" });
  }

  if (discount.usedAt) {
    return res.status(400).json({ error: "Código já utilizado" });
  }

  if (dayjs(discount.expiresAt).isBefore(dayjs())) {
    return res.status(400).json({ error: "Código expirado" });
  }

  return res.json(discount);
};

module.exports = { checkBirthdays, validateCode };
