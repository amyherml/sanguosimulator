const fs = require("fs");

// 加载JSON
function loadGame(path) {
  return JSON.parse(fs.readFileSync(path, "utf-8"));
}

// 初始化玩家状态
function initState(game) {
  return JSON.parse(JSON.stringify(game.state_init));
}

// 应用数值变化
function applyEffects(state, effects = {}) {
  if (effects.stats) {
    for (let key in effects.stats) {
      state.stats[key] += effects.stats[key];
    }
  }
}

// 设置 flags
function applyFlags(state, flags = {}) {
  for (let key in flags) {
    state.flags[key] = flags[key];
  }
}

// 条件判断
function checkCondition(state, cond) {
  if (!cond) return true;

  const { type, key, operator, value } = cond;

  let current;

  if (type === "stat") current = state.stats[key];
  if (type === "flag") current = state.flags[key];

  switch (operator) {
    case "==": return current === value;
    case "!=": return current !== value;
    case ">=": return current >= value;
    case "<=": return current <= value;
    case ">": return current > value;
    case "<": return current < value;
    default: return false;
  }
}

// 检查条件组
function checkConditions(state, conditions = []) {
  return conditions.every(cond => checkCondition(state, cond));
}

// 选择解析（核心）
function resolveChoice(state, node, choiceId) {
  const candidates = node.choices
    .filter(c => c.text && c.id.startsWith(choiceId[0])) // 同类选项
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  const chosen = candidates.find(c =>
    checkConditions(state, c.conditions || [])
  );

  return chosen;
}

// 执行选择
function applyChoice(state, choice) {
  applyEffects(state, choice.effects);
  applyFlags(state, choice.flags);
}

// 获取节点
function getNode(game, nodeId) {
  return game.nodes[nodeId];
}

module.exports = {
  loadGame,
  initState,
  resolveChoice,
  applyChoice,
  getNode
};