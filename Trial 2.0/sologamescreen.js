import {makeQuestionGen} from "./questionGenerator.js";

// [top-left, top-right, bottom-left, bottom-right] answer buttons respectively
let correctAnswer = new Array(4); 
// Current question number
let questionNumber = 1;
// Current number of correct answers
let score = 0;
// Creates a questionGenerator object
var gen;
makeQuestionGen().then(function(value) {
    gen = value;
    // console.log("Inside makeQuestionGen.then")
    // console.log(value);
    onLoad();
}) 

function onLoad() {
    loadText();

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
    let arrAnswers = [gen.getAnswer(), ...gen.getNonAnswers()];
    // console.log(arrAnswers);

    let btnIDs = ["answer-top-left", "answer-top-right", "answer-bottom-left", "answer-bottom-right"];

    for (let i = 0; i < 4; i++) {
        const rand = getRandomInt(arrAnswers.length); // Random index of arrAnswers
        console.log(rand);
        const btn = document.getElementsByClassName(btnIDs.pop())[0];
        if (arrAnswers[rand] === gen.getAnswer()) {
            correctAnswer[btnIDs.length] = true; 
            // Since the corresponding index of correctAnswers is the index of btnIDs and we just poped
            // the current btnID that means that btnIDS.length is the index of btn.
        }
        btn.innerText = arrAnswers.splice(rand, 1)[0];
    }
    // console.log(correctAnswer);
}

// Returns a random int between 0-max exclusive
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