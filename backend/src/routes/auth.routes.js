const express = require("express");
const authController = require("../controllers/auth.controller");
const { signUp } = authController;

const router = express.Router();

router.post("/signup", signUp);
