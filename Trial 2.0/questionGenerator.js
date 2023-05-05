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
        console.log("Set Answer Below \n ------------------------");
        let maxRange = this.curQuestion.max;
        let number = 0;

        console.log("Current Question:")
        console.log(this.curQuestion);
        const items = this.apiResponseMap.get(this.curQuestion.apiCall).items;

        // if maxRange is -1, set to 20
        // if maxRange is not -1. set "number" to pseudo-random number within range (greater chance for lower numbers)
        // if items.length is less than maxRange, set maxRange to items.length
        if (maxRange === -1) {
            number = 0;
            maxRange = Math.min(items.length, 20);
        } else {
            maxRange = Math.min(items.length, maxRange);
            number = Math.floor(Math.pow((Math.random() * maxRange), 2) / (maxRange));
        }
        this.curQuestion.question = this.curQuestion.question.replace("_", number + 1); // add chosen random number to question if necessary
        console.log(this.curQuestion);
        
        const id = this.curQuestion.id;

        // reset current answer & non-answers
        // this.curAnswer = this.findAnswer(id, number);
        this.curNonAnswers = [];

        let usedNumbers = [number];
        if (this.apiResponseMap.get(this.curQuestion.apiCall).items.length < 5) {
            throw new Error("Go listen to more spotify you dumb!");
        }
        while (usedNumbers.length < 4) {
            console.log("(WHILE LOOP)");
            let offNumber = Math.floor(Math.random() * maxRange);
            if (!usedNumbers.includes(offNumber)) {
                // this.curNonAnswers.push(this.findAnswer(id, offNumber));
                usedNumbers.push(offNumber);
            }
        }

        console.log("numbers: " + usedNumbers);

        [this.curAnswer, ...this.curNonAnswers] = this.findAnswer(id, usedNumbers);
        // temp = this.findAnswer(id, usedNumbers);
        // this.curAnswer = temp.answer;
        // this.curNonAnswers = temp.nonAnswer

        console.log("Current answer:");
        console.log(this.curAnswer);
        console.log("Current NonAnsers:");
        console.log(this.curNonAnswers);
        console.log("------------------------");
    }

    /**
     * Uses the information from the Spotify API to return the answer to a given question.
     * @param {number} questionID ID of the question to get the answer for.
     * @param {array} numbers The numeric modifier to the question. Index 0 is correct answer modifier,
     *                        rest are non-answers.
     * @returns {Object} Returns all four answers/non-answers. {answer: "", nonAnswers: ["","",""]}
     */
    findAnswer(questionID, numbers) {
        // TODO: add code here
        let result = [];

        switch (questionID) {
            case 1:
            case 11:
                for (let i = 0; i < 4; i++) {
                    result.push(this.apiResponseMap.get(this.curQuestion.apiCall).items[numbers[i]]);
                }
                break;
            case 2:
                for (let i = 0; i < 4; i++) {
                    result.push(this.apiResponseMap.get("tracks-long-50").items[numbers[i]]);
                }
                for (let i = 1; i < 4; i++) {
                    if (result[i].popularity > result[0].popularity) {
                        let temp = result[0];
                        result[0] = result[i];
                        result[i] = temp;
                    }
                }
                for (let i = 0; i < 4; i++) {
                    console.log(`#${i}: Name: ${result[i].name} Popularity: ${result[i].popularity}`);
                }
                break;
            case 3: 
                for (let i = 0; i < 4; i++) {
                    result.push(this.apiResponseMap.get("artists-long-50").items[numbers[i]]);
                }
                break;
            case 4:
                // Which artist appears most in your top _ songs?
                let artistMap = new Map();
                let api = this.curQuestion.apiCall;
                for (song in this.apiResponseMap.get(api).items.splice(0, numbers[0] + 1)) {
                    for (artist in song.artists) {
                        let name = artist.name;
                        if (!artistMap.has(name)) {
                            artistMap.set(name, 0);
                        }
                        artistMap.set(name, artistMap.get(name) + 1);
                    }
                }

                let maxNum = 0;
                let maxArtist = "";
                artistMap.forEach (function(value, key) {
                    if (maxNum < value) {
                        maxArtist = key;
                    }
                });

                result.push(maxArtist);
                // TODO: get wrong answers in a better way than just changing number.
                break;
            default:
                result = ["Correct Answer", "Bad Answer", "Terrible Answer", "Pitiful Answer"];
                break;
        }
        // console.log("Result:");
        // console.log(result);
        return result;
    }

    /**
     * Sets this.curQuestion to a question from this.questions and removes that question from the list.
     */
    pickQuestion() {
        if (this.questions.length === 0) {
            throw new Error("QuestionGen: There are no questions left in this.questions");
        }
        if (this.questions !== undefined) {
            this.curQuestion = this.questions.splice(Math.floor(Math.random() * this.questions.length), 1)[0];
        }
    }

    /**
     * Gets data from the spotify API and stores it in apiResponseMap.
     */
    getApiData() {
        const types = ["tracks-long-50", "artists-long-50", "playlists-50"];
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