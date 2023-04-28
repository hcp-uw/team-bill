

// Changes the result text to the bill for the results text dependent on number given
function bill() { 

    let ansNum = this.id.slice(-1)
    // Change this text based off the question being asked
    // Change the button color based off if they chose friends or bill's answer
    document.getElementById("answer" + ansNum).innerHTML = "You chose Bill's answer...";
    document.getElementById("button").style.backgroundColor = "#FFFF";

}

// Changes the result text to the friends for the results text dependent on number given
function friend() { 
    
    let ansNum = this.id.slice(-1)
    // Same as bill() function, change based off answer and question
    document.getElementById("answer" + ansNum).innerHTML = "You chose your friend's answer!";
}

// Replaces "Question #" titles on startup with the questions from game
function loadQuestions() {
    for (let i = 1; i < 11; i++) { 
        document.getElementById("question" + i).innerHTML = "INSERT QUESTION " + i + " QUESTION HERE"
    }
}

// Randomly assigns and replaces the left and right buttons text with answers from the game
function loadAnswers() {
    let j = 1;
    for (let i = 1; i < 11; i++) { 
        let rand = Math.floor(Math.random() * 2)
        
        document.body.appendChild(Object.assign(document.createElement('h1'),
        { id:'question'+i, innerHTML: "Question " + i, style: "font-size: 3rem"}))

        document.body.appendChild(Object.assign(document.createElement('div'),{ id:'box' + j}))
        .appendChild(Object.assign(document.createElement('button'), { id:'button' + (j),
             style: "font-size: 2rem"}))
        document.getElementById("box" + j).appendChild(Object.assign(document.createElement('button'),
        { id:'button' + ((j + 10)), style: "font-size: 2rem"}))
    
        document.getElementById("button" + j).addEventListener("click", this.bill, false);
        document.getElementById("button" + (j+10)).addEventListener("click", this.friend, false);
        
        document.body.appendChild(Object.assign(document.createElement('div'),{ id:'box' + (j)}))
        
        document.getElementById("button" + (j + 10)).innerHTML = "Friend " + (j + 10);
        document.getElementById("button" + j).innerHTML = "Bill " + j;

        document.body.appendChild(Object.assign(document.createElement('h2'),
        { id:'answer'+i, innerHTML: "Answer " + i, style: "font-size: 2rem"}))
        j += 2;




        // if (rand === 1){
        //     document.body.appendChild(Object.assign(document.createElement('div'),{ id:'box' + j}))
        //     .appendChild(Object.assign(document.createElement('button'),
        //             { 
        //             id:'button' + (j),
        //             onclick: printConsole()
        //             }))
        //     document.getElementById("button" + j).innerHTML = "Bill " + j;

            

        //     document.body.appendChild(Object.assign(document.createElement('div'),{ id:'box'}))
        //     .appendChild(Object.assign(document.createElement('button'),
        //             { 
        //             id:'button' + ((j + 1)),
        //             onclick: printConsole()
        //             }))
        //     document.getElementById("button" + (j + 1)).innerHTML = "Friend " + (j + 1);
        // } else {
        //     // document.getElementById("btnAnswer" + j).innerHTML = "FRIENDS'S " +  i + " ANSWER";
        //     // document.getElementById("btnAnswer" +(j + 1)).innerHTML = "BILL'S " +  i + " ANSWER";
        // }
        // document.getElementById("question" + i).innerHTML 
        // = "INSERT QUESTION " + i + " QUESTION HERE";

        // let rand = Math.floor(Math.random() * 2)
        
        // console.log(rand);
        // if (document.getElementById("btnAnswer" + j) != null && 
        // document.getElementById("btnAnswer" + (j + 1) ) != null) {

        //     if (rand === 1) { 
        //         document.getElementById("btnAnswer" + j).innerHTML = "BILL'S " +  i + " ANSWER";
        //         document.getElementById("btnAnswer" + (j + 1)).innerHTML 
        //         = "FRIEND'S " +  i + " ANSWER";
        //     } else {
        //         document.getElementById("btnAnswer" + j).innerHTML = "FRIEND'S " +  i + " ANSWER";
        //         document.getElementById("btnAnswer" + (j + 1)).innerHTML 
        //         = "BILL'S " +  i + " ANSWER";
        //     }
        // }
        // j+=2;
    }

}


// var j = 1;  
// for (let i = 1; i < 21; i+=2) {
//     var textDiv = document.createElement("h3");
//     var questionDiv = document.createElement("h3");
//     var btnLeft = document.createElement("button");
//     var btnRight = document.createElement("button");
    
//     var resultDivText = document.createTextNode("Result: " + j);
//     var btnLeftText = document.createTextNode("Answer number: " + i);
//     var btnRightText = document.createTextNode("Answer number: " + (i+1));
//     var questionDivText = document.createTextNode("Question #" + j);

//     questionDiv.appendChild(questionDivText);
//     btnLeft.appendChild(btnLeftText);
//     btnRight.appendChild(btnRightText);
//     textDiv.appendChild(resultDivText);

//     document.body.appendChild(questionDiv);
//     document.body.appendChild(btnLeft);
//     document.body.appendChild(btnRight);
//     document.body.appendChild(textDiv);
    
//     j+=1;

//     btnLeft.addEventListener("click", friend());
    
// }



