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
    if (isLoggedIn()) {
        document.getElementById('authorizeBtn').innerHTML = document.getElementById('authorizeBtn').innerHTML.replace('Login', 'Logout');
        document.getElementById('authorizeBtn').removeEventListener("click", requestAuthorization);
        document.getElementById('authorizeBtn').addEventListener('click', handleLogOut);
        setProfilePicture();
    }
}

function handleLogOut() {
    document.getElementById('authorizeBtn').innerHTML = document.getElementById('authorizeBtn').innerHTML.replace('Logout', 'Login');
    document.getElementById('authorizeBtn').removeEventListener("click", handleLogOut);
    document.getElementById('authorizeBtn').addEventListener('click', requestAuthorization);
    document.getElementById('profile-picture').classList.remove('shown');
        document.getElementById('profile-picture').classList.add('hidden');
        document.getElementById('authorizeBtn').classList.remove('shown');
        document.getElementById('authorizeBtn').classList.add('hidden');
    logout();
}

function playSolo() {
    if (isLoggedIn()) {
        window.location.href = window.location.origin + "/sologamescreen.html";
    } else {
        requestAuthorization(window.location.origin + "/sologamescreen.html");
    }
}

function setProfilePicture() {
    if (!isLoggedIn()) {
        console.error('Tried to get profile picture when not logged in.');
    } else {
        callApi('GET', CUR_USER, null, handleProfilePicture)
    }
}

function handleProfilePicture() {
    if (this.status === 200) {
        var data = JSON.parse(this.responseText);
        const profilePicUrl = data.images[0].url;
        console.log(profilePicUrl);
        document.getElementById('profile-picture').src = profilePicUrl;
        document.getElementById('profile-picture').classList.remove('hidden');
        document.getElementById('profile-picture').classList.add('shown');
        document.getElementById('authorizeBtn').classList.remove('hidden');
        document.getElementById('authorizeBtn').classList.add('shown');
    } else {
        console.error('There was an error getting the profile picture. Status: ' + this.status);
    }
}

 
document.getElementById('authorizeBtn').addEventListener('click', requestAuthorization);
document.getElementById('play-button').addEventListener('click', playSolo);