var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var q = require('q');

var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
  var deferred = q.defer();

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      deferred.resolve(getNewToken(oauth2Client));
    } else {
      oauth2Client.credentials = JSON.parse(token);
      deferred.resolve(oauth2Client);
    }
  });

  return deferred.promise;
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client) {

  var deferred = q.defer();
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        deferred.reject('Error while trying to retrieve access token'+ err);
      }
      oauth2Client.credentials = token;
      storeToken(token);

      deferred.resolve(oauth2Client);
    });
  });

  return deferred.promise;
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Get events in calendar
 *
 * @param {Object} oauth2 token
 * @param {string} id if calendar to query
 */
function getEvents (auth, calendarId) {
  var deferred = q.defer();
  google.calendar('v3').events.list(
    {
      auth: auth,
      calendarId: calendarId,
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    },
    function(err, response) {
      if (err) {
        deferred.reject('The API returned an error: ' + err)
      } else {
        deferred.resolve(response.items);
      }
    }
  );

  return deferred.promise;
};


module.exports = {

  /**
   * Get next events in agenda
   *
   * @param {string} path to oAuth2 secret file
   * @param {string} id of calendar to query
   */
  getNextEvents: function (oAuth2Secret, calendarId) {
    var deferred = q.defer();

    // Load client secrets from a local file.
    fs.readFile(oAuth2Secret, function processClientSecrets(err, content) {
      if (err) {
        deferred.reject('Error loading client secret file: ' + err);
      }
      // Authorize a client with the loaded credentials, then call the
      // Google Calendar API.
      authorize(JSON.parse(content)).then(
        function(auth) {
          deferred.resolve(getEvents(auth, calendarId));
        },
        function(err) {
          deferred.reject(err);
        }
      );
    });

    return deferred.promise;
  }

};
