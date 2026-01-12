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
    if (!username || !email || !password) {
      res.status(400).json({ error: "Semua kolom harus diisi !" });
    }
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

// get categories
app.get("/api/categories", async (req, res) => {
  try {
    const [categories] = await db.query("SELECT * FROM categories");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get quizzes
app.get("/api/quizzes", async (req, res) => {
  try {
    const categoryId = req.query.category_id;
    let = query = "SELECT * FROM quizzes";
    let params = [];

    if (categoryId) {
      query += " WHERE category_id = ?";
      params.push(categoryId);
    }

    const [quizzes] = await db.query(query, params);
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// api get quiz with selected quizzes
app.get("/api/quizzes/:id/questions", async (req, res) => {
  try {
    const quizId = req.params.id;

    const [quizInfo] = await db.query(
      "SELECT title, difficulty FROM quizzes WHERE id = ?",
      [quizId]
    );
    if (quizInfo.length === 0)
      return res.status(404).json({ error: "Quiz not found" });

    const [questions] = await db.query(
      "SELECT * FROM questions WHERE quiz_id = ?",
      [quizId]
    );

    for (let i = 0; i < questions.length; i++) {
      const [options] = await db.query(
        "SELECT id, option_text as text, is_correct FROM options WHERE question_id = ?",
        [questions[i].id]
      );
      questions[i].options = options.map((opt) => ({
        ...opt,
        is_correct: opt.is_correct === 1,
      }));
    }
    res.json({
      quiz_title: quizInfo[0].title,
      difficulty: quizInfo[0].difficulty,
      questions: questions,
    });
  } catch (error) {
    console.error("Error Get Questions:", error);
    res.status(500).json({ error: error.message });
  }
});

//api save score
app.post("/api/results", async (req, res) => {
  try {
    const { user_id, quiz_id, score, total_correct } = req.body;

    const [result] = await db.query(
      "INSERT INTO results (user_id, quiz_id, score, total_correct) VALUES (?, ?, ?, ?)",
      [user_id, quiz_id, score, total_correct]
    );

    res.json({ message: "Skor berhasil disimpan", resultId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
