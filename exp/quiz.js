document
  .getElementById("quiz-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    let score = 0;
    const answers = {
      q1: "c",
      // Add more answers here
    };
    const formData = new FormData(this);
    for (let [name, value] of formData.entries()) {
      if (value === answers[name]) {
        score++;
      }
    }
    const totalQuestions = Object.keys(answers).length;
    const result = document.getElementById("result");
    result.textContent = `You scored ${score} out of ${totalQuestions}`;
  });
