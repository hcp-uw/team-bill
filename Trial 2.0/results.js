var storedQuestions;
var clickedAnswers;
var score;

function onLoad() {
    storedQuestions = JSON.parse(localStorage.getItem("Stored Questions"));
    console.log(storedQuestions);
    clickedAnswers = JSON.parse(localStorage.getItem("Clicked Answers"));
    console.log(clickedAnswers);
    score = parseInt(localStorage.getItem("score"));
    console.log(score);
    loadText();
}

function loadText() {
    console.log("Loading text!");
    console.log(storedQuestions.length);
    for (let i = 0; i < storedQuestions.length; i++) {
        let curQuestion = storedQuestions[i];
        let curAnswer = curQuestion.correctAnswer;
        let curChosenAnswer = clickedAnswers[i];
        let moreInfo = curQuestion.moreInfo;
        document.getElementById("question-" + (i + 1)).innerText = curQuestion.question;
        document.getElementById("chosen-answer-" + (i + 1)).innerText = curChosenAnswer;
        document.getElementById("correct-answer-" + (i + 1)).innerText = curAnswer;
        if (moreInfo !== undefined) {
            document.getElementById("more-info-" + (i + 1)).innerText = curQuestion.moreInfo;
            document.getElementById("more-info-" + (i + 1)).classList.add("moreInfo");
        } 

        if (curChosenAnswer + "" !== curAnswer + "") {
            document.getElementById("question-" + (i + 1)).parentElement.classList.add("wrong");
        } else {
            document.getElementById("question-" + (i + 1)).parentElement.classList.add("correct");
        }
    }
    document.getElementById("scores").innerText = score;
}

onLoad();