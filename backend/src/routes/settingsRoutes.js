const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getBirthdayMessage,
  updateBirthdayMessage,
} = require("../controllers/settingsController");

const router = express.Router();

router.use(authMiddleware);

router.get("/birthday-message", getBirthdayMessage);
router.put("/birthday-message", updateBirthdayMessage);

module.exports = router;
