const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  listTodayAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment
} = require("../controllers/appointmentController");

const router = express.Router();

router.use(authMiddleware);

router.get("/today", listTodayAppointments);
router.post("/", createAppointment);
router.put("/:id", updateAppointment);
router.patch("/:id/cancel", cancelAppointment);

module.exports = router;
