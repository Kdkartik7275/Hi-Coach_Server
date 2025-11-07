const express = require("express");
const { register, login, getAllUsers, verifyToken,forgotPassword } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", register);
router.post("/login", login);
router.get("/users", getAllUsers);
router.get("/verify-token", verifyToken);
router.post("/forgot-password", forgotPassword);

module.exports = router;
