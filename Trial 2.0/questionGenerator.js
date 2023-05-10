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
    }

    /**
     * Set answer and non answer fields to correct values
     */
    setAnswers() {
        console.log("Set Answer Below \n ------------------------");
        let maxRange = this.curQuestion.max;
        let number = 0;
        
        console.log("Current Question:")
        console.log(this.curQuestion);
        const items = this.apiResponseMap.get(this.curQuestion.apiCall).items;

        if (this.apiResponseMap.get(this.curQuestion.apiCall).items.length < 4) {
            throw new Error("Go listen to more spotify you dumb!");
        }

        // if maxRange is -1, set to either 20 or the length of items, which ever is smaller
        // if maxRange is not -1. set "number" to pseudo-random number within range (greater chance for lower numbers)
        // if items.length is less than maxRange, set maxRange to items.length
        if (maxRange === -1) {
            number = 0;
            maxRange = Math.min(items.length, 20);
        } else {
            maxRange = Math.min(items.length, maxRange);
            number = Math.floor(Math.pow((Math.random() * maxRange), 2) / (maxRange));
        }
        // Adds chosen random number to the question if necessary
        this.curQuestion.question = this.curQuestion.question.replace("_", number + 1); 
        console.log(this.curQuestion);

        // Chooses 3 other "off numbers" to use in finding the wrong answers to the question.
        // These numbers are chosen at randon between 0 and maxRange and there are no duplicate 
        // numbers including the correct number chosen above.
        let usedNumbers = [number];
        while (usedNumbers.length < 4) {
            console.log("(WHILE LOOP)");
            let offNumber = Math.floor(Math.random() * maxRange);
            if (!usedNumbers.includes(offNumber)) {
                // this.curNonAnswers.push(this.findAnswer(id, offNumber));
                usedNumbers.push(offNumber);
            }
        }

        console.log("numbers: " + usedNumbers);

        // reset current answer & non-answers
        this.curNonAnswers = [];

        const id = this.curQuestion.id;
        [this.curAnswer, ...this.curNonAnswers] = this.findAnswer(id, usedNumbers);
        if (this.curAnswer === undefined) {
            console.log("Answer was not able to be found. Picking new question.")
            this.pickQuestion();
        }

        console.log("Current answer:");
        console.log(this.curAnswer);
        console.log("Current NonAnsers:");
        console.log(this.curNonAnswers);
        console.log("------------------------");
    }

    /**
     * Uses the information from the Spotify API to return the answer to a given question.
     * @param {number} questionID ID of the question to get the answer for.
     * @param {Array<number>} numbers The numeric modifier to the question. Index 0 is correct answer modifier,
     *                        rest are non-answers.
     * @returns {Object} Returns all four answers/non-answers. {answer: "", nonAnswers: ["","",""]}
     */
    findAnswer(questionID, numbers) {
        // TODO: add code here
        let result = [];

        switch (questionID) {
            case 1:
                //What is your #_ most listened to song?
                break;
            case 3:
            case 11:
                result = this.getItems(numbers);
                break;
            case 2:
                result = this.getItems(numbers);
                for (let i = 1; i < 4; i++) {
                    if ((questionID === 2 && result[i].popularity > result[0].popularity) || 
                        (questionID === 12 && result[i].popularity < result[0].popularity)) {
                        // Swaping index 0 and i
                        let temp = result[0];
                        result[0] = result[i];
                        result[i] = temp;
                    }
                }
                for (let i = 0; i < 4; i++) {
                    console.log(`#${i}: Name: ${result[i].name} Popularity: ${result[i].popularity}`);
                }
                break;
            case 4:
                if (artists.length < 4) {
                    this.pickQuestion();
                    break;
                }
                // Which artist appears most in your top _ songs?
                let artistMap = new Map();
                let api = this.curQuestion.apiCall;
                for (let song in this.apiResponseMap.get(api).items.splice(0, numbers[0] + 1)) {
                    for (artist in song.artists) {
                        let name = artist.name;
                        if (!artistMap.has(name)) {
                            artistMap.set(name, 0);
                        }
                        artistMap.set(name, artistMap.get(name) + 1);
                    }
                }

                // Get max from map artistMap
                let maxNum = 0;
                let maxArtist = "";
                artistMap.forEach (function(value, key) {
                    if (maxNum < value) {
                        maxArtist = key;
                    }
                });

                result.push(maxArtist);
                //wrong answers in a better way than just changing number.
                let i = 0;
                while (result.length < 4) {
                    let artist = this.apiResponseMap.get("artists-long-50").items[i]
                    if (result[0] !== artist) {
                        result.push(artist);
                    }
                    i = i + 1;
                }
                break;
            case 5:
                //How many different artists are in your top #_ songs?

                //Correct answer
                let artists = new Array();
                for(let i =0; i< this.curQuestion.number; i++) {
                    let curTrack = this.apiResponseMap.get("tracks-long-50").items[numbers[i]];
                    if(!(artists.includes(curTrack))) {
                        artists.push(curTrack);
                    }     
                }
                let ans = artists.length();
                result.push(ans);

                //slightly off answers - randomly add or subtract from correct answer by 1,2,3 
                for(let i= 0; i<3; i++)
                {
                    let choose = Math.random();
                    if(choose<0.5) {
                        //subtract
                        result.push(ans - getRandomWhole(1,3));
                    }
                    else {
                        //add
                        result.push(ans + getRandomWhole(1,3));
                    }
                }
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
     * Using the current question and apiResponceMap, it finds the items at the given indexes
     * @param {Array<number>} indexes A list of indexes (numbers) 
     * @returns {Array<items>} Returns the items at the indexes of the API Responce for the current
     *                         question. The order of items returned will be the same as the order
     *                         given in indexes. 
     */
    getItems(indexes) {
        let result = []
        for (let i = 0; i < indexes.length; i++) {
            result.push(this.apiResponseMap.get(this.curQuestion.apiCall).items[indexes[i]]);
        }
        return result;
    }

    /**
     * Sets this.curQuestion to a question from this.questions and removes that question from the list.
     */
    pickQuestion() {
        if (this.questions === undefined) {
            throw new Error("QuestionGen: this.questions must be defined before calling pickQuestion");
        } else if (this.questions.length === 0) {
            throw new Error("QuestionGen: There are no questions left in this.questions");
        }
        this.curQuestion = this.questions.splice(Math.floor(Math.random() * this.questions.length), 1)[0];
        this.setAnswers();
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

    /** 
    * Gets a random number between a given range, inclusive on both ends
    * @param {let} min minimum number of range 
    * @param {let} max maximum number of range
    * @returns {let} random number in given range
    */
    getRandomWhole(min, max) {
        return Math.floor(Math.random() * (max-min)) + min;
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