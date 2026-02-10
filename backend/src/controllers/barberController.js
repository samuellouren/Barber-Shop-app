const prisma = require("../services/prismaClient");

// ==============================
// LISTAR BARBEIROS
// ==============================
const listBarbers = async (req, res) => {
  try {
    const barbers = await prisma.barber.findMany({
      orderBy: { name: "asc" },
    });

    res.json(barbers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar barbeiros." });
  }
};

// ==============================
// CRIAR BARBEIRO
// ==============================
const createBarber = async (req, res) => {
  try {
    const { name, phone, email, specialties } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Nome é obrigatório." });
    }

    const barber = await prisma.barber.create({
      data: {
        name,
        phone,
        email,
        specialties,
      },
    });

    res.status(201).json(barber);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar barbeiro." });
  }
};

// ==============================
// ATUALIZAR BARBEIRO
// ==============================
const updateBarber = async (req, res) => {
  try {
    const barberId = Number(req.params.id);

    if (isNaN(barberId)) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const { name, phone, email, specialties } = req.body;

    const existingBarber = await prisma.barber.findUnique({
      where: { id: barberId },
    });

    if (!existingBarber) {
      return res.status(404).json({ error: "Barbeiro não encontrado." });
    }

    const barber = await prisma.barber.update({
      where: { id: barberId },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(specialties !== undefined && { specialties }),
      },
    });

    res.json(barber);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar barbeiro." });
  }
};

// ==============================
// DELETAR BARBEIRO
// ==============================
const deleteBarber = async (req, res) => {
  try {
    const barberId = Number(req.params.id);

    if (isNaN(barberId)) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const existingBarber = await prisma.barber.findUnique({
      where: { id: barberId },
    });

    if (!existingBarber) {
      return res.status(404).json({ error: "Barbeiro não encontrado." });
    }

    await prisma.barber.delete({
      where: { id: barberId },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar barbeiro." });
  }
};

// ==============================
// AGENDA DO BARBEIRO
// ==============================
const getBarberAgenda = async (req, res) => {
  try {
    const barberId = Number(req.params.id);

    if (isNaN(barberId)) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const { date } = req.query;

    const start = date ? new Date(date) : new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        barberId: barberId,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        client: true,
        service: true,
      },
      orderBy: { date: "asc" },
    });

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar agenda do barbeiro." });
  }
};

module.exports = {
  listBarbers,
  createBarber,
  updateBarber,
  deleteBarber,
  getBarberAgenda,
};
