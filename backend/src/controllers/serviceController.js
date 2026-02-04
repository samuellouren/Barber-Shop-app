const prisma = require("../services/prismaClient");

const listServices = async (req, res) => {
  const services = await prisma.service.findMany({ orderBy: { name: "asc" } });
  return res.json(services);
};

const createService = async (req, res) => {
  const { name, price, duration, description } = req.body;
  const service = await prisma.service.create({
    data: {
      name,
      price,
      duration,
      description
    }
  });
  return res.status(201).json(service);
};

const updateService = async (req, res) => {
  const { id } = req.params;
  const { name, price, duration, description } = req.body;
  const service = await prisma.service.update({
    where: { id },
    data: { name, price, duration, description }
  });
  return res.json(service);
};

module.exports = { listServices, createService, updateService };
