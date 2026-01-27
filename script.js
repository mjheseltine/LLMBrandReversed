let round = 0;
let selectedModel = null;

const NEXT_DELAY_MS = 600;

// ---------- MODEL DEFINITIONS (NO-NAME VERSION) ----------

const MODEL_IDS = ["A", "B", "C", "D"];
const COLOR_LABELS = ["Purple model", "Blue model", "Orange model", "Green model"];
const COLOR_CLASSES = ["purple", "blue", "orange", "green"];

// Randomize model order ONCE per participant
const modelOrder = [...MODEL_IDS].sort(() => Math.random() - 0.5);

// ---------- REVERSED QUESTION ORDER ----------
// data.js order (regular): Political (0–3), General (4–7)
// Reversed condition: General → Political

const ORDERED_DATA = [
  ...window.LLM_DATA.slice(4, 8), // General knowledge first
  ...window.LLM_DATA.slice(0, 4)  // Political second
];

// ---------- DOM REFERENCES ----------

const promptEl = document.getElementById("prompt");
const generateBtn = document.getElementById("generateBtn");
const loadingEl = document.getElementById("loading");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("nextBtn");
const instructionEl = document.getElementById("selectionInstruction");

// ---------- UTIL ----------

const timestamp = () => Date.now();

// ---------- LOG MODEL ORDER ----------

window.parent.postMessage(
  {
    type: "model_order",
    value: modelOrder.join(","),
    timestamp: timestamp()
  },
  "*"
);

// ---------- LOAD ROUND ----------

function loadRound() {
  const q = ORDERED_DATA[round];
  promptEl.textContent = q.prompt;

  answersEl.classList.add("hidden");
  loadingEl.classList.add("hidden");
  nextBtn.classList.add("hidden");
  instructionEl.classList.add("hidden");

  selectedModel = null;
  generateBtn.disabled = false;

  const wrappers = document.querySelectorAll(".answer-wrapper");

  modelOrder.forEach((modelId, i) => {
    const wrapper = wrappers[i];
    const label = wrapper.querySelector(".model-label");
    const card = wrapper.querySelector(".answer-card");

    // Reset classes
    wrapper.className = "answer-wrapper";
    label.className = "model-label";

    // Apply color
    wrapper.classList.add(COLOR_CLASSES[i]);
    label.classList.add(COLOR_CLASSES[i]);

    // Assign data
    wrapper.dataset.model = modelId;
    label.textContent = COLOR_LABELS[i];
    card.textContent = q.answers[modelId];
    card.classList.remove("selected");
  });
}

// ---------- GENERATE RESPONSES ----------

generateBtn.addEventListener("click", () => {
  generateBtn.disabled = true;
  loadingEl.classList.remove("hidden");

  setTimeout(() => {
    loadingEl.classList.add("hidden");
    answersEl.classList.remove("hidden");
    instructionEl.classList.remove("hidden");
  }, 700);
});

// ---------- SELECT ANSWER ----------

document.querySelectorAll(".answer-wrapper").forEach(wrapper => {
  wrapper.addEventListener("click", () => {
    document.querySelectorAll(".answer-card")
      .forEach(c => c.classList.remove("selected"));

    wrapper.querySelector(".answer-card").classList.add("selected");
    selectedModel = wrapper.dataset.model;

    window.parent.postMessage(
      {
        type: "choiceMade",
        fieldName: `choice_round_${round + 1}`,
        value: selectedModel,
        timestamp: timestamp()
      },
      "*"
    );

    setTimeout(() => {
      nextBtn.classList.remove("hidden");
      nextBtn.scrollIntoView({ behavior: "smooth", block: "center" });
    }, NEXT_DELAY_MS);
  });
});

// ---------- NEXT QUESTION ----------

nextBtn.addEventListener("click", () => {
  round++;

  if (round >= ORDERED_DATA.length) {
    window.parent.postMessage(
      { type: "finishedAllRounds", timestamp: timestamp() },
      "*"
    );

    document.getElementById("app").innerHTML =
      "<h2>Thank you, you may now proceed to the next task.</h2>";
    return;
  }

  loadRound();
});

// ---------- INIT ----------

loadRound();
