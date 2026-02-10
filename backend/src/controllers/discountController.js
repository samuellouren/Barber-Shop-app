const dayjs = require("dayjs");
const prisma = require("../services/prismaClient");
const { sendBirthdayDiscountsByEmail } = require("../services/discountService");

const validateCode = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Informe o código de desconto",
      });
    }

    const discount = await prisma.discountCode.findUnique({
      where: { code },
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Código não encontrado",
      });
    }

    if (discount.usedAt) {
      return res.status(400).json({
        success: false,
        message: "Código já utilizado",
      });
    }

    if (dayjs(discount.expiresAt).isBefore(dayjs())) {
      return res.status(400).json({
        success: false,
        message: "Código expirado",
      });
    }

    return res.json({
      success: true,
      data: discount,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Envia descontos de aniversário por e-mail para clientes que fazem aniversário hoje.
 * Body opcional: { percent } (default 10).
 */
const sendBirthday = async (req, res) => {
  try {
    const percent = Math.min(100, Math.max(0, Number(req.body?.percent) || 10));
    const results = await sendBirthdayDiscountsByEmail(percent);

    return res.json({
      success: true,
      message: `Processamento concluído. ${results.sent.length} e-mail(s) enviado(s). ${results.errors.length} erro(s).`,
      data: results,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Erro ao enviar descontos de aniversário",
    });
  }
};

module.exports = { validateCode, sendBirthday };
