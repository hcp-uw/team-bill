import {makeQuestionGen} from "./questionGenerator.js";

// Current question number
let questionNumber = 1;
// Current number of correct answers
let score = 0;
// Creates a questionGenerator object
let gen;
makeQuestionGen().then(function(value) {
    gen = value;
    onLoad();
}) 

// 
function onLoad() {
    loadText();

    document.getElementById('answer-top-left').addEventListener('click', ( () => checkAnswer('answer-top-left')));
    document.getElementById('answer-top-right').addEventListener('click', ( () => checkAnswer('answer-top-right')));
    document.getElementById('answer-bottom-left').addEventListener('click', ( () => checkAnswer('answer-bottom-left')));
    document.getElementById('answer-bottom-right').addEventListener('click', ( () => checkAnswer('answer-bottom-right')));
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
    let arrAnswers = [gen.getAnswer(), ...gen.getNonAnswers()];
    let btnIDs = ["answer-top-left", "answer-top-right", "answer-bottom-left", "answer-bottom-right"];

    for (let i = 0; i < 4; i++) {
        const rand = getRandomInt(arrAnswers.length); // Random index of arrAnswers
        const btn = document.getElementById(btnIDs.pop());
        if (arrAnswers[rand] === gen.getAnswer()) {
            // Since the corresponding index of correctAnswers is the index of btnIDs and we just poped
            // the current btnID that means that btnIDS.length is the index of btn.
        }
        btn.innerText = arrAnswers.splice(rand, 1)[0];
    }
}

// Returns a random int between 0 to (max - 1) inclusive
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// Checks if clicked button was the correct answer
function checkAnswer(name) {
    if (document.getElementById(name).innerText === gen.getAnswer()) {
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