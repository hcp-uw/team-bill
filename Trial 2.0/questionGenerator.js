import { callApi, callApiSync, TOPTRACKS, TOPARTIST, PLAYLISTS, GET_PLAYLIST } from "./spotify.js";

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
        this.apiResponseMap = new Map();
        this.getApiData();

        // Checking Basic Preconditions
        // if (this.apiResponseMap.get("tracks-long-50").items.length < 10 ||
        //     this.apiResponseMap.get("artists-long-50").items.length < 5) {
        //         throw new Error("Basic Preconitions are not met." + 
        //                         " Must have more than 9 top songs and more than 4 top artists ");
        // }

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
        let minRange = this.curQuestion.min;
        let number = 0;
        
        console.log("Current Question:")
        console.log(this.curQuestion);
        const items = this.apiResponseMap.get(this.curQuestion.apiCall).items;

        // Checking preconditions
        if (this.apiResponseMap.get(this.curQuestion.apiCall).items.length < 4) {
            throw new Error("Go listen to more spotify you dumb!");
        } else if (maxRange < minRange && maxRange !== -1) {
            throw new Error("Question is defined wrongly. max should be larger than min unless max = -1");
        }

        // if maxRange is -1, set to either 20 or the length of items, which ever is smaller
        // if maxRange is not -1. set "number" to pseudo-random number within range (greater chance for lower numbers)
        // if items.length is less than maxRange, set maxRange to items.length
        if (maxRange === -1) {
            number = 0;
            maxRange = Math.min(items.length, 20);
        } else {
            maxRange = Math.min(items.length, maxRange);
            const range = maxRange - minRange + 1;
            number = Math.floor((Math.pow((Math.random() * (range)), 2) / (range)) + minRange);
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
            return;
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

        switch (questionID) { // TODO: check/make preconditions for every case
            case 1: // What is your #_ most listened to song?
            case 3: // Who is your top artist?
            case 11: // Who is your #_ artist?
                result = this.getItems(numbers, true);
                break;
            case 2: // Which of these songs is the most popular?
                result = this.getItems(numbers, false);
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
                    result[i] = result[i].name;
                }
                break;
            case 4: // Which artist appears most in your top _ songs?
            case 8: // hich album appears most in your top _ songs?
                // Zack TODO
                let itemMap = new Map();
                const trackList = this.apiResponseMap.get("tracks-long-50").items; 

                // Checking preconditions
                if (trackList.length <= numbers[0]) {
                    throw new Error(`Precondition not met for question ID 8. The first number in numbers 
                    must be less than the number of top tracks. In this case ${number[0]} is not less 
                    than ${trackList.length}`);
                }

                // Making a count map of the specific type of item we are looking at.
                for (let i = 0; i <= numbers[0]; i++) {
                    const track = trackList[i];
                    if (questionID === 4) {
                        for (let j = 0; j < track.artists.length; j++) {
                            const artist = track.artists[j];
                            const name = artist.name;
                            if (!itemMap.has(name)) {
                                itemMap.set(name, 0); 
                            }
                            itemMap.set(name, itemMap.get(name) + 1);
                        }
                    } else { // questionID = 8
                        const name = track.album.name;
                        console.log(name);
                        if (!itemMap.has(name)) {
                            itemMap.set(name, 0); 
                        }
                        itemMap.set(name, itemMap.get(name) + 1); 
                    }
                }

                // Get max from map artistMap
                let maxNum = 0;
                let maxItem = "";
                itemMap.forEach (function(value, key) {
                    if (maxNum < value) {
                        maxItem = key;
                        maxNum = value;
                    }
                });

                if (maxNum === 1) {
                    result.push("None, They're all even");
                } else {
                    result.push(maxItem);
                    result.push("None, They're all even");
                }

                if (questionID === 4) {
                    const wrongAnswers = this.getRandomTopArtist(result[0], 4 - result.length);
                    result = result.concat(wrongAnswers);
                } else { // questionID = 8
                    // Since we can't just pick from a top album list we have to find some in their top items.

                    // This loops over every top track and looks at their album. From that it gets the first
                    // 4 unique items. It would be good to use a set in this case but since we have to return
                    // an ordered array we have to use an array.
                    for (let i = 0; i < trackList.length && result.length < 4; i++) {
                        let album = trackList[i].album.name;
                        if (!result.includes(album)) {
                            result.push(album);
                        }
                    }

                    // This is the case that 4 albums were not found. In that case we can't complete the question
                    if (result.length !== 4) {
                        return []
                    }
                }
                
                break;
            case 5: // Kristen TODO: How many different artists are in your top #_ songs?
                // TODO: Correct answer - change to set 
                let diffArtists = new Array();
                for(let i = 0; i <= numbers[0]; i++) {
                    const curTrack = this.apiResponseMap.get("tracks-long-50").items[i]; //get the track at this iteration
                    const artist = curTrack.artists[0].name; //get the primary artist of this track
                    if(!(diffArtists.includes(artist))) {
                        diffArtists.push(artist);
                    }     
                }
                const ans = diffArtists.length;
                result.push(ans);

                //Slightly off answers - randomly add or subtract from correct answer by 1,2,3 (might be a prpblem with low amt)
                //function that gives out random number function
                for(let i = 0; i < 3; i++) {
                    let differences = [-3, -1, -2, 1, 2, 3];
                    const choose = getRandomWhole(0, differences.length);
                    result.push(ans + differences[choose]);
                }
                break; 
            case 6: // Kristen TODO: Which artist appears most in your playlists?
                // ?? should we include followed and created 
                // NOTE: A track could be null, do a null check
                // TODO: change this to instead keep track of the href of each * playlist * rather than each track. Call API for each playlist.
                    // API URL: GET_PLAYLIST + playlists[i].href

                // Correct answers
                let length = this.apiResponseMap.get("playlists-50").total;
                const playlists = this.apiResponseMap.get("playlists-50").items;
                let mapArtists = new Map();
                let max = 0; // max number of appearances
                for(let i= 0; i<length; i++) {
                    trackCollection = playlists.items[i].tracks;
                    for(let j = 0; j< trackCollection.total; j++) {
                        let trackLink = trackCollection.href;
                        if(track !== null) {
                            // if artist is already there, add tally

                            // if artist is not already there, add with new value 1

                            // check if this artist is the new max or not

                        }
                    }
                }
                result.push(max);

                // slightly off answers - either calculate here, or in the nested loop keep the top 4 stored

                break;
            case 7: // Kristen TODO
                break;
            case 9: // Helena TODO
                break;
            case 10: // TODO
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
     * Using the current question and apiResponseMap, it finds the items or names at the given indexes
     * @param {Array<number>} indexes A list of indexes (numbers) that must be valid indexes of the
     *                                item list of the current apiCall.
     * @param {Boolean} getNames A boolean used to determine to return the whole item or just the 
     *                           names
     * @returns {Array<items>} Returns the items at the indexes of the API Response for the current
     *                         question. If getNames is true then instead of a list of items it 
     *                         will return a list of the name of each item. The order of items/names 
     *                         returned will be the same as the order given in indexes. 
     */
    getItems(indexes, getNames) {
        let result = []
        for (let i = 0; i < indexes.length; i++) {
            let index = indexes[i];
            let apiResponse = this.apiResponseMap.get(this.curQuestion.apiCall); 
            // Checking precondition.
            if (index >= apiResponse.items.length) {
                throw new Error(`All values in indexes must be valid indexes in the current API responce. 
                                ${index} was not a valid input.`);
            }
            if (getNames) {
                result.push(apiResponse.items[index].name);
            } else {
                result.push(apiResponse.items[index]);
            }
        }
        return result;
    }

    /**
     * Takes in a correct artist and returns 3 other artist from the top artist that are not the
     * correct artist.
     * @param {string} correctArtist The correct artist that will not be included in the random 
     *                               artist.
     * @param {number} amount The number of artists to return.
     * @returns A list with length amount of artist names from the top artists not including 
     *          correctArtist.
     */
    getRandomTopArtist(correctArtist, amount) {
        let result = [correctArtist];
        let i = 0;
        while (result.length < amount + 1) {
            const artist = this.apiResponseMap.get("artists-long-50").items[i]
            if (result[0] !== artist.name) {
                result.push(artist.name);
            }
            i = i + 1;
        }
        result.splice(0, 1);
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
        const DEBUG = false;
        if (DEBUG) {
            this.curQuestion = this.questions.splice(3, 1)[0];
        } else {
            this.curQuestion = this.questions.splice(Math.floor(Math.random() * this.questions.length), 1)[0];
        }
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


}

/**
     *  
     * Gets a random number between a given range, inclusive on front, exclusive on end
     * @param {number} min minimum number of range (inclusive)
     * @param {number} max maximum number of range (exclusive)
     * @returns {number} random number in given range
     */
function getRandomWhole(min, max) {
    return Math.floor(Math.random() * (max-min)) + min;
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
        return new simpleQuestionGen(questions);
    })
}