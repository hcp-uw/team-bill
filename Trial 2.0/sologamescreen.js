import {makeQuestionGen} from "./questionGenerator.js";

// Current question number
let questionNumber = 1;
// Current number of correct answers
let score = 0;

const btnIDs = ["button-top-left", "button-top-right", "button-bottom-left", "button-bottom-right"];
const ansIDs = ["answer-top-left", "answer-top-right", "answer-bottom-left", "answer-bottom-right"];
const secondIDs = ["answer-top-left-second", "answer-top-right-second", "answer-bottom-left-second", "answer-bottom-right-second"];

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
    document.getElementById('button-top-left').addEventListener('click', ( () => checkAnswer('top-left')));
    document.getElementById('button-top-right').addEventListener('click', ( () => checkAnswer('top-right')));
    document.getElementById('button-bottom-left').addEventListener('click', ( () => checkAnswer('bottom-left')));
    document.getElementById('button-bottom-right').addEventListener('click', ( () => checkAnswer('bottom-right')));
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
    let arrSecondaryInfo = gen.getSecondary();
    for (let i = 0; i < 4; i++) {
        const rand = getRandomInt(arrAnswers.length); // Random index of arrAnswers
        const btn = document.getElementById(btnIDs[i]);
        const ans = document.getElementById(ansIDs[i]);
        const second = document.getElementById(secondIDs[i]);
        // Reset the button colors and borders from previous question
        btn.style.border = "0px";
        btn.disabled = false;
        btn.classList.remove("correct");
        btn.classList.remove("wrong");
        second.innerText = "";
        if (arrAnswers[rand] === gen.getAnswer()) {
            // Since the corresponding index of correctAnswers is the index of btnIDs and we just poped
            // the current btnID that means that btnIDS.length is the index of btn.
        }
        ans.innerText = arrAnswers.splice(rand, 1)[0];
        if (arrSecondaryInfo !== null) {
            second.innerText = arrSecondaryInfo.splice(rand, 1)[0];
        }
    }
}

// Returns a random int between 0 to (max - 1) inclusive
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// Checks if clicked button was the correct answer
function checkAnswer(suffix) {
    const btn = document.getElementById("button-" + suffix);
    const ans = document.getElementById("answer-" + suffix);
    const second = document.getElementById("answer-" + suffix + "-second");
    
    //add a border to the chosen button answer
    btn.style.border = "5px solid white";
    if (ans.innerText == gen.getAnswer()) {
        score++;
    }
    for (let i = 0; i < 4; i++) {
        // console.log(btnIDs[i]);
        document.getElementById(btnIDs[i]).disabled = true;
        if (document.getElementById(ansIDs[i]).innerText == gen.getAnswer()) {
            document.getElementById(btnIDs[i]).classList.add("correct");
            // document.getElementById(btnIDs[i]).style.backgroundColor="#a0ebb4";
            //change color right
        } else {
            document.getElementById(btnIDs[i]).classList.add("wrong");
            // document.getElementById(btnIDs[i]).style.backgroundColor="#ffc7af";
            // change color wrong
        }
    }

    // Keep track of the selected answers
    clicked.push(ans.innerText);
    console.log(clicked);

    // Sets a delay so that the player can see the correct answer and their picked answer
    setTimeout(function() {
        // Goes to the next question or final screen
        questionNumber++;
        if (questionNumber <= 10) {
            gen.changeQuestion();
            loadText();
        } else {
            // TODO: remove below and replace with transition to score screen
            localStorage.setItem("score", score);
            localStorage.setItem("Clicked Answers", JSON.stringify(clicked));
            window.location.href = window.location.origin + "/results.html";
        }
    }, 1000); //1 second delay

 }