export var client_id = "a0c734380e8a4301b8af9f29b139165c";
export var client_secret = "33dad7cfdcd347b0a83d551537ffa728"; // In a real app you should not expose your client_secret to the user
export var scope = "user-top-read user-read-recently-played";

var redirect_uri;
const stored_uri = localStorage.getItem("redirect_uri");
if (stored_uri === null) {
    redirect_uri = "http://127.0.0.1:8080";
} else {
    redirect_uri = stored_uri;
    localStorage.removeItem("redirect_uri");
}
export {redirect_uri};

var access_token = null;
var refresh_token = null;

const TOKEN = "https://accounts.spotify.com/api/token";
export const AUTHORIZE = "https://accounts.spotify.com/authorize";
export const PLAYLISTS = "https://api.spotify.com/v1/me/playlists";
export const GET_PLAYLIST = "https://api.spotify.com/v1/playlists/"; // must concat playlist id to end 
export const TOPTRACKS = "https://api.spotify.com/v1/me/top/tracks";
export const TOPARTIST = "https://api.spotify.com/v1/me/top/artists";
export const GENRE_REC = "https://api.spotify.com/v1/recommendations/available-genre-seeds";
export const CUR_USER = "https://api.spotify.com/v1/me" 

document.addEventListener("DOMContentLoaded", onPageLoad);

function onPageLoad() {
    access_token = localStorage.getItem("access_token");
}

/**
 * Requests authorization from spotify. Will redirect the user to the spotify login portal and 
 * then back to the address of the callback function in ./spotify.js
 * @param {string || undiefined} redirectUri optional to set the redirect uri. 
 */
export function requestAuthorization(opt_redirect_uri) {
    console.log("Requested Authorization!");
    // localStorage.setItem("client_id", client_id);
    // localStorage.setItem("client_secret", client_secret); // In a real app you should not expose your client_secret to the user
    if (typeof(opt_redirect_uri) == 'string') {
        redirect_uri = opt_redirect_uri;
    }

    localStorage.setItem("redirect_uri", redirect_uri); // Stores optional redirect uri so if the redirect is changed, the 
                                                        // next time this page is loaded that uri is used

    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=" + scope;
    window.location.href = url; // Show Spotify's authorization screen
}

export function handleRedirect() {
    console.log("Handling redirect!!");
    let code = getCode();
    fetchAccessToken(code);
    window.history.pushState("", "", redirect_uri); // remove param from url
}


// Not Export
function getCode() {
    let code = null;
    const queryString = window.location.search;
    if (queryString.length > 0) {
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get("code");
    }
    return code;
}

// Not Export
function fetchAccessToken(code) {
    let body = "grant_type=authorization_code";
    body += "&code=" + code;
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationApi(body);
}

// Not Export
function refreshAccessToken() {
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    console.log("Refresh Access Token Body:");
    console.log(body);
    callAuthorizationApi(body);
}

// Not Export
function callAuthorizationApi(body) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader(
        "Authorization",
        "Basic " + btoa(client_id + ":" + client_secret)
    );
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

// Not Export
function handleAuthorizationResponse() {
    if (this.status == 200) { 
        var data = JSON.parse(this.responseText);
        console.log(data);;
        if (data.access_token != undefined) {
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if (data.refresh_token != undefined) {
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        location.reload();
    } else {
        console.log(this.responseText);
    }
}

export function callApi(method, url, body, callback, apiType) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
    xhr.type = apiType;
    xhr.send(body);
    xhr.onload = callback;
}

/**
 * Calls a synchronous get request and returns the data if the request was fulfilled. 
 * @param {string} url URL of request
 * @param {*} body Body of request
 * @returns {object} response text of the request. 
 */
export function callApiSync(url) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
    xhr.send(); // FYI, if the request is set to "GET", the body will automatically be set to null no matter what is put here

    if (xhr.status == 200) {
        var data = JSON.parse(xhr.responseText);
        return data;
    } else if (xhr.status == 401) {
        console.log("Refreshing Access Token");
        refreshAccessToken();
    }
    else { 
        console.log("Status: " + xhr.status + "\nResponse Text: " + xhr.responseText + "\nStatus Text: " + xhr.statusText);
    }
}

export function callTopTracks(callbackFunction) {
    console.log("calling top tracks");
    callApi(
        "GET",
        TOPTRACKS + "?limit=50&time_range=long_term",
        null,
        callbackFunction
    );
}

export function deviceId() {
    return document.getElementById("devices").value;
}

// Checks if the user is logged in
// TODO: Check if the access token is valid
export function isLoggedIn() {
    return localStorage.getItem('access_token') != null;
}

export function logout() {
    localStorage.clear();
}
