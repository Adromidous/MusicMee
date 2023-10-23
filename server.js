const express = require('express');
const dotenv = require('dotenv');
var request = require('request');
var cors = require('cors');


const {MongoClient} = require("mongodb");

const uri = "<INSERT MongoDB URI>";
const client = new MongoClient(uri)

async function connect() {
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
    }catch(error) {
        console.error(error);
    }
}

dotenv.config();

var spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;
var port = process.env.PORT;

var generateRandomString = function (length) { //To prevent cross-site request forgery
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

var app = express();
connect();

app.use(express.json());
app.use(cors());

var state;
var searchedTrack;

var client_access_id;
var search_id;
const dbName = "MusicMeeDB";
const collectionName = "clientsCollection";

const clientDB = client.db(dbName);
const clientsCollection = clientDB.collection(collectionName);

app.get('/auth/login', (req, res) => {

    var scopes =
        "ugc-image-upload \
        user-read-playback-state \
        user-modify-playback-state \
        user-read-currently-playing \
        playlist-modify-public \
        playlist-modify-private \
        playlist-read-private \
        user-read-playback-position \
        user-top-read \
        user-read-recently-played \
        user-library-modify \
        user-library-read"
    
    state = generateRandomString(16);
    client_access_id = generateRandomString(32);

    var auth_query_parameters = new URLSearchParams({
        response_type: "code",
        client_id: spotify_client_id,
        scope: scopes,
        redirect_uri: "http://localhost:5000/auth/callback",
        state:state
    })

    res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
});

app.get('/auth/callback', (req, res) => {
    var code = req.query.code;

    var authOptions =  {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: "http://localhost:5000/auth/callback",
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
            'Content-Type' : 'application/x-www-form-urlencoded'
        },
        json: true
    };

    request.post(authOptions, async function(error, response, body) {
        if (!error && response.statusCode===200) {
            const userData = {
                client_access_id: client_access_id,
                access_token: body.access_token,
                refresh_token: body.refresh_token
            };
            try {
                const insertUserData = await clientsCollection.insertOne(userData);
            }catch(err) {
                console.error(`Error:${err}`);
            }
            
            res.redirect('http://localhost:5173/home');
        }else{
            res.redirect('http://localhost:5173/error')
        }
    });

});

app.get('/logout', async (req, res) => {
    const deleteQuery = {client_access_id: {$in : [client_access_id]}};

    try {
        const deleteResult = await clientsCollection.deleteOne(deleteQuery);
    }catch(err) {
        console.log(`Error: ${err}`)
    }

    client_access_id = generateRandomString(32);

    res.redirect('http://localhost:5173');
});

app.get('/home', async (req, res) => {

    let JSONDATA;

    let findAccess = {client_access_id: client_access_id};

    try {

        const findAccessToken = await clientsCollection.findOne(findAccess);

        JSONDATA = JSON.stringify(findAccessToken);

    } catch (err) {

        console.log(err);

    }

    res.json(JSONDATA);
})

app.post('/send-search', async (req, res) => {
    searchedTrack = req.body;
    search_id = generateRandomString(32);
   if (searchedTrack) {
        try {
            res.json({redirect_url: `http://localhost:5173/search?search_id=${search_id}`});
        }
        
        catch(err) {
            console.log(err);
        }
   }
})

app.get('/search', (req, res) => {
    res.json(searchedTrack);
})

app.listen(port, () => {
    console.log(`Listening at https://localhost:${port}`)
});
