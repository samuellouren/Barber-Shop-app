const prisma = require("../services/prismaClient");

// ==============================
// LISTAR CLIENTES (COM BUSCA)
// ==============================
const listClients = async (req, res) => {
  try {
    const { search } = req.query;

    const clients = await prisma.client.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      orderBy: { name: "asc" },
    });

    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar clientes" });
  }
};

// ==============================
// CRIAR CLIENTE
// ==============================
const createClient = async (req, res) => {
  try {
    const { name, phone, email, birthDate, preferences } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        error: "Nome e telefone são obrigatórios",
      });
    }

    const data = { name, phone };

    if (email) data.email = email;
    if (preferences) data.preferences = preferences;

    if (birthDate) {
      const parsedDate = new Date(birthDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: "Data de nascimento inválida" });
      }
      data.birthDate = parsedDate;
    }

    const client = await prisma.client.create({ data });
    res.status(201).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar cliente" });
  }
};

// ==============================
// ATUALIZAR CLIENTE
// ==============================
const updateClient = async (req, res) => {
  try {
    const clientId = Number(req.params.id);

    if (isNaN(clientId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const { name, phone, email, birthDate, preferences } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (email !== undefined) data.email = email;
    if (preferences !== undefined) data.preferences = preferences;

    if (birthDate) {
      const parsedDate = new Date(birthDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: "Data de nascimento inválida" });
      }
      data.birthDate = parsedDate;
    }

    const client = await prisma.client.update({
      where: { id: clientId },
      data,
    });

    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
};

// ==============================
// DELETAR CLIENTE
// ==============================
const deleteClient = async (req, res) => {
  try {
    const clientId = Number(req.params.id);

    if (isNaN(clientId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    await prisma.client.delete({
      where: { id: clientId },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar cliente" });
  }
};

// ==============================
// HISTÓRICO DO CLIENTE
// ==============================
const getClientHistory = async (req, res) => {
  try {
    const clientId = Number(req.params.id);

    if (isNaN(clientId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const history = await prisma.appointment.findMany({
      where: { clientId: clientId },
      include: {
        service: true,
        barber: true,
      },
      orderBy: { date: "desc" },
    });

    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar histórico do cliente" });
  }
};

module.exports = {
  listClients,
  createClient,
  updateClient,
  deleteClient,
  getClientHistory,
};
