const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const clientRoutes = require("./routes/clientRoutes");
const barberRoutes = require("./routes/barberRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const discountRoutes = require("./routes/discountRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Rotas principais organizadas por domínio.
app.use("/auth", authRoutes);
app.use("/clients", clientRoutes);
app.use("/barbers", barberRoutes);
app.use("/services", serviceRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/discounts", discountRoutes);
app.use("/settings", settingsRoutes);

module.exports = app;
