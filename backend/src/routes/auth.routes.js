const express = require("express");
const authController = require("../controllers/auth.controller");
const { signUp, login } = authController;

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);

module.exports = router;
