import { callApi, callApiSync, TOPTRACKS, TOPARTIST, PLAYLISTS, GENRE_REC } from "./spotify.js";

const DEBUG = false; // debugging boolean to use in the future for console logs, etc. -- don't need to keep I just included it if certain console logs get annoying
const QUESTION_ID = 7; // The question ID you want to test
const SPLIT_MARKER = "*&*" // String to identify where to split between an answer and the artist. 
                           // We could change what the characters are later.

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
    storedQuestions; // list of past questions asked

    /**
     * Constructs new simpleQuestionGen
     * @param {Array<question>} questions 
     */
    constructor(questions) {
        this.storedQuestions = [];
        this.questions = questions;
        this.apiResponseMap = new Map();
        this.getApiData();

        // Checking Basic Preconditions
        // if (this.apiResponseMap.get("tracks-long-50").items.length < 10 ||
        //      this.apiResponseMap.get("artists-long-50").items.length < 10) {
        //         throw new Error("Basic Preconitions are not met." + 
        //                         " Must have at least 10 top songs and top artists ");
        // }

        this.changeQuestion();
    }

    getQuestion = () => { 
        return this.curQuestion.question 
    }
    getAnswer = () => { 
        if((this.curAnswer+"").includes(SPLIT_MARKER)) {
            return this.curAnswer.split(SPLIT_MARKER)[0];
        }
        return this.curAnswer;

    }

    getNonAnswers = () => { 
        const ret = [];        
        if((this.curNonAnswers[0]+"").includes(SPLIT_MARKER)) {
            for(let i =0; i<3; i++) {
                ret.push(this.curNonAnswers[i].split(SPLIT_MARKER)[0]);
            }
            return ret;
        }
        return this.curNonAnswers;
    }

    changeQuestion = () => {
        this.pickQuestion();
    }

    /**
     * Returns the secondary information for each answer
     * @returns an array that contains the secondary information of each answer, null if no secondary information
     * is needed for this answer set
     */
    getSecondary = () => { 
        if((this.curAnswer+"").includes(SPLIT_MARKER)) {
            const secondaryInfo = [];
            secondaryInfo.push(this.curAnswer.split(SPLIT_MARKER)[1]);
            for(let i = 0; i < 3; i++) {
                secondaryInfo.push(this.curNonAnswers[i].split(SPLIT_MARKER)[1]);
            }
            return secondaryInfo;
        }

        return null; 
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
            console.error("You do not have enough top items for this question!");
            this.pickQuestion();
            return;
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
            maxRange = Math.min(items.length-1, maxRange); 
            const range = maxRange - minRange + 1;
            number = Math.floor((Math.pow((Math.random() * (range)), 2) / (range)) + minRange);
        }
        //Add any question changes here
        // Adds chosen random number to the question if necessary
        this.curQuestion.question = this.curQuestion.question.replace("_", number + 1); 
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
            console.error(`Question ID ${id} returns undefined answer.`);
            this.pickQuestion();
            return;
        }
        this.curNonAnswers.forEach(nonAns => {
            if (nonAns === undefined) {
                console.error(`Question ID ${id} returns undefined non-answer.`);
                this.pickQuestion();
                return;
            }
        });

        if (DEBUG) {
            console.log("\n");
            console.log("Current answer:", this.curAnswer);
            console.log("Current NonAnsers:", this.curNonAnswers);
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
        let trackList;

        /** "items" array from top artists API call */
        let artistList;

        // Secondary Info of question. Should be a full sentence. Leave as null to not display.
        let secondaryInfo;

        // TESTING - Make sure it switches to correct api call.
        if (this.curQuestion.apiCall.endsWith('long-50')) {
            trackList = this.apiResponseMap.get("tracks-long-50").items;
            artistList = this.apiResponseMap.get("artists-long-50").items;
        } else {
            trackList = this.apiResponseMap.get("tracks-short-50").items;
            artistList = this.apiResponseMap.get("artists-short-50").items;
        }

        /** "genres" array from recommended genres API call */
        const genreList = this.apiResponseMap.get("genre-recs").genres;

        switch (questionID) { // TODO: check/make preconditions for every case
            
            case 1: // DONE: What is your #_ most listened to song?
            case 3: // DONE: Who is your top artist?
            case 11: // DONE: Who is your #_ artist?
            case 19: // TESTING: What is your #_ most listened to song in the last 4 weeks?
            case 21: // TESTING: Who is your top artist within the last 4 weeks?
            case 22: { // TESTING: Who is your #_ top artist in the last 4 weeks?
                let items = this.getItems(numbers, false);
                for (let i = 0; i < items.length; i++) {
                    result.push(finalResult(items[i]));
                }
                break;
            }
            case 2:  // DONE: Which of these songs is the most popular?
            case 10: // DONE : Which of these artists is the most popular?
            case 17: // DONE: Which of these songs is the least popular?
            case 18: // DONE: Which of these artist is the least popular?
            case 23: // TESTING: Which of these albums is the most popular?
            case 24: { // TESTING: Which of these albums is the least popular?
                if (questionID === 23 || questionID === 24) {
                    let urlList = [];
                    let numbersCopy = [...numbers] // I am making a copy of numbers since I later will mutate it.
                    
                    if (DEBUG) {
                        console.log("-----------------------");
                        console.log("Beginning with construction of urlList");
                    }

                    // Using numbers to make it more randomized than top 4 albums.
                    for (let i = 0; urlList.length !== 4; i++) {
                        if (DEBUG) console.log("Current i: " + i + " \nCurrent Numbers: " + numbersCopy + "\nCurrent UrlList Length: " + urlList.length);
                        // Checks to see if there are any numbers left to check.
                        if (i === this.curQuestion.max) {
                            console.error("Not enough non-single albums... skipping question");
                            return []; // We have to skip the question since there are not 4 ablums in your top 20 songs that are not singles
                        }

                        // Checks if we have reached the end of our list of numbers
                        if (numbersCopy.length === i) {
                            if (DEBUG) console.log("Adding New Random Number");
                            // Adds a new random number
                            let usedNumbers = [...numbersCopy];
                            usedNumbers.sort(function(a, b){return a - b}); // Sorts usedNumbers
                            let k = 0; // Current working index of usedNumbers
                            let aviableNumbers = []
                            // This for loop will generate a list of numbers that are not contained in usedNumber and goes
                            // from 0 to this.curQuestion.max
                            for (let j = 0; j < this.curQuestion.max - usedNumbers.length; j++) {
                                if (j > usedNumbers[k]) { 
                                    // Since usedNumbers is sorted if j is greated then the current usedNumber that means
                                    // That we have already passed it and can move onto the next number.
                                    k++;
                                }
                                if (j != usedNumbers[k]) {
                                    // If j does equal usedNumbers[k] then that means we must exclude it.
                                    aviableNumbers.push(j);
                                }
                            }
                            let offNumber = Math.floor(Math.random() * aviableNumbers.length);
                            numbersCopy.push(offNumber);
                        }

                        // Checks if the current number's album is a single, if so it skips it.
                        const num = numbersCopy[i];
                        if (trackList[num].album.album_type === "SINGLE") {
                            if (DEBUG) console.log("Skipping number " + num + " because it was a single");
                            continue;
                        }

                        // Adds url of album to urlList
                        const url = trackList[num].album.href;
                        if (!urlList.includes(url)) {
                            if (DEBUG) console.log("Adding url of " + trackList[num].album.name);
                            urlList.push(url);
                        } else {
                            if (DEBUG) console.log("Skipping number " + num + " because its album was already in the urlList");
                        }
                    }

                    if (DEBUG) {
                        console.log("Finish with construction of urlList");
                        console.log("-----------------------");
                    }

                    result = this.apiCallGetItems(urlList);
                } else {
                    result = this.getItems(numbers, false);
                }

                // if popularity of any of the options is way too low, assume there is some error with Spotify's data
                // and skip the question
                // TODO: can instead find another random option if we decide we don't want to skip from the get-go
                for (let i = 0; i < result.length; i++) {
                    if (DEBUG) console.log(`Name: ${result[i].name} Popularity: ${result[i].popularity}`);
                    if (result[i].popularity < 15) {
                        console.error("Popularity is too low, skipping question...");
                        return [];
                    }
                }

                for (let i = 1; i < 4; i++) {
                    if (((questionID === 2 || questionID == 10 || questionID == 23) && result[i].popularity > result[0].popularity) || 
                        ((questionID === 17 || questionID === 18 || questionID == 24)&& result[i].popularity < result[0].popularity)) {
                        // Swaping index 0 and i
                        let temp = result[0];
                        result[0] = result[i];
                        result[i] = temp;
                    }
                }
                for (let i = 0; i < 4; i++) {
                    result[i] = finalResult(result[i]);
                }
                break;
            }
            case 4: //DONE: Which artist appears most in your top _ songs?                              - Needs Secondary Info
            case 8: { // DONE: Which album appears most in your top _ songs?                            - Needs Secondary Info 
                let itemMap = new Map();

                // Checking preconditions: 
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
                            // const name = artist.name;
                            if (DEBUG) console.log(artist.name);
                            if (!itemMap.has(artist)) {
                                itemMap.set(artist, 0); 
                            }
                            itemMap.set(artist, itemMap.get(artist) + 1);
                        }
                    } else { // questionID = 8
                        // const name = track.album.name;
                        const album = track.album;
                        if (DEBUG) console.log(album);
                        if (!itemMap.has(album)) {
                            itemMap.set(album, 0); 
                        }
                        itemMap.set(album, itemMap.get(album) + 1); 
                    }
                }

                // Get max from map artistMap
                let maxNum = 0;
                let maxItem = "";
                let tied = false;
                itemMap.forEach (function(value, key) {
                    if (!tied) {
                        tied = value === maxNum;
                    }
                    if (maxNum < value) {
                        tied = false;
                        maxItem = key;
                        maxNum = value;
                    }
                });
                
                // If there is a tie we just skip the question else it makes it confusing to the user.
                if (tied) {
                    console.error("Tied on questionID: " + questionID+ ". Skipping question");
                    return [];
                }

                result.push(finalResult(maxItem));
                if (questionID === 4) {
                    secondaryInfo = "The song appeared " + maxNum + " times in your top " + (numbers[0] + 1) + " songs.";
                } else {
                    secondaryInfo = "The album appeared " + maxNum + " times in your top " + (numbers[0] + 1) + " albums.";
                }

                if (questionID === 4) {
                    const wrongAnswers = this.getRandomTopArtist(result[0].name, 4 - result.length);
                    for (let i = 0; i < wrongAnswers.length; i++) {
                        result.push(finalResult(wrongAnswers[i]));
                    }
                } else { // questionID = 8
                    // Since we can't just pick from a top album list we have to find some in their top items.

                    // This loops over every top track and looks at their album. From that it gets the first
                    // 4 unique items. It would be good to use a set in this case but since we have to return
                    // an ordered array we have to use an array.
                    for (let i = 0; i < trackList.length && result.length < 4; i++) {
                        let album = trackList[i].album;
                        if (!result.includes(finalResult(album))) {
                            result.push(finalResult(album));
                        }
                    }

                    // This is the case that 4 albums were not found. In that case we can't complete the question
                    if (result.length !== 4) {
                        return []
                    }
                }
                
                break;
            }
            case 5: { // DONE: How many different artists are in your top #_ songs?                     - Needs Secondary Info
                 
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
                // Finding secondary info
                if (ans <= 5) {
                    secondaryInfo = "The artists in your top " + (numbers[0] + 1) + " songs:";
                    for (let i = 0; i < ans; i++) {
                        secondaryInfo += "\n" + diffArtists[i];
                    }
                }

                //function that gives out random number function
                while(result.length < 4) {
                    let randN = getRandomAround(result, ans-3, ans+3) 
                    if(randN> 0) {
                        result.push(randN);
                    }
                }
                break; 
            }
            /*case 6: { // DONE: How many songs are there in your playlist named - ?
                
                const playlists = this.apiResponseMap.get("playlists-50").items;
                var userId = callApiSync("https://api.spotify.com/v1/me").id;
                for(let i = 0; i<playlists.length; i++) {
                    if(playlists[i].owner.id !== userId) {
                        playlists.splice[i, 1]; 
                    }
                }

                //Precondition: must have some number of playlists 
                if(playlists.length<=0) {
                    console.error("User does not have enough playlists");
                    return [];
                }

                //Correct Answer + Change question
                let playN = getRandomInt(0, playlists.length);
                let playlist = playlists[playN];
                this.curQuestion.question = this.curQuestion.question.replace("- ", "\"" + playlist.name + "\""); 
                let numTracks = playlist.tracks.total;
                result.push(numTracks);
                
                let min = getScaledNum(numTracks,3,0);
                if(min<0) {
                    min = 0;
                }

                //Incorrect answers
                while(result.length < 4) {
                    let max = getScaledNum(numTracks,3,numTracks);
                    result.push(getRandomAround(result, min, max));
                }

                break;
            }*/
            case 7: { //DONE: "What is your most common genre in your top ten artists?"                 - Needs Secondary Info
                //Correct answer
                let comGenres = new Map();
                let maxGenre = artistList[0].genres[0];
                for (let i = 0; i < 10; i++) {
                    if (artistList[i] === undefined) {
                        return [];
                    }
                    let genre = artistList[i].genres[0];
                    if (!comGenres.has(genre)) { 
                        comGenres.set(genre, 0);
                    }
                    comGenres.set(genre, comGenres.get(genre) + 1);

                    //find max
                    if (comGenres.get(maxGenre) < comGenres.get(genre)) maxGenre = genre;
                    
                }
                result.push(maxGenre);

                // Finding secondary Info
                secondaryInfo = "Artists that fall into the " + maxGenre + " genre:"
                for (let i = 0; i < 10; i++) {
                    if (artistList[i].genres[0] === maxGenre) {
                        secondaryInfo += "\n" + artistList[i].name;
                    }
                }

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
            case 9: { // DONE: How many of your top _ songs are explicit?                               - Needs Secondary Info
                // Check: at least top 3 songs
                if (numbers[0] <= 2) {
                    throw new Error(
                    `Error for question ID 9. Must be at least top 3 songs to have 4 unique answers, not top ${number[0]}`
                    );
                }
        
                // Check: correct index less than number of top tracks
                if (trackList.length <= numbers[0]) {
                    throw new Error(`Error for question ID 9. The first number in numbers array
                            must be less than the number of top tracks. In this case ${number[0]} is not less 
                            than ${trackList.length}`);
                }
        
                let numExplicit = 0;
                let explicitSongList = [];
                for (let i = 0; i < numbers[0]; i++) {
                    const track = trackList[i];
                    if (track.explicit) { 
                        numExplicit++;
                        explicitSongList.push(track.name + " by " + track.artists[0].name); 
                    }
                }
        
                result.push(numExplicit);

                // Finding secondary info
                if (numExplicit > 0 && numExplicit <= 5) {
                    secondaryInfo = "The explicit songs in your top " + (numbers[0] + 1) + " songs are:"
                    for (let i = 0; i < numExplicit; i++) {
                        secondaryInfo += "\n" + explicitSongList[i];
                    }
                }
        
                for (let i = 0; i < 3; i++) {
                    const wrongAnswer = getRandomAround(result, 0, numbers[0]);
                    result.push(wrongAnswer);
                }
                break;
            }
            case 12: { // TESTING: Which album is the song - from?
                return [];
                break;
                let trackNum = getRandomInt(this.curQuestion.min,this.curQuestion.max);
                let trackName = trackList[trackNum].name;
                this.curQuestion.question = this.curQuestion.question.replace("-", "\"" + trackName + "\" by " + trackList[trackNum].artists[0].name); 
                let album = trackList[trackNum].album;

                if (album.album_type === "SINGLE"  || album.album_type === "COMPILATION") {
                    console.error(`This is a single and will not work for the question`);
                    return [];
                }

                result.push(album.name);

                //wrong answers can be other albums by artist, and then 
                var artistAlbums = callApiSync("https://api.spotify.com/v1/artists/"+ trackList[trackNum].artists[0].id + "/albums");
                
                artistAlbums = artistAlbums.items;
            
                for(let i =0; i<artistAlbums.length; i++) {

                    if(artistAlbums[i].artists[0] !== album.artists[0]) {
                        artistAlbums.splice(i, 1);
                    }
                    /*if(artistAlbums[i].album_type === "SINGLE" || artistAlbums[i].album_type === "COMPILATION") { 
                        artistAlbums.splice(i, 1); 
                    }*/
                    if(artistAlbums[i].name.toLowerCase().includes("live") || artistAlbums[i].name.toLowerCase().includes("remix")) { 
                        artistAlbums.splice(i, 1);
                    }

                }

                //get albums from artist 
                for (let i = 0; i < artistAlbums.length; i++) {
                    if(artistAlbums[i] != album.name) {
                        console.log("NAME HERE: " + artistAlbums[i].name);
                        result.push(artistAlbums[i].name);
                    }
                }
                
                //Get from users top songs
                for (let i = 0; result.length < 4; i++) {
                    let curAlbum = trackList[i].album.name;
                    if (!result.includes(curAlbum)) {
                        result.push(curAlbum);
                    }
                }

                break;
            }
            case 13: // DONE: What is the shortest song in your top ten?                                - Needs Secondary Info
            case 14: { // DONE: What is the longest song in your top ten?                               - Needs Secondary Info
                
                // initially set correct answer to first song
                let corrInd = 0;
                let corrDur = trackList[corrInd].duration_ms;
                // loop through top ten songs and update correctTrack/Dur
                for (let i = 1; i < 10; i++) {
                    const currDur = trackList[i].duration_ms;
                    if ((questionID === 13 && currDur < corrDur) || (questionID === 14 && currDur > corrDur)) {
                        corrInd = i;
                        corrDur = currDur;
                    }
                }

                result[0] = finalResult(trackList[corrInd]);
                secondaryInfo = "The duration of " + trackList[corrInd].name + " is " + convertTime(corrDur) + ".";

                let currNonIndexes = [corrInd];
                for (let i = 0; i < 3; i++) {
                    const nonIndex = getRandomAround(currNonIndexes, 1, 10);
                    currNonIndexes.push(nonIndex);
                    result.push(finalResult(trackList[nonIndex]));
                }
                break;
            }
            case 15: // DONE: Which of these songs was released the longest time ago?                   - Needs Secondary Info
            case 16: { // DONE: Which of these songs was released most recently?                        - Needs Secondary Info
                // Gets list of items we are working with.
                result = this.getItems(numbers, false); 
                
                // Skips question if any of the songs release date percision is not a day
                for (let i = 0; i < 4; i++) {
                    if (result[i].album.release_date_precision !== "day") {
                        return [];
                    }
                }

                // This is a compare function that takes in songs and compares them based on date 
                // published.
                let compareSongDates = (a, b) => {
                    let date1 = a.album.release_date;
                    let date2 = b.album.release_date;
                    // Depending on if the case is 15 or 16 changes if it compares in ascending or 
                    // descending order.
                    if (questionID === 15) {
                        return compareDates(date2, date1);
                    } else {
                        return compareDates(date1, date2);
                    }
                }
                // Loops through songs moving the 'smallest' one in terms of the compare function
                // above to the front of the list.
                for (let i = 1; i < 4; i++) {
                    if (compareSongDates(result[0], result[i]) < 0) {
                        let temp = result[0];
                        result[0] = result[i];
                        result[i] = temp;
                    }
                }

                secondaryInfo = "The song was released on " + result[0].album.release_date + ".";
                // Converts the list it items in a list of song names.
                for (let i = 0; i < 4; i++) {
                    result[i] = finalResult(result[i]);
                }
                break;
            }
            case 20: { // TESTING Helena: What year was - released?
                const trackItem = trackList[getRandomInt(this.curQuestion.min, this.curQuestion.max)];
                if (DEBUG) console.log(trackItem);
                this.curQuestion.question = this.curQuestion.question.replace("-", "\"" + trackItem.name + "\" by " + trackItem.artists[0].name);

                let trackYear = trackItem.album.release_date;
                if (trackYear === undefined) {
                    if (DEBUG) console.error("Release date for " + trackItem.name + " is undefined.");
                    return [];
                }
                if (trackItem.album.release_date_precision !== "year") {
                    trackYear = trackYear.substring(0, trackYear.indexOf("-"));
                }
                trackYear = parseInt(trackYear);
                const currYear = new Date().getFullYear();
                if (DEBUG) console.log("Curr year: " + currYear + " // Track release year: " + trackYear);

                const yearDiff = currYear - trackYear;

                // error if trackYear is greater/after currYear
                if (yearDiff < 0) {
                    if (DEBUG) throw new Error("Track's release year is greater than the current year. Curr year: " + currYear + ". Track year: " + trackYear + ".");
                    console.error("Track's release year is greater than the current year. Curr year: " + currYear + ". Track year: " + trackYear + ".");
                    return [];
                }

                let lowerBound;
                let upperBound;
                // we calculate lower/uppper bound range using y = floor(x/4 + 3), where y = range and x = yearDiff.
                if (yearDiff <= 2) {
                    // if yearDiff <= 2, range should be 3. This is an edge case where yearDiff < range, so handle it separately.
                    lowerBound = currYear - 6;
                    upperBound = currYear;
                } else {
                    let range = Math.floor(yearDiff/4 + 3); // calculates the range to use for lower/upper bounds
                    lowerBound = trackYear - range;
                    upperBound = trackYear + range;
                }

                // OLDER CODE: TODO DELETE ONCE NEWER CODE IS TESTED
                // // get lower and upper year bounds. Ideally get range of 15 years
                // // above and below actual track year, but if the track year is
                // // within 15 years to the current year (based on user's local time),
                // // then increase lower bound to maintain overall range of 30 years.
                // const rangeNum = 15; // <-- edit as needed to adjust range
                // let extra = Math.max(0, rangeNum - (currYear - trackYear));
                // let lowerBoundYear = trackYear - rangeNum - extra;
                // let upperBoundYear = Math.min(trackYear + rangeNum, currYear);

                if (DEBUG) console.log("Lower bound: " + lowerBound + " // Upper bound: " + upperBound);

                result.push(trackYear);
                for (let i = 0; i < 3; i++) {
                    const wrongAnswer = getRandomAround(result, lowerBound, upperBound);
                    result.push(wrongAnswer);
                }

                break;
            }
            case 25: // TESTING Helena: Which of these songs is the loudest according to Spotify?
            case 26: // TESTING: Which of these songs has the highest BPM?                              - Needs Secondary Info
            case 27: // TESTING: Which of these songs has the lowest BPM?                               - Needs Secondary Info
            case 28: // TESTING: Which of these songs is the quietest according to Spotify?
            case 29: // TESTING: Which of these contains the most spoken words according to Spotify?
            case 30: // TESTING: Which of these songs is the most upbeat according to Spotify?
            case 31: {  // TESTING: Which of these songs is the most negative according to Spotify?
                let audioFeatures = []; // the audio features response for each of the 4 songs (in order)
                let tracks = []; // the track object for each of the 4 songs (in order)
                numbers.forEach(num => {
                    const id = trackList[num].id;
                    const audio = callApiSync("https://api.spotify.com/v1/audio-features/" + id);
                    audioFeatures.push(audio);
                    tracks.push(trackList[num]);
                });
                if (DEBUG) console.log("Tracks", tracks);
                if (DEBUG) console.log("Audio features", audioFeatures);

                let feature = ""; // in switch, set this to the Spotify API property for each question case
                let findMax = false; // false if we are finding a min for the curQuestion, true if max
                switch(questionID) {
                    case 25:
                        findMax = true;
                    case 28:
                        feature = "loudness";
                        break;

                    case 26:
                        findMax = true;
                    case 27:
                        feature = "tempo";
                        break;

                    case 29:
                        feature = "speechiness";
                        findMax = true;
                        break;

                    case 30:
                        findMax = true;
                    case 31:
                        feature = "valence";
                        break;
                    default:
                        throw new Error("add code for question ID " + questionID);
                }
                
                let ind = 0; // set initial max/min to be the first index (0)
                let ans = audioFeatures[0][feature];
                if (DEBUG) console.log(feature + " of " + tracks[0].name + ": " + ans);
                for (let i = 1; i < 4; i++) {
                    let cur = audioFeatures[i][feature];
                    if (DEBUG) console.log(feature + " of " + tracks[i].name + ": " + cur);
                    if (findMax && cur > ans || !findMax && cur < ans) {
                        ind = i;
                        ans = cur;
                    }
                }

                let corTrack = tracks.splice(ind, 1)[0];
                result[0] = finalResult(corTrack);

                // Sets secondary info only if the question is about BPM.
                if (questionID === 26 || questionID === 27) {
                    secondaryInfo = "The BPM of " + corTrack.name + " is " + ans + ".";
                }

                tracks.forEach(track => {
                    result.push(finalResult(track));
                })
                if (DEBUG) console.log(result);

                break;
            }
            default: {
                result = ["Correct Answer", "Bad Answer", "Terrible Answer", "Pitiful Answer"];
                break;
            }
        }

        if ((result[0]+"").includes(SPLIT_MARKER)) {
            this.storeQuestion(this.curQuestion.question, "\"" + result[0].split(SPLIT_MARKER)[0] + "\" by " + result[0].split(SPLIT_MARKER)[1], secondaryInfo);
        } else {
            this.storeQuestion(this.curQuestion.question, result[0], secondaryInfo);
        }

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
            this.curQuestion = this.questions.splice(QUESTION_ID - 1, 1)[0];
        } else {
            this.curQuestion = this.questions.splice(Math.floor(Math.random() * this.questions.length), 1)[0];
        }
        if (DEBUG) {
            console.log("Current Question:", this.curQuestion);
        } 
        this.setAnswers();
    }

    /**
     * Adds a question to the list of stored questions for the answer gen.
     * @param {String} question 
     * @param {String} correctAnswer 
     * @param {String} moreInfo 
     * @effects storedQuestions to include {question: question, correctAnswer:correctAnswer, moreInfo:moreInfo}
     *      as long as question and correctAnswer have defined values
     */
    storeQuestion(question, correctAnswer, moreInfo) {
        if (question !== undefined && correctAnser !== undefined) {
            this.storedQuestions.push({question: question, correctAnswer:correctAnswer, moreInfo:moreInfo});
            localStorage.setItem("Stored Questions", JSON.stringify(this.storedQuestions));
        }
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
     * Takes in a correct artist NAME and returns 3 other artist OBJECTS from the top artist that are not the
     * correct artist.
     * @param {string} correctArtist The correct artist's name that will not be included in the random 
     *                               artist.
     * @param {number} amount The number of artists to return.
     * @returns A list with length amount of artist OBJECTS from the top artists not including 
     *          correctArtist.
     */
    getRandomTopArtist(correctArtist, amount) {
        let result = [correctArtist];
        let i = 0;
        while (result.length < amount + 1) {
            const artist = this.apiResponseMap.get("artists-long-50").items[i]
            if (result[0] !== artist.name) {
                result.push(artist);
            }
            i = i + 1;
        }
        result.splice(0, 1);
        return result;
    }

    /**
     * Gets data from the spotify API and stores it in apiResponseMap.
     * @modifies apiResponseMap
     * @effects apiResponseMap stores the general API calls needed for the game with the key 
     *          being the call descriptions
     */
    getApiData() {
        const types = ["tracks-long-50", "artists-long-50", "playlists-50", "genre-recs", "tracks-short-50", "artists-short-50"];
        const urls = [TOPTRACKS + "?limit=50&time_range=long_term", TOPARTIST + "?limit=50&time_range=long_term", PLAYLISTS + "?limit=50", GENRE_REC, TOPTRACKS + "?limit=50&time_range=short_term", TOPARTIST + "?limit=50&time_range=short_term"];
        for (let i = 0; i < types.length; i++) {
            const data = callApiSync(urls[i]);
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
 * Returns a random number x around a number in a given range. Could return undefined if there are no possible answers.
 * @param {number[]} num List of numbers x should not be
 * @param {number} min Min value x can be (inclusive)
 * @param {number} max Max value x can be (inclusive)
 * @returns x such that num - range <= x <= num + range, x != num and x >= 0 
 */
function getRandomAround(num, min, max) {
    if (max < min) {
        throw new Error('min must be smaller than max');
    }
    let possibleAnswers = [];
    for (let i = min; i < max; i++) {
        possibleAnswers.push(i);
    }
    num.forEach(val => {
        const index = possibleAnswers.indexOf(val);
        if (index >= 0) possibleAnswers.splice(index, 1);
    });
    if (possibleAnswers.length === 0) {
        return undefined;
    } else {
        const resultIndex = getRandomInt(0, possibleAnswers.length);
        return possibleAnswers[resultIndex];
    }
}

/**
 * Compares two dates in format "xxxx-xx-xx"
 * @param {string} date1 
 * @param {string} date2 
 * @returns 1  if date1 > date2
 *          -1 if date1 < date2
 *          0  if date1 = date2
 */
function compareDates(date1, date2) {
    if (date1 === undefined || date2 === undefined) {
        throw new Error("date1 and date2 cannot be undefined.");
    }
    const dateList1 = date1.split('-');
    const dateList2 = date2.split('-');
    
    if (dateList1[0] > dateList2[0]) {
        return 1;
    } else if (dateList1[0] < dateList2[0]) {
        return -1
    } else {
        if (dateList1[1] > dateList2[1]) {
            return 1;
        } else if (dateList1[1] < dateList2[1]) {
            return -1
        } else {
            if (dateList1[2] > dateList2[2]) {
                return 1;
            } else if (dateList1[2] < dateList2[2]) {
                return -1
            } else {
                return 0
            }
        }
    }
}

/**
 * Used to return a scaled number y; for instance, where a greater x corresponds to a greater y
 * Returns y where y = floor(x/a + b)
 * @param {number} x 
 * @param {number} a 
 * @param {number} b 
 * @returns y where y = floor(x/a + b)
 */
function getScaledNum(x, a, b) {
    return Math.floor(x/a + b);
}

/**
 * If item has artist names attached to it, returns a string x such that the name of item
 * and artist are joined together with the split marker used to mark where to split it.
 * Otherwise, returns item name.
 * @param {trackItem or albumItem} item
 * @returns string x such that, if artist exists, x = item.name + SPLIT_MARKER + item.artist;
 * o        otherwise, x = item.name
 */
function finalResult(item) {
    if (item.artists === undefined) {
        return item.name;
    }
    return item.name + SPLIT_MARKER + item.artists[0].name
}

/**
 * Converts a number of miliseconds into a string with the format "minutes:seconds"
 * rounding to the closest second.
 * @param {number} miliseconds 
 * @returns string x that denotes the time given in the format "minites:seconds"
 */
function convertTime(miliseconds) {
    const seconds = Math.round(miliseconds/1000);
    const minutes = Math.floor(seconds/60);
    const remaingSeconds = seconds%60;
    
    if (remaingSeconds > 9) {
        return minutes + ":" + remaingSeconds;
    } else {
        return minutes + ":0" + remaingSeconds;
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