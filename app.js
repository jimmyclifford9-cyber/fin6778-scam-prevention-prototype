const presets = {
  scam: { amount: 4800, average: 1100, recipient: "Michael R.", history: "new", method: "external", timing: "unusual" },
  review: { amount: 2850, average: 1600, recipient: "Northstar Supply", history: "new", method: "wire", timing: "normal" },
  safe: { amount: 1200, average: 1200, recipient: "Lakeview Apartments", history: "established", method: "internal", timing: "normal" }
};

const methodLabels = {
  external: "External bank transfer",
  wire: "Wire transfer",
  p2p: "Peer-to-peer payment",
  internal: "Internal account transfer"
};

const historyLabels = {
  new: "First-time recipient",
  recent: "Paid once before",
  established: "Established recipient"
};

const state = {
  transaction: {}, baseScore: 0, combinedScore: 0,
  transactionFactors: [], contextFactors: [], answers: [], step: 0,
  questions: [
    {
      text: "Did someone contact you unexpectedly and instruct you to make this payment?",
      choices: [
        { label: "Yes", reply: "Yes, they contacted me unexpectedly.", delta: 10, factor: "Unexpected contact initiated the payment" },
        { label: "No", reply: "No, I initiated the payment myself.", delta: -5, factor: "Customer initiated the payment" }
      ]
    },
    {
      text: "How do you know the recipient?",
      choices: [
        { label: "Met online", reply: "We met online recently.", delta: 14, factor: "Recipient known only through an online relationship" },
        { label: "Friend or family", reply: "They are a friend or family member.", delta: -8, factor: "Recipient is personally known" },
        { label: "Verified business", reply: "This is a verified business relationship.", delta: -4, factor: "Recipient is a known business" }
      ]
    },
    {
      text: "Were you told to act immediately, keep the payment secret, or avoid contacting your bank?",
      choices: [
        { label: "Yes", reply: "Yes, they said it was urgent and private.", delta: 16, factor: "Urgency or secrecy pressure reported" },
        { label: "No", reply: "No, there was no pressure or secrecy.", delta: -5, factor: "No urgency or secrecy pressure" }
      ]
    }
  ]
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
const clamp = (value, min = 0, max = 99) => Math.min(max, Math.max(min, value));

function readTransaction() {
  return {
    amount: Number($("#amount").value), average: Number($("#average").value),
    recipient: $("#recipient").value.trim() || "Unnamed recipient",
    history: $("#recipient-history").value, method: $("#method").value,
    timing: $("#timing").value
  };
}

function scoreTransaction(transaction) {
  let score = 8;
  const factors = [{ label: "Baseline transaction screening", delta: 8 }];
  const ratio = transaction.average > 0 ? transaction.amount / transaction.average : 1;

  if (ratio >= 4) { score += 24; factors.push({ label: `${ratio.toFixed(1)}× the customer’s typical transfer`, delta: 24 }); }
  else if (ratio >= 2) { score += 16; factors.push({ label: `${ratio.toFixed(1)}× the customer’s typical transfer`, delta: 16 }); }
  else if (ratio >= 1.5) { score += 10; factors.push({ label: `${ratio.toFixed(1)}× the customer’s typical transfer`, delta: 10 }); }
  else { score -= 3; factors.push({ label: "Amount is consistent with normal activity", delta: -3 }); }

  if (transaction.amount >= 5000) { score += 8; factors.push({ label: "High-dollar payment", delta: 8 }); }
  else if (transaction.amount >= 2500) { score += 5; factors.push({ label: "Elevated payment amount", delta: 5 }); }

  if (transaction.history === "new") { score += 22; factors.push({ label: "First payment to this recipient", delta: 22 }); }
  else if (transaction.history === "recent") { score += 8; factors.push({ label: "Limited recipient history", delta: 8 }); }
  else { score -= 4; factors.push({ label: "Established recipient history", delta: -4 }); }

  const methodScores = { wire: 14, external: 10, p2p: 8, internal: -4 };
  const methodDelta = methodScores[transaction.method];
  score += methodDelta;
  factors.push({ label: methodDelta > 0 ? `${methodLabels[transaction.method]} has elevated recovery risk` : "Internal transfer is easier to contain", delta: methodDelta });

  if (transaction.timing === "unusual") { score += 12; factors.push({ label: "Outside the customer’s normal activity window", delta: 12 }); }
  else { score -= 2; factors.push({ label: "Timing matches normal customer activity", delta: -2 }); }

  return { score: clamp(score), factors };
}

function riskLevel(score) {
  if (score >= 70) return { key: "high", status: "High risk — hold", icon: "!", title: "Transfer paused for verification", copy: "Transaction signals indicate a high scam risk. Customer context and human review are required before release." };
  if (score >= 35) return { key: "review", status: "Verification required", icon: "?", title: "Additional verification required", copy: "The transfer should not be released until the customer provides more context." };
  return { key: "low", status: "Low risk", icon: "✓", title: "Transfer may proceed", copy: "The transaction is consistent with the customer’s established activity, subject to normal bank controls." };
}

function renderFactorList(target, factors) {
  const list = $(target);
  list.replaceChildren();
  factors.forEach(({ label, delta }) => {
    const item = document.createElement("li");
    if (delta < 0) item.classList.add("negative");
    const description = document.createElement("span"); description.textContent = label;
    const points = document.createElement("b"); points.textContent = `${delta > 0 ? "+" : ""}${delta}`;
    item.append(description, points); list.appendChild(item);
  });
}

function setMeter(selector, score) { $(selector).style.width = `${score}%`; }

function renderAnalysis() {
  const level = riskLevel(state.baseScore);
  $("#risk-score").textContent = state.baseScore;
  $("#risk-status").textContent = level.status;
  $("#risk-status").className = `status ${level.key}`;
  setMeter("#risk-bar", state.baseScore);
  $("#decision-card").className = `decision-card ${level.key}`;
  $("#decision-card .decision-icon").textContent = level.icon;
  $("#decision-title").textContent = level.title;
  $("#decision-copy").textContent = level.copy;
  $("#factor-total").textContent = `${state.transactionFactors.length} signals`;
  renderFactorList("#factor-list", state.transactionFactors);
  updateAnalystCase();
}

function analyzeTransaction({ scroll = false } = {}) {
  state.transaction = readTransaction();
  const result = scoreTransaction(state.transaction);
  state.baseScore = result.score;
  state.combinedScore = result.score;
  state.transactionFactors = result.factors;
  resetInterview(false);
  renderAnalysis();
  if (scroll) $("#builder").scrollIntoView({ behavior: "smooth" });
}

function loadPreset(name, scroll = false) {
  const preset = presets[name];
  $("#amount").value = preset.amount; $("#average").value = preset.average;
  $("#recipient").value = preset.recipient; $("#recipient-history").value = preset.history;
  $("#method").value = preset.method; $("#timing").value = preset.timing;
  $$(".preset").forEach((button) => button.classList.toggle("active", button.dataset.preset === name));
  analyzeTransaction({ scroll });
}

function addMessage(text, type) {
  const wrapper = document.createElement("div"); wrapper.className = `message ${type === "user" ? "user-message" : "ai-message"}`;
  const paragraph = document.createElement("p"); paragraph.textContent = text; wrapper.appendChild(paragraph);
  $("#chat-log").appendChild(wrapper); $("#chat-log").scrollTop = $("#chat-log").scrollHeight;
}

function renderQuestion() {
  const current = state.questions[state.step];
  $("#question").textContent = current.text; $("#choices").replaceChildren();
  current.choices.forEach((choice) => {
    const button = document.createElement("button"); button.type = "button"; button.textContent = choice.label;
    button.addEventListener("click", () => answerQuestion(choice)); $("#choices").appendChild(button);
  });
}

function renderContext() {
  $("#combined-score").textContent = state.combinedScore; setMeter("#combined-bar", state.combinedScore);
  if (state.contextFactors.length) renderFactorList("#context-factors", state.contextFactors);
  else $("#context-factors").innerHTML = '<li class="neutral-factor">Answer the questions to update the analysis.</li>';
  updateAnalystCase();
}

function answerQuestion(choice) {
  addMessage(choice.reply, "user");
  state.answers.push(choice.reply); state.contextFactors.push({ label: choice.factor, delta: choice.delta });
  state.combinedScore = clamp(state.combinedScore + choice.delta); state.step += 1; renderContext();
  if (state.step < state.questions.length) {
    const transitions = ["Thank you. I need a little more context.", "One final question. Scammers often use pressure to prevent independent verification."];
    window.setTimeout(() => { addMessage(transitions[state.step - 1], "ai"); renderQuestion(); }, 250);
  } else window.setTimeout(showFinalOutcome, 300);
}

function showFinalOutcome() {
  const level = riskLevel(state.combinedScore);
  const copy = level.key === "high" ? "The transfer has been paused and added to the fraud-review queue." : level.key === "review" ? "The transfer remains pending for identity or recipient verification." : "The transfer may proceed under the bank’s normal controls.";
  addMessage(level.key === "high" ? "Your answers reinforce the transaction risk. I have paused the transfer for a fraud specialist." : level.key === "review" ? "I need a bank employee to complete one more verification step before release." : "Thank you. Your responses reduce the risk indicators, so the transfer may proceed under normal controls.", "ai");
  $("#response-area").hidden = true; $("#final-outcome").hidden = false;
  $("#final-status").className = `status ${level.key}`; $("#final-status").textContent = level.status;
  $("#final-title").textContent = level.title; $("#final-copy").textContent = copy;
  updateAnalystCase();
}

function resetInterview(showSection = true) {
  state.step = 0; state.answers = []; state.contextFactors = []; state.combinedScore = state.baseScore;
  $("#chat-log").replaceChildren(); addMessage("This transfer has been flagged for a short safety check. I’ll ask three questions before a final decision.", "ai");
  $("#response-area").hidden = false; $("#final-outcome").hidden = true; renderQuestion(); renderContext();
  if (showSection) { $("#verification").hidden = false; $("#verification").scrollIntoView({ behavior: "smooth", block: "start" }); }
}

function switchView(view) {
  const analyst = view === "analyst";
  $("#customer-view").hidden = analyst; $("#analyst-view").hidden = !analyst;
  $$(".view-button").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateAnalystCase() {
  if (!state.transaction.recipient) return;
  const score = state.answers.length === state.questions.length ? state.combinedScore : state.baseScore;
  $("#queue-recipient").textContent = state.transaction.recipient;
  $("#queue-method").textContent = `${methodLabels[state.transaction.method]} • ${money(state.transaction.amount)}`;
  $("#queue-score").textContent = score; $("#case-recipient").textContent = state.transaction.recipient;
  $("#case-summary").textContent = `${methodLabels[state.transaction.method]} • ${money(state.transaction.amount)} • ${historyLabels[state.transaction.history]}`;
  $("#case-score").textContent = score; $("#paused-value").textContent = money(state.transaction.amount);
  renderFactorList("#analyst-transaction-factors", state.transactionFactors);
  if (state.contextFactors.length) renderFactorList("#analyst-context-factors", state.contextFactors);
  else $("#analyst-context-factors").innerHTML = '<li class="neutral-factor">Customer interview not completed.</li>';
}

function showStaticCase(name) {
  const staticCases = {
    invoice: { recipient: "Northstar Supply", summary: "Wire transfer • $2,850 • First-time recipient", score: 54, transaction: [{ label: "New recipient", delta: 22 }, { label: "Wire transfer recovery risk", delta: 14 }, { label: "Amount above typical activity", delta: 10 }], context: [{ label: "Known business relationship", delta: -4 }] },
    rent: { recipient: "Lakeview Apartments", summary: "Internal transfer • $1,200 • Established recipient", score: 18, transaction: [{ label: "Established recipient history", delta: -4 }, { label: "Normal payment amount", delta: -3 }, { label: "Normal activity window", delta: -2 }], context: [{ label: "Customer initiated the payment", delta: -5 }, { label: "No urgency or secrecy pressure", delta: -5 }] }
  };
  if (name === "current") { updateAnalystCase(); return; }
  const item = staticCases[name]; $("#case-recipient").textContent = item.recipient; $("#case-summary").textContent = item.summary; $("#case-score").textContent = item.score;
  renderFactorList("#analyst-transaction-factors", item.transaction); renderFactorList("#analyst-context-factors", item.context);
}

function recordAnalystAction(action) {
  const outcomes = {
    approve: { className: "approved", text: "Transfer approved by analyst. The decision has been recorded in the audit log.", log: "Analyst approved the transfer after review." },
    contact: { className: "contacted", text: "Customer contact requested. The transfer remains pending while a specialist calls the customer.", log: "Outbound customer verification requested." },
    escalate: { className: "escalated", text: "Transfer blocked and escalated to the fraud-investigation team.", log: "Analyst blocked and escalated the transfer." }
  };
  const outcome = outcomes[action]; const box = $("#analyst-decision"); box.hidden = false; box.className = `analyst-decision ${outcome.className}`; box.textContent = outcome.text;
  const entry = document.createElement("li"); const time = document.createElement("span"); time.textContent = "Now"; entry.append(time, document.createTextNode(outcome.log)); $("#audit-log").appendChild(entry);
}

$("#transaction-form").addEventListener("submit", (event) => { event.preventDefault(); analyzeTransaction(); });
$("#load-guided-demo").addEventListener("click", () => loadPreset("scam", true));
$("#start-verification").addEventListener("click", () => resetInterview(true));
$("#reset-verification").addEventListener("click", () => resetInterview(false));
$$('.preset').forEach((button) => button.addEventListener("click", () => loadPreset(button.dataset.preset)));
$$('.view-button').forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
$$('[data-open-analyst]').forEach((button) => button.addEventListener("click", () => switchView("analyst")));
$$('.case-row').forEach((button) => button.addEventListener("click", () => { $$('.case-row').forEach((row) => row.classList.remove("active")); button.classList.add("active"); showStaticCase(button.dataset.case); }));
$$('[data-action]').forEach((button) => button.addEventListener("click", () => recordAnalystAction(button.dataset.action)));

loadPreset("scam");
