document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".option-btn");
  const options = document.getElementById("options");
  const container = document.getElementById("result-message-container");
  const resultMessage = document.getElementById("result-message");
  const nextQuestionBtn = document.getElementById("next-question");

  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      const choice = this.getAttribute("data-choice");

      fetch("/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ choice }),
      })
        .then((response) => response.json())
        .then((data) => {
          resultMessage.textContent = data.isCorrect
            ? "✅ Correct!"
            : `❌ Incorrect, the correct letter was ${data.correctLetter}.`;

          buttons.forEach((btn) => (btn.disabled = true));

          options.style.display = "none";
          container.style.display = "flex";
        });
    });
  });

  nextQuestionBtn.addEventListener("click", function () {
    fetch("/next-round", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.gameOver) {
          window.location.href = "/game-over";
        } else {
          window.location.href = "/learn";
        }
      });
  });
});
