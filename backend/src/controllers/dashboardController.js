// src/controllers/dashboardController.js
const prisma = require("../services/prismaClient");

// ==============================
// DASHBOARD
// ==============================
const getDashboard = async (req, res) => {
  try {
    // Contagem geral de clientes, barbeiros e agendamentos
    const [totalClients, totalBarbers, totalAppointments] = await Promise.all([
      prisma.client.count(),
      prisma.barber.count(),
      prisma.appointment.count(),
    ]);

    // Últimos 5 agendamentos (mais recentes)
    const recentAppointments = await prisma.appointment.findMany({
      orderBy: { date: "desc" },
      take: 5,
      include: {
        client: true,
        service: true,
        barber: true,
      },
    });

    // Retorno estruturado
    res.json({
      totalClients,
      totalBarbers,
      totalAppointments,
      recentAppointments,
    });
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
    res.status(500).json({ error: "Erro ao carregar dashboard." });
  }
};

module.exports = { getDashboard };
