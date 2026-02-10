const dayjs = require("dayjs");
const prisma = require("./prismaClient");
const { getBirthdayMessageSettings } = require("./settingsService");
const { sendBirthdayDiscountEmail } = require("./emailService");

const generateCode = () => {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MB-${random}`;
};

const createBirthdayDiscount = async (clientId, percent = 10) => {
  const code = generateCode();
  const expiresAt = dayjs().add(30, "day").toDate();

  return prisma.discountCode.create({
    data: {
      code,
      percent,
      clientId,
      expiresAt,
    },
  });
};

const validateDiscountCode = async (code) => {
  const discount = await prisma.discountCode.findUnique({
    where: { code },
  });

  if (!discount) {
    return { valid: false, reason: "Código não encontrado" };
  }

  if (discount.usedAt) {
    return { valid: false, reason: "Código já utilizado" };
  }

  if (dayjs(discount.expiresAt).isBefore(dayjs())) {
    return { valid: false, reason: "Código expirado" };
  }

  return { valid: true, discount };
};

/**
 * Encontra clientes que fazem aniversário hoje e têm e-mail.
 * Envia desconto por e-mail usando a mensagem personalizada.
 */
const sendBirthdayDiscountsByEmail = async (percent = 10) => {
  const today = dayjs();
  const month = today.month();
  const day = today.date();

  const clients = await prisma.client.findMany({
    where: {
      email: { not: null },
      birthDate: {
        not: null,
      },
    },
  });

  const birthdayClients = clients.filter((c) => {
    const bd = dayjs(c.birthDate);
    return bd.month() === month && bd.date() === day;
  });

  const messageSettings = await getBirthdayMessageSettings();
  const results = { sent: [], errors: [] };

  for (const client of birthdayClients) {
    try {
      const discount = await createBirthdayDiscount(client.id, percent);
      const expiresAt = dayjs(discount.expiresAt).toLocaleDateString("pt-BR");

      await sendBirthdayDiscountEmail(
        {
          to: client.email,
          name: client.name,
          code: discount.code,
          percent: discount.percent,
          expiresAt: discount.expiresAt,
        },
        {
          subject: messageSettings.subject,
          body: messageSettings.body,
        }
      );
      results.sent.push({ clientId: client.id, email: client.email });
    } catch (err) {
      console.error("[discountService] sendBirthdayDiscountsByEmail:", err);
      results.errors.push({
        clientId: client.id,
        email: client.email,
        error: err.message,
      });
    }
  }

  return results;
};

module.exports = {
  createBirthdayDiscount,
  validateDiscountCode,
  sendBirthdayDiscountsByEmail,
};
