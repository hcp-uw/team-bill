import { callApi, callApiSync, TOPTRACKS, TOPARTIST } from "./spotify.js";

/**
 * @typedef question
 * 
 * @property {string} question 
 * @property {number} index
 * @property {number} id
 * @property {string} apiCall
 */

/**
 * @typedef questionGen
 * An object that stores a list of questions and constructors answers for each question based off 
 * of information from spotify's api.
 * 
 * @property {function getQuestion() {question}} getQuestion Returns the current question
 * @property {function getAnswer() {string}} getAnswer Returns the current answer
 * @property {function getNonAnswers() {Array<string>}} getNonAnswers Returns the current list of non answers
 * @property {function changeQuestion() {}} changeQuestion Changes the question
 */

class simpleQuestionGen {
    questions;
    curQuestion;
    curAnswer;
    curNonAnswers;

    // maps type of API call to response of that call
    apiResponseMap;

    /**
     * Constructs new simpleQuestionGen
     * @param {Array<question>} questions 
     */
    constructor(questions) {
        this.questions = questions;
        this.apiResponseMap = new Map();
        this.getApiData();
    }

    getQuestion = () => { return this.curQuestion.q };
    getAnswer = () => { return this.curAnswer };
    getNonAnswers = () => { return this.curNonAnswers };

    changeQuestion = () => { this.pickQuestion; }

    /**
     * Set answer and non answer fields to correct values
     */
    setAnswer() {
        const number = 1; // We need some way of choosing a number
        const id = this.curQuestion.id;

        this.curAnswer = this.findAnswer(id, number);

        this.curNonAnswers = [];
        const minRange = 1; // We should store and get these range values from the questions.
        const maxRange = 20;
        var usedNumbers = [number];
        while (this.curNonAnswers.length < 3) {
            let offNumber = Math.floor(Math.random() * (maxRange - minRange)) + minRange;
            if (!usedNumbers.includes(offNumber) && offNumber !== number) {
                this.curNonAnswers.push(this.findAnswer(id, offNumber));
            }
        }
    }

    /**
     * Gets data from the spotify API and stores it in apiResponseMap.
     */
    getApiData() {
        const types = ["tracks-long-50", "artist-long-50"];
        const urls = [TOPTRACKS + "?limit=50&time_range=long_term", TOPARTIST + "?limit=50&time_range=long_term" ];
        for (let i = 0; i < types.length; i++) {
            const data = callApiSync(urls[i], null);
            this.apiResponseMap.set(types[i], data);
        }
        console.log(this.apiResponseMap);
    }

    /**
     * Uses the information from the spotify api to answer a given question.
     * @param {number} questionID ID of the question to get the answer for.
     * @param {number} number The numeric modifier to the question.
     * @returns {string} Returns the answer to the question.
     */
    findAnswer(questionID, number) {
        // TODO: add code here
    }

    /**
     * Picks a question from questions at random and removes it.
     */
    pickQuestion() {
        this.curQuestion = questions.splice(Math.floor(Math.random() * questions.length-1), 1);
    }
    
}

/**
 * Factory function for a question gen.
 * @param {Array<question>} questions The list of questions to build the questionGen off of.
 * If none are given it defaults to a premade list of questions.
 * @returns {questionGen} Returns new questionGen.
 */
export function makeQuestionGen(questions) {
    if (questions === undefined) {
        // read local JSON file in javascript
        fetch("./questions.json")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            //console.log(data);
            questions = data.questionsList;
        })
    }
    return new simpleQuestionGen(questions);
}