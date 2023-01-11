let express = require("express"); // Express web server framework
let request = require("request"); // "Request" library
let cors = require("cors");
let querystring = require("querystring");
let cookieParser = require("cookie-parser");
const { profileEnd } = require("console");
require("dotenv").config();

let songs = [];

let redirect_uri = "http://localhost:8888/callback";

// Random state string
let generateRandomString = function (length) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

let stateKey = "spotify_auth_state";

let app = express();

app
  .use(express.static(__dirname + "/public"))
  .use(cors({ origin: "https://accounts.spotify.com" }))
  .use(cookieParser());

app.get("/login", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = "user-top-read";
  let codeURL =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: process.env.CLIENT_ID,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state,
    });
  res.send(codeURL);
});

app.get("/callback", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      },
      headers: {
        Authorization:
          "Basic " +
          new Buffer(
            process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
          ).toString("base64"),
      },
      json: true,
    };

    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        var options = {
          url: "https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=long_term",
          headers: { Authorization: "Bearer " + access_token },
          json: true,
        };
        res.cookie("Access token", access_token);
        res.redirect("http://localhost:3000");

        //res.redirect('http://localhost:3000');

        // WONT NEED THIS WHEN FRONT END REDIRECT WORKS
        // use the access token to access the Spotify Web API
        request.get(options, (error, response, body) => {
          songs.push(body.items);
          console.log(songs);
          //res.send(songs);
          //res.status(200);
        });
        console.log("###############################");

        // we can also pass the token to the browser to make requests from there
      }
    });
  }
});

app.get("/refresh_token", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        new Buffer.alloc(
          process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
        ).toString("base64"),
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        access_token: access_token,
      });
    }
  });
});

console.log("Listening on 8888");

app.listen(8888);
