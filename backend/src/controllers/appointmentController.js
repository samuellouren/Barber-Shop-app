const prisma = require("../services/prismaClient");
const { validateDiscountCode } = require("../services/discountService");

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isValidUuid = (id) => typeof id === "string" && UUID_REGEX.test(id);

// =========================
// LISTAR AGENDAMENTOS DE HOJE
// =========================
const listTodayAppointments = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
        status: { not: "CANCELADO" },
      },
      include: {
        client: true,
        barber: true,
        service: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    res.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar agendamentos de hoje",
    });
  }
};

// =========================
// CRIAR AGENDAMENTO
// =========================
const createAppointment = async (req, res) => {
  try {
    const {
      date,
      clientId,
      barberId,
      serviceId,
      notes,
      discountCode,
    } = req.body;

    // ===== VALIDAÇÕES =====
    if (!date || !clientId || !barberId || !serviceId) {
      return res.status(400).json({
        success: false,
        message: "Dados obrigatórios não informados",
      });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Data inválida",
      });
    }

    if (
      !isValidUuid(clientId) ||
      !isValidUuid(barberId) ||
      !isValidUuid(serviceId)
    ) {
      return res.status(400).json({
        success: false,
        message: "IDs inválidos (cliente, barbeiro ou serviço)",
      });
    }

    let discountResult = null;

    if (discountCode) {
      discountResult = await validateDiscountCode(discountCode);

      if (!discountResult.valid) {
        return res.status(400).json({
          success: false,
          message: discountResult.reason,
        });
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        date: parsedDate,
        clientId: String(clientId),
        barberId: String(barberId),
        serviceId: String(serviceId),
        notes: notes || null,
        status: "AGENDADO",
      },
      include: {
        client: true,
        barber: true,
        service: true,
      },
    });

    if (discountResult?.discount) {
      await prisma.discountUsage.create({
        data: {
          appointmentId: appointment.id,
          discountId: discountResult.discount.id,
        },
      });
      await prisma.discountCode.update({
        where: { id: discountResult.discount.id },
        data: { usedAt: new Date() },
      });
    }

    res.status(201).json({
      success: true,
      message: discountResult
        ? `Agendamento criado com sucesso! 🎉 Desconto de ${discountResult.discount.percent}% aplicado.`
        : "Agendamento criado com sucesso!",
      data: appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erro interno ao criar agendamento",
    });
  }
};

// =========================
// ATUALIZAR AGENDAMENTO
// =========================
const updateAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    if (!isValidUuid(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: "ID do agendamento inválido",
      });
    }

    const { date, clientId, barberId, serviceId, notes } = req.body;

    const data = {};

    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Data inválida",
        });
      }
      data.date = parsedDate;
    }

    if (clientId !== undefined) {
      if (!isValidUuid(clientId)) {
        return res.status(400).json({
          success: false,
          message: "ID do cliente inválido",
        });
      }
      data.clientId = clientId;
    }
    if (barberId !== undefined) {
      if (!isValidUuid(barberId)) {
        return res.status(400).json({
          success: false,
          message: "ID do barbeiro inválido",
        });
      }
      data.barberId = barberId;
    }
    if (serviceId !== undefined) {
      if (!isValidUuid(serviceId)) {
        return res.status(400).json({
          success: false,
          message: "ID do serviço inválido",
        });
      }
      data.serviceId = serviceId;
    }
    if (notes !== undefined) data.notes = notes;

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data,
      include: {
        client: true,
        barber: true,
        service: true,
      },
    });

    res.json({
      success: true,
      message: "Agendamento atualizado com sucesso!",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar agendamento",
    });
  }
};

// =========================
// CANCELAR AGENDAMENTO
// =========================
const cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    if (!isValidUuid(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: "ID do agendamento inválido",
      });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "CANCELADO" },
    });

    res.json({
      success: true,
      message: "Agendamento cancelado com sucesso!",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erro ao cancelar agendamento",
    });
  }
};

module.exports = {
  listTodayAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
};
