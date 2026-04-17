const express = require("express");
const router = express.Router();

const engine = require("../engine/engine");

const game = engine.loadGame("./data/chapter1.json");

let state = engine.initState(game);
let currentNodeId = game.meta.start_node;

// 获取当前节点
router.get("/node", (req, res) => {
  const node = engine.getNode(game, currentNodeId);
  res.json({
    node,
    state
  });
});

// 选择
router.post("/choice", (req, res) => {
  const { choiceId } = req.body;

  const node = engine.getNode(game, currentNodeId);

  const choice = engine.resolveChoice(state, node, choiceId);

  if (!choice) {
    return res.status(400).json({ error: "无效选择" });
  }

  engine.applyChoice(state, choice);

  // 路由分流
  if (choice.route) {
    return res.json({
      end: true,
      route: choice.route,
      state
    });
  }

  currentNodeId = choice.next;

  const nextNode = engine.getNode(game, currentNodeId);

  res.json({
    result: choice.result,
    node: nextNode,
    state
  });
});

module.exports = router;