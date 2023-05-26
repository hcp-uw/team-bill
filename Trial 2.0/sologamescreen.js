import { makeQuestionGen } from "questionGenerator.js";

// [top-left, top-right, bottom-left, bottom-right] answer buttons respectively
let correctAnswer = new Array(4); 
// Current question number
let questionNumber = 1;
// Current number of correct answers
let score = 0;
// Question generator
const questionGen = makeQuestionGen();

// Replaces the question and all 4 answer choices with their respective text. Resets corret answer
function loadText() {
    document.getElementById("question").innerText = "Click number 1!";
    document.getElementById("question-number").innerText = questionNumber;
    loadAnswers();
}

// Replaces all answer text with 3 wrong answers and 1 correct answer chosen randomly. Changes the
// global correct answer boolean to correctly represent right and wrong answers
function loadAnswers() {
    // the first element of this array represents the correct answer
    correctAnswer = ["false", "false", "false", "false"];
    let arrAnswers = new Array("1","2","3","4"); // (replace with function calls later for answers)
    let temp;
    let rand = getRandomInt(4); // Random number between 0-3 inclusive  
    let answerText = document.getElementsByClassName("answer-top-left");

    
    for (var i = 0; i < answerText.length; i++) {
        // Checks if there is already a correct answer and if arrAnswers[rand] is the correct
        // answer modifies the global boolean
        if (rand === 0 && !(correctAnswer.includes(true))) {
            correctAnswer[0] = true;
        }
        temp = arrAnswers[rand];
        answerText[i].innerText = arrAnswers[rand];
    }
    arrAnswers.splice(arrAnswers.indexOf(temp), 1);
    rand = getRandomInt(3); // Random number between 0-2 inclusive    
    answerText = document.getElementsByClassName("answer-top-right");
    for (var i = 0; i < answerText.length; i++) {
        if (rand === 0 && !(correctAnswer.includes(true))) {
            correctAnswer[1] = true;
        }
        temp = arrAnswers[rand];
        answerText[i].innerText = arrAnswers[rand]
    }
    arrAnswers.splice(arrAnswers.indexOf(temp), 1);
    rand = getRandomInt(2); // Random number between 0-1 inclusive    
    answerText = document.getElementsByClassName("answer-bottom-left");
    for (var i = 0; i < answerText.length; i++) {
        if (rand === 0 && !(correctAnswer.includes(true))) {
            correctAnswer[2] = true;
        }
        temp = arrAnswers[rand];
        answerText[i].innerText = arrAnswers[rand]
    }
    arrAnswers.splice(arrAnswers.indexOf(temp), 1);
    rand = 0;
    answerText = document.getElementsByClassName("answer-bottom-right");
    for (var i = 0; i < answerText.length; i++) {
        if (rand === 0 && !(correctAnswer.includes(true))) {
            correctAnswer[3] = true;
        }
        temp = arrAnswers[rand];
        answerText[i].innerText = arrAnswers[rand]
    }
}

// Returns a random int between 0-max inclusive
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// Checks if clicked button was the correct answer
function checkAnswer(element) {
    if (element.className === "answer-top-left" && correctAnswer[0] === true) {
        alert("you got it right");
        score++;
    } else if (element.className === "answer-top-right" && correctAnswer[1] === true) {
        alert("you got it right");
        score++;
    } else if (element.className === "answer-bottom-left" && correctAnswer[2] === true) {
        alert("you got it right");
        score++;
    } else if (element.className === "answer-bottom-right" && correctAnswer[3] === true) {
        alert("you got it right");
        score++;
    } else {
        alert("wrong");
    }

    // Goes to the next question or final screen
    questionNumber++;
    if (questionNumber <= 10) {
        loadText();
    } else {
        // TODO: remove below and replace with transition to score screen
        alert("score: " + score);
    }
 }