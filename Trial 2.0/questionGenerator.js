import { callApi, TOPTRACKS } from "./spotify.js";

// import questionsFile from './questions.json' assert { type: 'json' };
//type question = {q:string, index:number, type:string, apiCall:string}
//type song = {name: string, artist: string}

class simpleAnswerGen {
    questions;
    curQuestion;
    curAnswer;
    curNonAnswers;

    // maps type of API call to response of that call
    apiResponseMap;

    /**
     * 
     * @param questions 
     */
    constructor(questions) {
        this.questions = questions;
        this.apiToResponse = new Map();
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
        // TODO: add more code here
    }

    /**
     * call map set values
     */
    getApiData() {
        // callApi(function() {
        //     const data = this.data;
        //     this.handleApiDataResponse(data, "best key ever");
        // })

        // example function:
        callApi(
            "GET",
            TOPTRACKS + "?limit=50&time_range=long_term",
            null,
            handleApiDataResponse,
            "tracks-long-50"
        );
    }

    /**
     * Adds the data to apiResponseMap
     */
    handleApiDataResponse() { 
        const key = this.type; // sets "key" equal to the string passed into callApi for apiType
        const data = JSON.parse(this.responseText);
        apiResponseMap.set(key, data);
    }

    /**
     * 
     * @param {*} questiontype 
     * @param {*} number 
     */
    getAnswer(questiontype, number) {
        // TODO: add code here
        this.setAnswer();
    }

    /**
     * Picks a question from questions at random and removes it.
     */
    pickQuestion() {
        this.curQuestion = questions.splice(Math.floor(Math.random() * questions.length-1), 1);
    }
    
}

/**
 * 
 * @param {*} questions 
 * @returns 
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
    return new simpleAnswerGen(questions);
}