import {makeQuestionGen} from "./questionGenerator.js";

// Current question number
let questionNumber = 1;
// Current number of correct answers
let score = 0;
// Creates a questionGenerator object
let gen;
// An array of all the chosen answers so far 
let clicked = [];
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

// Replaces all answer text with 3 wrong answers and 1 correct answer chosen randomly
function loadAnswers() {
    let arrAnswers = [gen.getAnswer(), ...gen.getNonAnswers()];
    let btnIDs = ["answer-top-left", "answer-top-right", "answer-bottom-left", "answer-bottom-right"];
    for (let i = 0; i < 4; i++) {
        const rand = getRandomInt(arrAnswers.length); // Random index of arrAnswers
        const btn = document.getElementById(btnIDs.pop());
        // Reset the button colors and borders from previous question
        btn.style.backgroundColor = "#B9E2E0";
        btn.style.border = "0px";
        btn.disabled = false;
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
    //add a border to the chosen button answer
    document.getElementById(name).style.border = "3px solid white";
    let btnIDs = ["answer-top-left", "answer-top-right", "answer-bottom-left", "answer-bottom-right"];
    if (document.getElementById(name).innerText == gen.getAnswer()) {
        score++;
    }
    for (let i = 0; i < 4; i++) {
        console.log(btnIDs[i]);
        document.getElementById(btnIDs[i]).disabled = true;
        if (document.getElementById(btnIDs[i]).innerText == gen.getAnswer()) {
            document.getElementById(btnIDs[i]).style.backgroundColor="#a0ebb4";
            //change color right
        } else {
            document.getElementById(btnIDs[i]).style.backgroundColor="#FFC7AF";
            // change color wrong
        }
    }

    //Keep track of the selected answers
    clicked.push(document.getElementById(name).innerText);

    // Sets a delay so that the player can see the correct answer and their picked answer
    setTimeout(function() {
        // Goes to the next question or final screen
        questionNumber++;
        if (questionNumber <= 10) {
            gen.changeQuestion();
            loadText();
        } else {
            // TODO: remove below and replace with transition to score screen
            alert("score: " + score);
        }
    }, 1000); //1 second delay

 }