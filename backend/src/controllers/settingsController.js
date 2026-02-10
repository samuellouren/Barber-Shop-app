// src/controllers/settingsController.js
const {
  getBirthdayMessageSettings,
  setSetting,
  BIRTHDAY_SUBJECT_KEY,
  BIRTHDAY_BODY_KEY,
  DEFAULT_SUBJECT,
  DEFAULT_BODY,
} = require("../services/settingsService");

// ==============================
// OBTER MENSAGEM DE ANIVERSÁRIO
// ==============================
const getBirthdayMessage = async (req, res) => {
  try {
    const data = await getBirthdayMessageSettings();
    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[settingsController] getBirthdayMessage:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao carregar mensagem de aniversário",
    });
  }
};

// ==============================
// ATUALIZAR MENSAGEM DE ANIVERSÁRIO
// ==============================
const updateBirthdayMessage = async (req, res) => {
  try {
    const { subject, body } = req.body;

    if (subject !== undefined) {
      await setSetting(
        BIRTHDAY_SUBJECT_KEY,
        String(subject).trim() || DEFAULT_SUBJECT
      );
    }
    if (body !== undefined) {
      await setSetting(
        BIRTHDAY_BODY_KEY,
        String(body).trim() || DEFAULT_BODY
      );
    }

    const data = await getBirthdayMessageSettings();

    return res.json({
      success: true,
      message: "Mensagem de aniversário atualizada.",
      data,
    });
  } catch (error) {
    console.error("[settingsController] updateBirthdayMessage:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao salvar mensagem de aniversário",
    });
  }
};

module.exports = {
  getBirthdayMessage,
  updateBirthdayMessage,
};
