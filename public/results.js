var storedQuestions;
var clickedAnswers;
var score;

function onLoad() {
    storedQuestions = JSON.parse(localStorage.getItem("Stored Questions"));
    console.log(storedQuestions);
    clickedAnswers = JSON.parse(localStorage.getItem("Clicked Answers"));
    console.log(clickedAnswers);
    score = parseInt(localStorage.getItem("score"));
    playAgainBtn = document.getElementById("play-again-btn");
    playAgainBtn.addEventListener("click", () => {
        window.location.href = window.location.origin + "/sologamescreen.html";
    })
    loadText();
}

function loadText() {
    console.log("Loading results!");
    for (let i = 0; i < storedQuestions.length; i++) {
        let curQuestion = storedQuestions[i];
        let curAnswer = curQuestion.correctAnswer;
        let curChosenAnswer = clickedAnswers[i];
        let moreInfo = curQuestion.moreInfo;

        document.getElementById("question-" + (i + 1)).innerText = curQuestion.question;

        if (curChosenAnswer + "" !== curAnswer + "") {
            document.getElementById("question-" + (i + 1)).parentElement.parentElement.classList.add("wrong");
            document.getElementById("you-chose-" + (i + 1)).innerText = "You chose: " + curChosenAnswer;
            document.getElementById("correct-answer-was-" + (i + 1)).innerText = "Correct answer: " + curAnswer;
        } else {
            document.getElementById("question-" + (i + 1)).parentElement.parentElement.classList.add("correct");
            document.getElementById("you-chose-" + (i + 1)).innerText = "You chose the correct answer: " + curChosenAnswer;
        }

        if (moreInfo !== undefined) {
            document.getElementById("more-info-" + (i + 1)).innerText = curQuestion.moreInfo;
        } 
    }
    // Show entire questions section now
    document.getElementById("questions").style.display = "block";

    document.getElementById("score").innerText = score + "/10";
}

onLoad();