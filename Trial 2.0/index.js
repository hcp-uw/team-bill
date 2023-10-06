import {handleRedirect, isLoggedIn, requestAuthorization, logout, callApi, CUR_USER } from "./spotify.js";

document.addEventListener("DOMContentLoaded", onPageLoad);

/**
 * Determineds if a access token is stored in local storage. If it does it will stored it in a
 * local variable. Currently nothing is happening if no access token is found.
 */
function onPageLoad() {
    if (window.location.search.length > 0) {
        handleRedirect();
        console.log("handled redirect!");
    }
}

function playSolo() {
    if (isLoggedIn()) {
        window.location.href = window.location.origin + "/sologamescreen.html";
    } else {
        requestAuthorization(window.location.origin + "/sologamescreen.html");
    }
}


document.getElementById('play-button').addEventListener('click', playSolo);