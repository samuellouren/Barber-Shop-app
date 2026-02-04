const prisma = require("../services/prismaClient");
const { validateDiscountCode } = require("../services/discountService");

const listTodayAppointments = async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: start,
        lte: end
      }
    },
    include: {
      client: true,
      barber: true,
      service: true
    },
    orderBy: { date: "asc" }
  });

  return res.json(appointments);
};

const createAppointment = async (req, res) => {
  const { date, clientId, barberId, serviceId, notes, discountCode } = req.body;

  const appointment = await prisma.appointment.create({
    data: {
      date: new Date(date),
      clientId,
      barberId,
      serviceId,
      notes
    }
  });

  if (discountCode) {
    const validation = await validateDiscountCode(discountCode);

    if (validation.valid) {
      await prisma.discountUsage.create({
        data: {
          appointmentId: appointment.id,
          discountId: validation.discount.id
        }
      });

      await prisma.discountCode.update({
        where: { id: validation.discount.id },
        data: { usedAt: new Date() }
      });
    }
  }

  return res.status(201).json(appointment);
};

const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { date, status, barberId, serviceId, notes } = req.body;

  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      date: date ? new Date(date) : undefined,
      status,
      barberId,
      serviceId,
      notes
    }
  });

  return res.json(appointment);
};

const cancelAppointment = async (req, res) => {
  const { id } = req.params;

  const appointment = await prisma.appointment.update({
    where: { id },
    data: { status: "CANCELADO" }
  });

  return res.json(appointment);
};

module.exports = {
  listTodayAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment
};
