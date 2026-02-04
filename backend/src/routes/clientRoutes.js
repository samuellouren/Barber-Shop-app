const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  listClients,
  createClient,
  updateClient,
  getClientHistory
} = require("../controllers/clientController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listClients);
router.post("/", createClient);
router.put("/:id", updateClient);
router.get("/:id/history", getClientHistory);

module.exports = router;
