const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// PERBAIKAN DI SINI:
// 1. Tambahkan '/api' agar sesuai dengan URL di Postman
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
            email: email
        }
    });

  } catch (error) {
    console.error(error); // Tampilkan error di terminal VS Code agar mudah dicek
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});