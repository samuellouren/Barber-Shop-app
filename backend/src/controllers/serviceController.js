// src/controllers/serviceController.js
const prisma = require("../services/prismaClient");

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUuid = (id) => typeof id === "string" && UUID_REGEX.test(id);

const parseDecimal = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

// ==============================
// LISTAR SERVIÇOS
// ==============================
const listServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { name: "asc" },
    });
    return res.json({ data: services });
  } catch (error) {
    console.error("[serviceController] listServices:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
};

// ==============================
// BUSCAR SERVIÇO POR ID
// ==============================
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID de serviço inválido" });
    }

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Serviço não encontrado" });
    }

    return res.json({ data: service });
  } catch (error) {
    console.error("[serviceController] getServiceById:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
};

// ==============================
// CRIAR SERVIÇO
// ==============================
const createService = async (req, res) => {
  try {
    const { name, price, duration, description } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Nome é obrigatório",
      });
    }

    const priceNum = parseDecimal(price);
    const durationNum = parseDecimal(duration);

    if (priceNum === null || priceNum < 0) {
      return res.status(400).json({
        success: false,
        message: "Preço deve ser um número maior ou igual a zero",
      });
    }

    if (durationNum === null || durationNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "Duração deve ser um número positivo (minutos)",
      });
    }

    const data = {
      name: name.trim(),
      price: priceNum,
      duration: Math.floor(durationNum),
      ...(description != null && description !== "" && { description: String(description).trim() }),
    };

    const service = await prisma.service.create({ data });
    return res.status(201).json({ data: service });
  } catch (error) {
    console.error("[serviceController] createService:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
};

// ==============================
// ATUALIZAR SERVIÇO
// ==============================
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, duration, description } = req.body;

    if (!isValidUuid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID de serviço inválido" });
    }

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Serviço não encontrado" });
    }

    const data = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Nome não pode ser vazio",
        });
      }
      data.name = name.trim();
    }

    if (price !== undefined) {
      const priceNum = parseDecimal(price);
      if (priceNum === null || priceNum < 0) {
        return res.status(400).json({
          success: false,
          message: "Preço deve ser um número maior ou igual a zero",
        });
      }
      data.price = priceNum;
    }

    if (duration !== undefined) {
      const durationNum = parseDecimal(duration);
      if (durationNum === null || durationNum <= 0) {
        return res.status(400).json({
          success: false,
          message: "Duração deve ser um número positivo (minutos)",
        });
      }
      data.duration = Math.floor(durationNum);
    }

    if (description !== undefined) {
      data.description =
        description === null || description === ""
          ? null
          : String(description).trim();
    }

    if (Object.keys(data).length === 0) {
      return res.json({ data: existing });
    }

    const service = await prisma.service.update({
      where: { id },
      data,
    });

    return res.json({ data: service });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Serviço não encontrado" });
    }
    console.error("[serviceController] updateService:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
};

// ==============================
// DELETAR SERVIÇO
// ==============================
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID de serviço inválido" });
    }

    const existing = await prisma.service.findUnique({
      where: { id },
      include: { _count: { select: { appointments: true } } },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Serviço não encontrado" });
    }

    if (existing._count.appointments > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Não é possível excluir serviço com agendamentos vinculados. Cancele ou remova os agendamentos primeiro.",
      });
    }

    await prisma.service.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Serviço não encontrado" });
    }
    console.error("[serviceController] deleteService:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
};

module.exports = {
  listServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
