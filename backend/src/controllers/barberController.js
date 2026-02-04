const prisma = require("../services/prismaClient");

const listBarbers = async (req, res) => {
  const barbers = await prisma.barber.findMany({ orderBy: { name: "asc" } });
  return res.json(barbers);
};

const createBarber = async (req, res) => {
  const { name, phone, email, specialties } = req.body;
  const barber = await prisma.barber.create({
    data: { name, phone, email, specialties }
  });
  return res.status(201).json(barber);
};

const updateBarber = async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, specialties } = req.body;
  const barber = await prisma.barber.update({
    where: { id },
    data: { name, phone, email, specialties }
  });
  return res.json(barber);
};

const getBarberAgenda = async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  const start = date ? new Date(date) : new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      barberId: id,
      date: {
        gte: start,
        lte: end
      }
    },
    include: {
      client: true,
      service: true
    },
    orderBy: { date: "asc" }
  });

  return res.json(appointments);
};

module.exports = {
  listBarbers,
  createBarber,
  updateBarber,
  getBarberAgenda
};
