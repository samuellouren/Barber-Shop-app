const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { checkBirthdays, validateCode } = require("../controllers/discountController");

const router = express.Router();

router.use(authMiddleware);

router.post("/birthdays", checkBirthdays);
router.get("/validate", validateCode);

module.exports = router;
