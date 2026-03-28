const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const { query } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const TOKEN_EXPIRES_IN = "7d";

function signToken(user) {
  return jwt.sign(
    {
      userId: user.user_id,
      username: user.username,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN },
  );
}

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body || {};

  if (!username || !username.trim()) {
    return res.status(400).json({ error: "Username is required." });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({ error: "Email is required." });
  }

  if (!password || password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters." });
  }

  const cleanUsername = username.trim();
  const cleanEmail = email.trim().toLowerCase();

  try {
    const duplicateResult = await query(
      `
      SELECT user_id
      FROM users
      WHERE LOWER(username) = LOWER($1)
         OR LOWER(email) = LOWER($2)
      LIMIT 1
      `,
      [cleanUsername, cleanEmail],
    );

    if (duplicateResult.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "Username or email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = randomUUID();

    const insertResult = await query(
      `
      INSERT INTO users (
        user_id, username, email, password_hash, created_at, is_active, display_name
      )
      VALUES ($1, $2, $3, $4, NOW(), true, $2)
      RETURNING user_id, username, email, display_name, selected_avatar
      `,
      [userId, cleanUsername, cleanEmail, passwordHash],
    );

    const user = insertResult.rows[0];
    const token = signToken(user);

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        selectedAvatar: user.selected_avatar,
      },
    });
  } catch (err) {
    console.error("Signup error", err);
    return res.status(500).json({ error: "Failed to create account." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { emailOrUsername, password } = req.body || {};

  if (!emailOrUsername || !password) {
    return res
      .status(400)
      .json({ error: "Email/username and password are required." });
  }

  try {
    const result = await query(
      `
      SELECT user_id, username, email, password_hash, display_name, selected_avatar
      FROM users
      WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [emailOrUsername.trim().toLowerCase()],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid login credentials." });
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid login credentials." });
    }

    await query(`UPDATE users SET last_login_at = NOW() WHERE user_id = $1`, [
      user.user_id,
    ]);

    const token = signToken(user);

    return res.json({
      message: "Login successful.",
      token,
      user: {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        selectedAvatar: user.selected_avatar,
      },
    });
  } catch (err) {
    console.error("Login error", err);
    return res.status(500).json({ error: "Failed to log in." });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const result = await query(
      `
      SELECT user_id, username, email, display_name, selected_avatar
      FROM users
      WHERE user_id = $1
      LIMIT 1
      `,
      [req.user.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = result.rows[0];

    return res.json({
      user: {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        selectedAvatar: user.selected_avatar,
      },
    });
  } catch (err) {
    console.error("Verify token error", err);
    return res.status(500).json({ error: "Failed to verify token." });
  }
});

module.exports = router;
