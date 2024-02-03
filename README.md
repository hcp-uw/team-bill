# Billboard: A personalized music trivia experience.

## What is Billboard?
Billboard is a music trivia game that quizzes a user on their own music taste. A player will log into their Spotify account before starting the game, so each question can be created with personalized data using Spotify's Web API. Each round consists of ten multiple choice questions complete with a results page giving more information.

## Who are we?
Billboard was created by Team Bill, a group of 7 people, for the Husky Coding Project at the University of Washington, Seattle. We began this project with little knowledge of making a full web app from start to end, and, over the course of a year, created this website!

*Special thanks to those in Husky Coding Project who supported us along the way. :)*

## How to use
Before you start make sure you have npm installed.

### Install Firebase
Use the following command to install firebased:

```npm i firebase```

### Spotify API Key
To be able to play the trivia game using your own Spotify account you will have to create an API key for Spotify. The reason you can't use our API key is because Spotify makes us add each email account to our project in order to use the API key associated with that project. To make the project go to https://developer.spotify.com/dashboard and log into your Spotify account. (Make sure to use the account you wish to use with the game or add it later as an user) Click create a project. Make sure to do the follow steps when creating the project:
    
- Name your project and give it a description. (It does not matter how you name it)
- Add `http://127.0.0.1:8080` **and** `http://127.0.0.1:8080/sologamescreen.html` as redirect URIs.
- Click **Web API** under "Which API/SDKs are you planning to use?".

Once you create the project go to **settings** and under basic information you should be able to view your client ID and client secret. Copy these values and insert them into their respective variable in the `public/api_key.js` file.

### Start Emulator and Open Website
1. Use the following command to start the firebase emulator to start the server:

    ```firebase emulators:start```

2. Go to `http://127.0.0.1:8080`, log into your Spotify account and enjoy the game!