import {makeQuestionGen} from "./questionGenerator.js";

// [top-left, top-right, bottom-left, bottom-right] answer buttons respectively
let correctAnswer = new Array(4); 
// Current question number
let questionNumber = 1;
// Current number of correct answers
let score = 0;
// Creates a questionGenerator object
const gen = makeQuestionGen();

function onLoad() {
    loadAnswers();

    document.getElementsByClassName('answer-top-left')[0].addEventListener('click', ( () => checkAnswer('answer-top-left')));
    document.getElementsByClassName('answer-top-right')[0].addEventListener('click', ( () => checkAnswer('answer-top-right')));
    document.getElementsByClassName('answer-bottom-left')[0].addEventListener('click', ( () => checkAnswer('answer-bottom-left')));
    document.getElementsByClassName('answer-bottom-right')[0].addEventListener('click', ( () => checkAnswer('answer-bottom-right')));
}

// Replaces the question and all 4 answer choices with their respective text. Resets corret answer
function loadText() {
    
    document.getElementById("question").innerText = gen.getQuestion();
    document.getElementById("question-number").innerText = questionNumber;
    loadAnswers();
}

// Replaces all answer text with 3 wrong answers and 1 correct answer chosen randomly. Changes the
// global correct answer boolean to correctly represent right and wrong answers
function loadAnswers() {
    // the first element of this array represents the correct answer
    correctAnswer = [false, false, false, false]; //top-left, top-right, bottom-left, bottom-right 
    // let arrAnswers = new Array("1","2","3","4"); // (replace with function calls later for answers)
    let arrAnswers = new Array();
    arrAnswers.push(gen.getAnswer());
    arrAnswers.concat(gen.getNonAnswers());
    let temp;

    let btnIDs = ["answer-top-left", "answer-top-right", "answer-bottom-left", "answer-bottom-right"];

    for (let j = 0; j < 4; j++) {
        let rand = getRandomInt(btnIds.length()); // Random number between 0-3 inclusive  
        let answerText = document.getElementsByClassName(btnIDs.pop());
        for (let i = 0; i < answerText.length; i++) {
            // Checks if there is already a correct answer and if arrAnswers[rand] is the correct
            // answer modifies the global boolean
            if (rand === 0 && !(correctAnswer.includes(true))) {
                correctAnswer[i] = true;
            }
            temp = arrAnswers[rand];
            answerText[i].innerText = arrAnswers[rand];
        }
    }
}

// Returns a random int between 0-max inclusive
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// Checks if clicked button was the correct answer
function checkAnswer(name) {
    if (name === "answer-top-left" && correctAnswer[0] === true) {
        alert("you got it right");
        score++;
    } else if (name === "answer-top-right" && correctAnswer[1] === true) {
        alert("you got it right");
        score++;
    } else if (name === "answer-bottom-left" && correctAnswer[2] === true) {
        alert("you got it right");
        score++;
    } else if (name === "answer-bottom-right" && correctAnswer[3] === true) {
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