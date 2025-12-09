const express = require("express");
const { 
  register, 
  login, 
  getAllUsers, 
  verifyToken, 
  requestPasswordReset, 
  resetPassword 
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { 
  registerValidation, 
  loginValidation, 
  forgotPasswordValidation 
} = require("../middleware/validationMiddleware");

const router = express.Router();

router.post("/signup", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/users", authMiddleware, getAllUsers);
router.get("/verify-token", verifyToken);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", forgotPasswordValidation, resetPassword);

module.exports = router;
