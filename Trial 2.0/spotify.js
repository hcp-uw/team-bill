export var redirect_uri = "http://127.0.0.1:8080";
export var client_id = "a0c734380e8a4301b8af9f29b139165c";
export var client_secret = "33dad7cfdcd347b0a83d551537ffa728"; // In a real app you should not expose your client_secret to the user
export var scope =
    "user-top-read user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";

var access_token = null;
var refresh_token = null;

const TOKEN = "https://accounts.spotify.com/api/token";
export const AUTHORIZE = "https://accounts.spotify.com/authorize";
export const PLAYLISTS = "https://api.spotify.com/v1/me/playlists";
export const GET_PLAYLIST = "https://api.spotify.com/v1/playlists/"; // must concat playlist id to end 
export const TOPTRACKS = "https://api.spotify.com/v1/me/top/tracks";
export const TOPARTIST = "https://api.spotify.com/v1/me/top/artists";
export const GENRE_REC = "https://api.spotify.com/v1/recommendations/available-genre-seeds";

document.addEventListener("DOMContentLoaded", onPageLoad);

function onPageLoad() {
    access_token = localStorage.getItem("access_token");
}

export function handleRedirect() {
    console.log("Handling redirect!!");
    let code = getCode();
    fetchAccessToken(code);
    window.history.pushState("", "", redirect_uri); // remove param from url
}

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


export function refreshAccessToken() {
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

//Export
function handleAuthorizationResponse() {
    if (this.status == 200) { 
        var data = JSON.parse(this.responseText);
        console.log(data);
        var data = JSON.parse(this.responseText);
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
        alert(this.responseText);
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
export function callApiSync(url, body) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
    xhr.send(body);

    if (xhr.status == 200) {
        var data = JSON.parse(xhr.responseText);
        return data;
    } else if (xhr.status == 401) {
        console.log("Refreshing Access Token");
        refreshAccessToken();
        // return callApiSync(url, body);
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

/*function shuffle() {
    callApi(
        "PUT",
        SHUFFLE + "?state=true&device_id=" + deviceId(),
        null,
        handleApiResponse
    );
    play();
}*/


export function deviceId() {
    return document.getElementById("devices").value;
}
