const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  listServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listServices);
router.get("/:id", getServiceById);
router.post("/", createService);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

module.exports = router;
