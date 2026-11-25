const state = {
  step: 0,
  questions: [
    {
      text: "Did someone contact you unexpectedly and instruct you to send this money?",
      choices: [
        { label: "Yes", value: "yes", reply: "Yes, they contacted me unexpectedly." },
        { label: "No", value: "no", reply: "No, I initiated the conversation." }
      ]
    },
    {
      text: "How do you know the recipient?",
      choices: [
        { label: "Met online", value: "online", reply: "We met online recently." },
        { label: "Friend or family", value: "known", reply: "They are a friend or family member." },
        { label: "Business", value: "business", reply: "This is a business payment." }
      ]
    },
    {
      text: "Were you told to keep this payment secret or act immediately?",
      choices: [
        { label: "Yes", value: "pressure", reply: "Yes, they said it was urgent and private." },
        { label: "No", value: "no-pressure", reply: "No, there was no pressure." }
      ]
    }
  ]
};

const chatLog = document.querySelector("#chat-log");
const responseArea = document.querySelector("#response-area");
const question = document.querySelector("#question");
const choices = document.querySelector("#choices");
const outcome = document.querySelector("#outcome");
const transferStatus = document.querySelector("#transfer-status");

function addMessage(text, type) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${type === "user" ? "user-message" : "ai-message"}`;
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  wrapper.appendChild(paragraph);
  chatLog.appendChild(wrapper);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function renderQuestion() {
  const current = state.questions[state.step];
  question.textContent = current.text;
  choices.replaceChildren();
  current.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.textContent = choice.label;
    button.dataset.value = choice.value;
    button.addEventListener("click", () => answerQuestion(choice));
    choices.appendChild(button);
  });
}

function answerQuestion(choice) {
  addMessage(choice.reply, "user");
  state.step += 1;

  if (state.step < state.questions.length) {
    const bridge = state.step === 1
      ? "Thank you. I need a little more context to protect your account."
      : "One final question. Scammers often create urgency to prevent customers from checking the story.";
    window.setTimeout(() => {
      addMessage(bridge, "ai");
      renderQuestion();
    }, 350);
    return;
  }

  window.setTimeout(showOutcome, 450);
}

function showOutcome() {
  addMessage("Your answers reinforce the transaction risk signals. I have paused the transfer and sent the case to a fraud specialist for review.", "ai");
  responseArea.hidden = true;
  outcome.hidden = false;
  transferStatus.textContent = "Transfer paused";
  transferStatus.className = "status paused";
}

function resetDemo() {
  state.step = 0;
  chatLog.innerHTML = '<div class="message ai-message"><p>This transfer differs from your usual activity. I’ll ask a few quick questions before it is sent.</p></div>';
  responseArea.hidden = false;
  outcome.hidden = true;
  transferStatus.textContent = "Awaiting review";
  transferStatus.className = "status pending";
  renderQuestion();
}

document.querySelector("#reset-demo").addEventListener("click", resetDemo);
document.querySelector("#start-demo").addEventListener("click", () => {
  resetDemo();
  document.querySelector("#demo").scrollIntoView({ behavior: "smooth" });
});

renderQuestion();
