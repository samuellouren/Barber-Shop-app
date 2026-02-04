const prisma = require("../services/prismaClient");

const getDashboard = async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  const [totalClients, todayAppointments, monthlyBirthdays, discountsUsed] =
    await Promise.all([
      prisma.client.count(),
      prisma.appointment.count({
        where: {
          date: {
            gte: start,
            lte: end
          }
        }
      }),
      prisma.client.count({
        where: {
          birthDate: {
            gte: new Date(start.getFullYear(), start.getMonth(), 1),
            lte: new Date(start.getFullYear(), start.getMonth() + 1, 0)
          }
        }
      }),
      prisma.discountUsage.count()
    ]);

  return res.json({
    totalClients,
    todayAppointments,
    monthlyBirthdays,
    discountsUsed
  });
};

module.exports = { getDashboard };
