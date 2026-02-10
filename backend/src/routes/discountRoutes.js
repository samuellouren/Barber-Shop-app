const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { validateCode, sendBirthday } = require("../controllers/discountController");

const router = express.Router();

router.use(authMiddleware);

router.get("/validate", validateCode);
router.post("/send-birthday", sendBirthday);

module.exports = router;
