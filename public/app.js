const API = "http://localhost:3000/game";

async function fetchNode() {
  const res = await fetch(`${API}/node`);
  const data = await res.json();
  renderNode(data.node, data.state);
}

function renderNode(node, state) {
  document.getElementById("intro").innerText = node.narrative.intro || "";
  document.getElementById("situation").innerText = node.narrative.situation || "";
  document.getElementById("prompt").innerText = node.narrative.prompt || "";

  document.getElementById("result").innerText = "";

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  const uniqueChoices = {};

  node.choices.forEach(choice => {
    const baseId = choice.id.split("_")[0];
    if (!uniqueChoices[baseId]) {
      uniqueChoices[baseId] = choice;
    }
  });

  Object.values(uniqueChoices).forEach(choice => {
    const btn = document.createElement("button");
    const baseId = choice.id.split("_")[0];

    btn.innerText = `${baseId}：${choice.text}`;
    btn.onclick = () => selectChoice(baseId);

    choicesDiv.appendChild(btn);
  });

  renderStats(state);
}

function renderStats(state) {
  const statsDiv = document.getElementById("stats");

  statsDiv.innerHTML = `
    武力: ${state.stats.force} |
    智谋: ${state.stats.intelligence} |
    忠义: ${state.stats.morality} |
    野心: ${state.stats.ambition}
  `;
}

async function selectChoice(choiceId) {
  const res = await fetch(`${API}/choice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ choiceId })
  });

  const data = await res.json();

  document.getElementById("result").innerText = data.result || "";

  if (data.end) {
    const routeNameMap = {
      warrior: "武将路线",
      strategist: "谋士路线",
      warlord: "枭雄路线"
    };

    const routeName = data.route?.id
      ? routeNameMap[data.route.id] || data.route.id
      : data.route;

    document.getElementById("choices").innerHTML = `
      <h2>进入路线：${routeName}</h2>
    `;
    return;
  }

  renderNode(data.node, data.state);
}

// 启动
fetchNode();