const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

//TAMBAH DATA USER
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const [result] = await db.query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, password]
    );

    res.status(201).json({
      message: "Register berhasil",
      data: {
        id: result.insertId,
        username: username,
        email: email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

//LOGIN USER

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ? AND password_hash = ?",
      [email, password]
    );
    if (users.length > 0) {
      const user = users[0];
      res.status(200).json({
        message: "Login berhasil",
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } else {
      res.status(401).json({ error: "Email atau password salah" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
