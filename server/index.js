// ===============================
// LOAD ENV FIRST
// ===============================

import dotenv from "dotenv";
dotenv.config();

// ===============================
// IMPORTS
// ===============================

import express from "express";
import cors from "cors";
import pkg from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const { Pool } = pkg;

// ===============================
// DATABASE CONNECTION (Supabase)
// ===============================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ===============================
// EXPRESS SETUP
// ===============================

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// ===============================
// AUTH MIDDLEWARE
// ===============================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

// ===============================
// TEST DATABASE CONNECTION
// ===============================

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// NASA APOD ROUTE
// ===============================

app.get("/api/apod", async (req, res) => {
  try {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 5);

    const formatDate = (date) =>
      date.toISOString().split("T")[0];

    const response = await fetch(
      `https://api.nasa.gov/planetary/apod?start_date=${formatDate(
        past
      )}&end_date=${formatDate(today)}&api_key=${
        process.env.NASA_API_KEY
      }`
    );

    const data = await response.json();

    const enhanced = data.map((item) => {
      const sentences = item.explanation.split(". ");
      const summary = sentences.slice(0, 2).join(". ") + ".";

      return {
        ...item,
        summary,
      };
    });

    res.json(enhanced.reverse());
  } catch (error) {
    console.error("APOD Error:", error);
    res.status(500).json({ error: "Failed to fetch APOD" });
  }
});

// ===============================
// ISS ROUTE
// ===============================

app.get("/api/iss", async (req, res) => {
  try {
    const response = await fetch(
      "http://api.open-notify.org/iss-now.json"
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("ISS Error:", error);
    res.status(500).json({ error: "Failed to fetch ISS data" });
  }
});

// ===============================
// REGISTER ROUTE
// ===============================

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: newUser.rows[0],
    });

  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// ===============================
// LOGIN ROUTE
// ===============================

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = userResult.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ===============================
// PROTECTED ROUTE
// ===============================

app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [req.user.id]
    );

    res.json(userResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ===============================
// ADD TO FAVORITES (PROTECTED)
// ===============================

app.post("/api/favorites", authenticateToken, async (req, res) => {
  try {
    const { apod_date, title, image_url } = req.body;

    if (!apod_date || !title || !image_url) {
      return res.status(400).json({ error: "Missing favorite data" });
    }

    const newFavorite = await pool.query(
      `INSERT INTO favorites (user_id, apod_date, title, image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, apod_date, title, image_url]
    );

    res.status(201).json({
      message: "Added to favorites",
      favorite: newFavorite.rows[0],
    });

  } catch (err) {
    console.error("Add Favorite Error:", err);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

// ===============================
// GET USER FAVORITES (PROTECTED)
// ===============================

app.get("/api/favorites", authenticateToken, async (req, res) => {
  try {
    const favorites = await pool.query(
      "SELECT * FROM favorites WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );

    res.json(favorites.rows);

  } catch (err) {
    console.error("Fetch Favorites Error:", err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});