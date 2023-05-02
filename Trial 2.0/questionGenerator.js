import { callApi, callApiSync, TOPTRACKS, TOPARTIST, PLAYLISTS } from "./spotify.js";

/**
 * @typedef question
 * 
 * @property {string} question
 * @property {number} max
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
    questions; // list of current possible questions (question is removed when it is added to curQuestion)
    curQuestion;
    curAnswer;
    curNonAnswers;
    apiResponseMap; // maps type of API call to (unfiltered) response of that call

    /**
     * Constructs new simpleQuestionGen
     * @param {Array<question>} questions 
     */
    constructor(questions) {
        this.questions = questions;
        console.log(this.questions);
        this.apiResponseMap = new Map();
        this.getApiData();
        this.changeQuestion();
    }

    getQuestion = () => { return this.curQuestion.q };
    getAnswer = () => { return this.curAnswer };
    getNonAnswers = () => { return this.curNonAnswers };

    changeQuestion = () => {
        this.pickQuestion();
        this.setAnswer();
    }

    /**
     * Set answer and non answer fields to correct values
     */
    setAnswer() {
        var maxRange = this.curQuestion.max;
        
        console.log(this.curQuestion)
        console.log(this.curQuestion.apiCall);
        const items = this.apiResponseMap.get(this.curQuestion.apiCall).items;
        if (maxRange === -1) {
            var number = 1;
            maxRange = 20;
            
            if(items.length < 20) {
                this.curQuestion.max = items.length;
            }  
        } else {
            if(items.length < 20) {
                this.curQuestion.max = items.length;
            }
            var number = Math.floor(Math.pow((Math.random() * maxRange), 2) / (maxRange)) + 1;
        }
        console.log(number);
        
        const id = this.curQuestion.id;

        this.curAnswer = this.findAnswer(id, number);
        this.curNonAnswers = [];

        var usedNumbers = [number];
        while (this.curNonAnswers.length < 3) {
            let offNumber = Math.floor(Math.random() * maxRange) + 1;
            if (!usedNumbers.includes(offNumber)) {
                this.curNonAnswers.push(this.findAnswer(id, offNumber));
                usedNumbers.push(offNumber);
            }
        }
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
        if(this.questions !== undefined) {
            this.curQuestion = this.questions.splice(Math.floor(Math.random() * this.questions.length), 1)[0];
        }
    }

    /**
     * Gets data from the spotify API and stores it in apiResponseMap.
     */
    getApiData() {
        const types = ["tracks-long-50", "artist-long-50", "playlist-50"];
        const urls = [TOPTRACKS + "?limit=50&time_range=long_term", TOPARTIST + "?limit=50&time_range=long_term", PLAYLISTS + "?limit=50"];
        for (let i = 0; i < types.length; i++) {
            const data = callApiSync(urls[i], null);
            this.apiResponseMap.set(types[i], data);
        }
        console.log(this.apiResponseMap);
    }
}

/**
 * Factory function for a question gen.
 * @param {Array<question>} questions The list of questions to build the questionGen off of.
 * If none are given it defaults to a premade list of questions.
 * @returns {questionGen} Returns new questionGen.
 */
export function makeQuestionGen() {
    // read local JSON file in javascript
    fetch("./questions.json")
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        //console.log(data);
        var questions = data.questionsList;
        console.log(questions)
        return new simpleQuestionGen(questions);
    })
}