const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ===== Middlewares =====
app.use(cors());
app.use(express.json());

// ===== API 路由（必须在 static 前也可以，但这样更清晰）=====
const gameRoutes = require("./routes/game");
app.use("/game", gameRoutes);

// ===== 静态资源 =====
app.use(express.static(path.join(__dirname, "public")));

// ===== 首页（关键：确保 fallback 正常）=====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// ===== 防止前端刷新 404（重要）=====
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// ===== Health check =====
app.get("/ping", (req, res) => {
  res.send("ok");
});

// ===== 启动 =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});