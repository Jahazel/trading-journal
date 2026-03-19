const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");

async function signUp(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields." });
    }

    const existingUser = await User.findOne({
      $or: [
        {
          username: username,
        },
        {
          email: email,
        },
      ],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username is already in use." });
      } else if (existingUser.email === email) {
        return res.status(400).json({ message: "Email is already in use." });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    const token = jsonwebtoken.sign(
      { id: savedUser.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(201).json({
      token: token,
      username: savedUser.username,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all fields." });
    }

    const existingUser = await User.findOne({
      email: email,
    });

    if (!existingUser) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jsonwebtoken.sign(
      { id: existingUser.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      token: token,
      username: existingUser.username,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = { signUp, login };
