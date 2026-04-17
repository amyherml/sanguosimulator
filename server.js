const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middlewares（必须在 routes 前）
app.use(cors());
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
const gameRoutes = require("./routes/game");
app.use("/game", gameRoutes);

// 首页
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Health check（Render 用）
app.get("/ping", (req, res) => {
  res.send("ok");
});

// 启动端口（Render 必须用 process.env.PORT）
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});