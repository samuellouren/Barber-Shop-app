const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  listServices,
  createService,
  updateService
} = require("../controllers/serviceController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listServices);
router.post("/", createService);
router.put("/:id", updateService);

module.exports = router;
