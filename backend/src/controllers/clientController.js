const prisma = require("../services/prismaClient");

const listClients = async (req, res) => {
  const search = req.query.search || "";
  const clients = await prisma.client.findMany({
    where: {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ]
    },
    orderBy: { name: "asc" }
  });

  return res.json(clients);
};

const createClient = async (req, res) => {
  const { name, phone, email, birthDate, preferences } = req.body;

  const client = await prisma.client.create({
    data: {
      name,
      phone,
      email,
      birthDate: new Date(birthDate),
      preferences
    }
  });

  return res.status(201).json(client);
};

const updateClient = async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, birthDate, preferences, loyaltyPoints } = req.body;

  const client = await prisma.client.update({
    where: { id },
    data: {
      name,
      phone,
      email,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      preferences,
      loyaltyPoints
    }
  });

  return res.json(client);
};

const getClientHistory = async (req, res) => {
  const { id } = req.params;

  const appointments = await prisma.appointment.findMany({
    where: { clientId: id },
    include: {
      barber: true,
      service: true
    },
    orderBy: { date: "desc" }
  });

  return res.json(appointments);
};

module.exports = {
  listClients,
  createClient,
  updateClient,
  getClientHistory
};
