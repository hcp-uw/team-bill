var storedQuestions;

function onLoad() {
    storedQuestions = JSON.parse(localStorage.getItem("Stored Questions"));
    console.log(storedQuestions);
    loadText();
}

function loadText() {
    console.log("Loading text!");
    console.log(storedQuestions.length);
    for (let i = 0; i < storedQuestions.length; i++) {
        curQuestion = storedQuestions[i];
        document.getElementById("question-" + (i + 1)).innerText = curQuestion.question;
        document.getElementById("correct-answer-" + (i + 1)).innerText = curQuestion.correctAnswer;
        document.getElementById("more-info-" + (i + 1)).innerText = curQuestion.moreInfo;
    }
}

onLoad();