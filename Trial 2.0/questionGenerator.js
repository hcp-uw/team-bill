import { callApi, callApiSync, TOPTRACKS, TOPARTIST, PLAYLISTS, GENRE_REC } from "./spotify.js";

const DEBUG = true; // debugging boolean to use in the future for console logs, etc. -- don't need to keep I just included it if certain console logs get annoying

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
        //     this.apiResponseMap.get("artists-long-50").items.length < 10) {
        //         throw new Error("Basic Preconitions are not met." + 
        //                         " Must have at least 10 top songs and top artists ");
        // }

        this.changeQuestion();
    }

    getQuestion = () => { return this.curQuestion.question };
    getAnswer = () => { return this.curAnswer };
    getNonAnswers = () => { return this.curNonAnswers };

    changeQuestion = () => {
        this.pickQuestion();
    }

    /**
     * Set answer and non answer fields to correct values
     * @requires this.question is not undefinded and is a valid question.
     * @modifies question, curAnswer, curNonAnswer
     * @effects question will have any _ replace with the chosen number.
     *          curAnswer will be equal to the answer to the question.
     *          curNonAnswer will be a list of 3 non answers to the question.
     */
    setAnswers() {
        if (DEBUG) console.log("Set Answer Below \n ------------------------");
        let maxRange = this.curQuestion.max;
        let minRange = this.curQuestion.min;
        let number = 0;
        
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
        this.curQuestion.question = this.curQuestion.question.replace("_", number); 
        if (DEBUG) console.log(this.curQuestion);

        // Chooses 3 other "off numbers" to use in finding the wrong answers to the question.
        // These numbers are chosen at randon between 0 and maxRange and there are no duplicate 
        // numbers including the correct number chosen above.
        let usedNumbers = [number];
        while (usedNumbers.length < 4) {
            if (DEBUG) console.log("(WHILE LOOP)");

            let offNumber = Math.floor(Math.random() * maxRange);
            if (!usedNumbers.includes(offNumber)) {
                // this.curNonAnswers.push(this.findAnswer(id, offNumber));
                usedNumbers.push(offNumber);
            }
        }


        if (DEBUG) console.log("numbers: " + usedNumbers);

        // reset current answer & non-answers
        this.curNonAnswers = [];

        const id = this.curQuestion.id;
        [this.curAnswer, ...this.curNonAnswers] = this.findAnswer(id, usedNumbers);
        if (this.curAnswer === undefined) {
            if (DEBUG) throw new Error(`Question ID ${id} returns undefined answer.`);
            console.error(`Question ID ${id} returns undefined answer.`);
            this.pickQuestion();
            return;
        }
        this.curNonAnswers.forEach(nonAns => {
            if (nonAns === undefined) {
                if (DEBUG) throw new Error(`Question ID ${id} returns undefined non-answer.`);
                console.error(`Question ID ${id} returns undefined non-answer.`);
                this.pickQuestion();
                return;
            }
        });

        if (DEBUG) {
            console.log("Current answer:");
            console.log(this.curAnswer);
            console.log("Current NonAnsers:");
            console.log(this.curNonAnswers);
            console.log("------------------------");
        }
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

        /** "items" array from top tracks API call */
        const trackList = this.apiResponseMap.get("tracks-long-50").items;

        /** "items" array from top artists API call */
        const artistList = this.apiResponseMap.get("artists-long-50").items;

        /** "genres" array from recommended genres API call */
        const genreList = this.apiResponseMap.get("genre-recs").genres;

        switch (questionID) { // TODO: check/make preconditions for every case
            case 1: // What is your #_ most listened to song?
            case 3: // Who is your top artist?
            case 11: { // Who is your #_ artist?
                result = this.getItems(numbers, true);
                break;
            }
            case 2: // Which of these songs is the most popular?
            case 10: // Which of these artists is the most popular?
            case 17: // Which of these songs is the least popular?
            case 18: {// Which of these artist is the least popular?
                result = this.getItems(numbers, false);
                for (let i = 1; i < 4; i++) {
                    if (((questionID === 2 || questionID == 10) && result[i].popularity > result[0].popularity) || 
                        ((questionID === 17 || questionID === 18)&& result[i].popularity < result[0].popularity)) {
                        // Swaping index 0 and i
                        let temp = result[0];
                        result[0] = result[i];
                        result[i] = temp;
                    }
                }
                for (let i = 0; i < 4; i++) {
                    if (DEBUG) console.log(`#${i}: Name: ${result[i].name} Popularity: ${result[i].popularity}`);
                    result[i] = result[i].name;
                }
                break;
            }
            case 4: // Which artist appears most in your top _ songs?
            case 8: { // Which album appears most in your top _ songs?
                // Zack TODO
                let itemMap = new Map();

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
                        if (DEBUG) console.log(name);
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
            }
            case 5: { // Kristen TODO: How many different artists are in your top #_ songs?
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
                    const choose = getRandomInt(0, differences.length);
                    result.push(ans + differences[choose]);
                }
                break; 
            }
            case 6: { // Kristen TODO: Which artist appears most in your playlists?
                // TODO: change this to instead keep track of the href of each * playlist * rather than each track. Call API for each playlist.
                    // API URL: GET_PLAYLIST + playlists[i].href

                //miserable miserable question - can we edit it to be "Top artist in *specific playlist* or something like that. This will break :,(

                // Correct answers
                const playlists = this.apiResponseMap.get("playlists-50").items;
                let mapArtists = new Map();
                let trackCollection = playlists.items[i].tracks;
                let maxArtist = trackCollection[0]; // h
                for(let i= 0; i<length; i++) {
                    trackCollection = playlists.items[i].tracks;
                    for(let j = 0; j< trackCollection.total; j++) {
                        const data = callApiSync(trackCollection[j].href, null); //sketchy please help
                        console.log(data);
                        if(track !== null) {
                            
                            if(mapArtists.has(data)) {
                                mapArtists.set(data, mapArtists.get(data)+1);
                            }
                            else {
                                mapArtists.set(data, 1);
                            }
                            
                            if(mapArtists.get(maxArtist) < mapArtists.get(data)) {
                                maxArtist = data;
                            }

                        // check if this artist is the new max or not

                        }
                    }
                }
                result.push(max);

                // slightly off answers - either calculate here, or in the nested loop keep the top 4 stored

                break;
            }
            case 7: { //"What is your most common genre in your top ten artists?"
                //Correct answer
                let comGenres = new Map();
                let maxGenre = artistList[0].genres[0];
                for (let i = 0; i < 6; i++) {
                    let genre = artistList[i].genres[0];
                    if (!comGenres.has(genre)) { 
                        comGenres.set(genre, 0);
                    }
                    comGenres.set(genre, comGenres.get(genre) + 1);

                    //find max
                    if (comGenres.get(maxGenre) < comGenres.get(genre)) maxGenre = genre;
                    
                }
                result.push(maxGenre);

                //Incorrect Answers
                // Finding in top artist
                for(let i = 0; i < artistList.length && result.length !== 4; i++) {
                    if(!result.includes(artistList[i].genres[0])) {
                        result.push(artistList[i].genres[0]);
                    }
                }
                
                // Finding in genre recs
                if (result.length < 4) {
                    let genres = genreList.slice(0, genreList.length);

                    while (result.length < 4) {
                        const rand = getRandomInt(0, genres.length);
                        const genre = genres.splice(rand, 1)[0];
                        if (!result.includes(genre)) {
                            result.push(genre);
                        }
                        if (genres.length === 0) {
                            throw new Error("Ran out of genre recs.")
                        }
                    }
                    // result.length == 4
                
                }

                break;
            }
            case 9: { // Helena: How many of your top _ songs are explicit?
                // Precondition check: at least top 3 songs
                if (numbers[0] <= 2) {
                    throw new Error(`Precondition not met for question ID 9. Must be at least top 3 songs to have 4 unique answers, not top ${number[0]}`);
                }

                // Precondition check: correct index less than number of top tracks
                if (trackList.length <= numbers[0]) {
                    throw new Error(`Precondition not met for question ID 9. The first number in numbers 
                    must be less than the number of top tracks. In this case ${number[0]} is not less 
                    than ${trackList.length}`);
                }

                let numExplicit = 0;
                for (let i = 0; i < numbers[0]; i++) {
                    const track = trackList[i];
                    if (DEBUG) console.log(track.name + " is explicit?: " + track.explicit);
                    if (track.explicit) numExplicit++;
                }
                if (DEBUG) console.log("expected num explicit: " + numExplicit);

                result.push(numExplicit);

                // TODO: implement this using getRandomAround (if applicable), or some other helper function we might make
                let possibleAnswers = [];
                for (let i = 0; i <= numbers[0]; i++) {
                    possibleAnswers.push(i);
                }
                possibleAnswers.splice(possibleAnswers.indexOf(numExplicit), 1);

                for (let i = 0; i < 3; i++) {
                    const randIndex = getRandomInt(0, possibleAnswers.length + 1);
                    const wrongAnswer = possibleAnswers[randIndex];
                    possibleAnswers.splice(randIndex, 1);
                    result.push(wrongAnswer);
                }
                
                break;
            }
            case 12: { // Colin: Which album is this song from?

                // Precondition check: If all top songs are from the same album
                let uniqueAlbums = 0;
                let curAlbums = [];
                const items = this.apiResponseMap.get(this.curQuestion.apiCall).items;
                const maxRange = Math.min(items.length, 50);
                for (let i = 0; i < maxRange; i++) {
                    if (!curAlbums.includes(trackList[i].album)) {
                        curAlbums.push(trackList[i].album);
                        uniqueAlbums++;
                    }
                } 
                if (uniqueAlbums < 4) {
                    throw new Error(`Precondition not met for question ID 12.
                     There are not enough unique albums. Unique Albums: ${uniqueAlbums}`);
                } 

                const track = trackList[numbers[0]];
                result.push(track.album.name);
                let curTrackName = trackList[numbers[1]].album.name;
                for (let i = 1; i < 4; i++) {
                    if (!result.includes(curTrackName)) {
                        result.push(curTrackName);
                    }
                }
                
                let rand = getRandomInt(1, maxRange);
                while (result.length !== 4){
                    if (!result.includes(curTrackName)){
                        result.push();
                    }
                    // if (trackList[numbers[rand]] !== undefined){
                        curTrackName = trackList[numbers[rand]].album.name;
                    // }
                }

                // Changes the question to include the song it is asking about
                this.curQuestion.question = this.curQuestion.question.replace("-", trackList[numbers[0]].name); 

                break;
            }
            case 13: // Helena: What is the shortest song in your top ten?
            case 14: { // What is the longest song in your top ten?
                
                // precondition check: they have at least 10 top songs
                if (trackList.length < 10) {
                    if (DEBUG) throw new Error(`Question ID ${questionID}: Cannot have "top ten" without ten top songs`);
                    break;
                }
                
                // initially set correct answer to first song
                let corrInd = 0;
                let corrDur = trackList[corrInd].duration_ms;
                // loop through top ten songs and update correctTrack/Dur
                for (let i = 1; i < 10; i++) {
                    const currDur = trackList[i].duration_ms;
                    if ((questionID === 13 && currDur < corrDur) || (questionID === 14 && currDur > corrDur)) {
                        corrInd = i;
                    }
                }
                result[0] = trackList[corrInd].name;
                let currNonIndexes = [corrInd];
                for (let i = 0; i < 3; i++) {
                    const nonIndex = getRandomAround(currNonIndexes, 1, 10);
                    currNonIndexes.push(nonIndex);
                    result.push(trackList[nonIndex].name);
                }
                
            }
            case 15:   // Which of these songs was released the longest time ago?
            case 16: { // Which of these songs was released most recently?
                // this is going to be dumb but stay with me
                const items = this.getItems(numbers, false);
                const urlList = [];
                items.forEach((item) => {
                    urlList.push(items.href);
                });

                const newItems = this.apiCallGetItems(urlList);

                break;
            }
            default: {
                result = ["Correct Answer", "Bad Answer", "Terrible Answer", "Pitiful Answer"];
                break;
            }
        }
        // console.log("Result:");
        // console.log(result);
        return result;
    }

    /**
     * Using the current question and apiResponseMap, it finds the items or names at the given indexes
     * @param {Array<number>} indexes A list of indexes (numbers) that must be valid indexes of the
     * item list of the current apiCall.
     * @param {Boolean} getNames A boolean used to determine to return the whole item or just the 
     * names
     * @returns {Array<items>} Returns the items at the indexes of the API Response for the current
     * question. If getNames is true then instead of a list of items it will return a list of the 
     * name of each item. The order of items/names returned will be the same as the order given in 
     * indexes. 
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
     * 
     * @param {string[]} urlList A list of urls (strings) that are the address to the api call for
     * a spotify item.
     * @returns The list of spotify items returned by the api call.
     */
    apiCallGetItems(urlList) {
        let result = [];
        urlList.forEach((val) => {
            result.push(callApiSync(val))
        });
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
     * @modifies questions, question, curAnswer, curNonAnswer
     * @effects questions will have question removed from it.
     *          question will be a randomly chosen question from questions.
     *          curAnswer will be equal to the answer to that question.
     *          curNonAnswer will be a list of 3 non answers to that question.
     */
    pickQuestion() {
        if (this.questions === undefined) {
            throw new Error("QuestionGen: this.questions must be defined before calling pickQuestion");
        } else if (this.questions.length === 0) {
            throw new Error("QuestionGen: There are no questions left in this.questions");
        }

        if (DEBUG) {
            const questionID = 12; // The question ID you want to test
            this.curQuestion = this.questions.splice(questionID - 1, 1)[0];
        } else {
            this.curQuestion = this.questions.splice(Math.floor(Math.random() * this.questions.length), 1)[0];
        }
        if (DEBUG) {
            console.log("Current Question:")
            console.log(this.curQuestion);
        } 
        this.setAnswers();
    }

    /**
     * Gets data from the spotify API and stores it in apiResponseMap.
     * @modifies apiResponseMap
     * @effects apiResponseMap stores the general API calls needed for the game with the key 
     *          being the call descriptions
     */
    getApiData() {
        const types = ["tracks-long-50", "artists-long-50", "playlists-50", "genre-recs"];
        const urls = [TOPTRACKS + "?limit=50&time_range=long_term", TOPARTIST + "?limit=50&time_range=long_term", PLAYLISTS + "?limit=50", GENRE_REC];
        for (let i = 0; i < types.length; i++) {
            const data = callApiSync(urls[i], null);
            this.apiResponseMap.set(types[i], data);
        }
        console.log(this.apiResponseMap);
    }
}

/**
 * Gets a random number between a given range, inclusive on front, exclusive on end
 * @param {number} min minimum number of range (inclusive)
 * @param {number} max maximum number of range (exclusive)
 * @returns {number} random number in given range
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max-min)) + min;
}

/**
 * Returns a random number x around a number in a given range.
 * @param {number[]} num List of numbers x should not be
 * @param {number} min Min value x can be (inclusive)
 * @param {number} max Max value x can be (inclusive)
 * @returns x such that num - range <= x <= num + range, x != num and x >= 0 
 */
function getRandomAround(num, min, max) {
    if (max < min) {
        throw new Error('min must be smaller than max');
    }
    const possible_answers = [];
    for (let i = min; i <= max; i++) {
        possible_answers.push(i);
    }

    num.forEach((val) => {
        const index = possible_answers.indexOf(val);
        possible_answers.splice(index, 1);
    });
    
    const resultIndex = getRandomInt(0, possible_answers.length);
    return possible_answers[resultIndex];
}
/**
 * Compres two dats in format "xxxx-xx-xx"
 * @param {string} date1 
 * @param {string} date2 
 * @returns date1 > date2 
 */
function compareDates(date1, date2) {
    const dateList1 = date1.split('-');
    const dateList2 = date2.split('-');
    
    if (dateList1[0] > dateList2[0]) {
        return true;
    } else if (dateList1[0] < dateList2[0]) {
        return false
    } else {
        if (dateList1[1] > dateList2[1]) {
            return true;
        } else if (dateList1[1] < dateList2[1]) {
            return false
        } else {
            if (dateList1[2] > dateList2[2]) {
                return true;
            } else {
                return false
            }
        }
    }
}

/**
 * Factory function for a question gen.
 * @param {Array<question>} questions The list of questions to build the questionGen off of.
 * If none are given it defaults to a premade list of questions.
 * @returns {Promise} Returns a promise with a new questionGen.
 */
export function makeQuestionGen() {
    // read local JSON file in javascript
    let myPromise = fetch("./questions.json")
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        //console.log(data);
        var questions = data.questionsList;
        return new simpleQuestionGen(questions);
    })
    return myPromise;
}