type question = {q:string, index:number, type:string, apiCall:string}
//type song = {name: string, artist: string}

export interface answerGen {
    /**
     * 
     */
    getQuestion(): string;

    /**
     * 
     */
    getAnswer(): string;

    /**
     * 
     */
    getNonAnswers(): [string, string, string];

    /**
     * 
     */
    changeQuestion(): void;

}

class simpleAnswerGen implements answerGen {
    questions: Array<question>;
    curQuestion: question;
    curAnswer: string;
    curNonAnswers: [string, string, string];

    /**
     * 
     * @param questions 
     */
    constructor(questions: Array<question>) {
        this.questions = questions;

    }

    getQuestion = () => { return this.curQuestion.q };
    getAnswer = () => { return this.curAnswer };
    getNonAnswers = () => { return this.curNonAnswers };

    changeQuestion = () => { this.pickQuestion; }

    /**
     * Set answer and non answer fields to correct values
     */
    setAnswer(): void {
        // TODO: add more code here
    }

    /**
     * Picks a question from question at random and removes it.
     */
    pickQuestion(): void {
        // TODO: add code here

        this.setAnswer();
    }
    
}

export function makeQuestionGen(questions ?: Array<question>): answerGen {
    if (questions === undefined) {
        questions = /* read json file */ new Array<question>;
    }
    return new simpleAnswerGen(questions);
}