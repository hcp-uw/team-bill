function bill() {
    document.getElementById("answer1").innerHTML = "You chose Bill's answer...";
    document.getElementById("button").style.backgroundColor = "#FFFF";

}

function friend() {
    document.getElementById("answer1").innerHTML = "You chose your friend's answer!";
}


var j = 1;  
for (let i = 1; i < 21; i+=2) {
    var textDiv = document.createElement("h3");
    var questionDiv = document.createElement("h3");
    var btnLeft = document.createElement("button");
    var btnRight = document.createElement("button");
    
    btnLeft.setAttribute("id", "ansBtnLeft");
    btnRight.setAttribute("id", "ansBtnRight");
    
    var resultDiv = document.createTextNode("Result: " + j);
    var btnLeftText = document.createTextNode("Answer number: " + i);
    var btnRightText = document.createTextNode("Answer number: " + (i+1));
    var questionDivText = document.createTextNode("Question #" + j);

    questionDiv.appendChild(questionDivText);
    btnLeft.appendChild(btnLeftText);
    btnRight.appendChild(btnRightText);
    textDiv.appendChild(resultDivText);

    document.body.appendChild(questionDiv);
    document.body.appendChild(btnLeft);
    document.body.appendChild(btnRight);
    document.body.appendChild(textDiv);
    
    j+=1;
}

