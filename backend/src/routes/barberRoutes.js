const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  listBarbers,
  createBarber,
  updateBarber,
  getBarberAgenda
} = require("../controllers/barberController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listBarbers);
router.post("/", createBarber);
router.put("/:id", updateBarber);
router.get("/:id/agenda", getBarberAgenda);

module.exports = router;
