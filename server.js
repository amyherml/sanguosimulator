const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const gameRoutes = require("./routes/game");

// Middlewares
app.use(cors());
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/game", gameRoutes);

// Health check
app.get("/ping", (req, res) => {
  res.send("ok");
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});