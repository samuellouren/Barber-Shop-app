const dayjs = require("dayjs");
const prisma = require("./prismaClient");

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
      expiresAt
    }
  });
};

const validateDiscountCode = async (code) => {
  const discount = await prisma.discountCode.findUnique({
    where: { code }
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

module.exports = { createBirthdayDiscount, validateDiscountCode };
