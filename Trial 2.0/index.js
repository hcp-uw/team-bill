import {client_id, client_secret, redirect_uri, scope, AUTHORIZE, handleRedirect } from "./spotify.js";
import { makeQuestionGen } from "./questionGenerator.js";

var access_token = null;

document.addEventListener("DOMContentLoaded", onPageLoad);

/**
 * Determineds if a access token is stored in local storage. If it does it will stored it in a
 * local variable. Currently nothing is happening if no access token is found.
 */
function onPageLoad() {
    console.log("index.js onPageLoad");
    if (window.location.search.length > 0) {
        handleRedirect();
        console.log("handled redirect!");
    } else {
        access_token = localStorage.getItem("access_token");
        if (access_token == null) {
            // we don't have an access token so present token section
            console.log("No access token.");
            document.getElementById("tokenSection").style.display = "block"; // Pretty sure this is an 
            // artifact from my test code and is not being used. Might want to delete --Zack
        } else {
            console.log("Has access Token")
            console.log("Access token: " + access_token);
            const gen = makeQuestionGen();
        }
    }
}

/**
 * Requests authorization from spotify. Will redirect the user to the spotify login portal and 
 * then back to the address of the callback function in ./spotify.js
 */
function requestAuthorization() {
    console.log("Requested Authorization!");
    localStorage.setItem("client_id", client_id);
    localStorage.setItem("client_secret", client_secret); // In a real app you should not expose your client_secret to the user

    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=" + scope;
    window.location.href = url; // Show Spotify's authorization screen
}
document.getElementById('authorizeBtn').addEventListener('click', requestAuthorization);