const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  listClients,
  createClient,
  updateClient,
  deleteClient,
  getClientHistory,
} = require("../controllers/clientController");

const router = express.Router();

// Todas as rotas usam autenticação
router.use(authMiddleware);

// LISTAR CLIENTES (com busca)
router.get("/", listClients);

// CRIAR CLIENTE
router.post("/", createClient);

// ATUALIZAR CLIENTE
router.put("/:id", updateClient);

// DELETAR CLIENTE
router.delete("/:id", deleteClient);

// HISTÓRICO DO CLIENTE
router.get("/:id/history", getClientHistory);

module.exports = router;
