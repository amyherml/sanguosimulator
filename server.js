const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API
const gameRoutes = require("./routes/game");
app.use("/game", gameRoutes);

// Static
app.use(express.static(path.join(__dirname, "public")));

// 首页
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// ✅ 正确的 fallback（替代 "*"）
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// health
app.get("/ping", (req, res) => {
  res.send("ok");
});

// port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});