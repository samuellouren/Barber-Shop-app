const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  listBarbers,
  createBarber,
  updateBarber,
  deleteBarber,
  getBarberAgenda,
} = require("../controllers/barberController");

const router = express.Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// LISTAR BARBEIROS
router.get("/", listBarbers);

// CRIAR BARBEIRO
router.post("/", createBarber);

// ATUALIZAR BARBEIRO
router.put("/:id", updateBarber);

// DELETAR BARBEIRO
router.delete("/:id", deleteBarber);

// AGENDA DO BARBEIRO
router.get("/:id/agenda", getBarberAgenda);

module.exports = router;
