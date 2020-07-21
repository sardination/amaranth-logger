// Client ID and API key from the Developer Console
var CLIENT_ID = '1042655770334-0gqv69apuc35r73ang04fmr42s2msa00.apps.googleusercontent.com';
var API_KEY = 'AIzaSyAWOjWua0NAp6-kpxpsckRS3jNWD1L60cs';
var SPREADSHEET_ID = '1jbHE1O1VXISaInqUCOd-68XaqDFVT_USHnDNxrpso1M';
var SPREADSHEET_RANGE = 'Entry!A2:E';
var START_ROW = 2;
var TIME_IN_COL = 'C';
var TIME_OUT_COL = 'D';
var WORKED_TODAY_MESSAGE = "Worked Today!";

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets";

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  }, function(error) {
    appendPre(JSON.stringify(error, null, 2));
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    // createTable();
    listWorkers();
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn({ux_mode: "redirect"});
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message, tagtype) {
  var pre = document.getElementById('content');
  var tag = document.createElement(tagtype);
  var textContent = document.createTextNode(message);
  tag.appendChild(textContent);
  pre.appendChild(tag);
  pre.appendChild(document.createTextNode("\n"));
  // pre.append(message);
}

function recordTime(event) {
  var now = new Date();
  var mins = String(now.getMinutes()).padStart(2, '0');
  var hr = now.getHours();
  var today = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
  now = `${hr}:${mins}`;

  var active = event.toElement.attributes["active"].nodeValue;

  var name = event.toElement.attributes["workername"].nodeValue;

  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: SPREADSHEET_RANGE,
    includeGridData: true
  }).then(function(readResponse) {
    var rows = readResponse.result.values;
    var cellAddress = null;
    var lastRow = START_ROW;
    for (i = 0; i < rows.length; i++) {
      var thisRow = rows[i];
      if (thisRow[1] == name && thisRow[0] == today && thisRow[3] == "") {
        cellAddress = `${TIME_OUT_COL}${START_ROW + i}`;
        break;
      } else if (thisRow[1] == "") {
        break;
      }
      lastRow++;
    }
    if (cellAddress != null) {
      gapi.client.sheets.spreadsheets.values.update({
         spreadsheetId: SPREADSHEET_ID,
         range: cellAddress,
         valueInputOption: "USER_ENTERED",
         resource: {values: [[now]]}
      }).then(function(writeResponse) {
        var result = writeResponse.result;
        console.log(`${result.updatedCells} cells updated.`);
        window.location.reload(false);
      });
    } else {
      cellAddress = `A${lastRow}:${TIME_IN_COL}${lastRow}`;
      gapi.client.sheets.spreadsheets.values.update({
         spreadsheetId: SPREADSHEET_ID,
         range: cellAddress,
         valueInputOption: "USER_ENTERED",
         resource: {values: [[today, name, now]]}
      }).then(function(writeResponse) {
        var result = writeResponse.result;
        console.log(`${result.updatedCells} cells updated.`);
        window.location.reload(true);
      });
    }
  });
}

function createRow(name, active) {
  var table = document.getElementById('workerTable');
  var newRow = document.createElement('tr');
  var nameCell = document.createElement('td');
  var nameButton = document.createElement('button');
  nameButton.setAttribute("workername", name);
  nameButton.classList.add("worker-button");
  if (active == "" || active == WORKED_TODAY_MESSAGE) {
    nameButton.setAttribute("active", false);
  } else {
    nameButton.setAttribute("active", true);
  }
  nameButton.appendChild(document.createTextNode(name));
  nameCell.appendChild(nameButton);
  var activeCell = document.createElement('td');
  activeCell.appendChild(document.createTextNode(active));
  newRow.appendChild(nameCell);
  newRow.appendChild(activeCell);
  table.appendChild(newRow);

  nameButton.onclick = recordTime;
}

/**
 * List workers:
 * https://docs.google.com/spreadsheets/d/1jbHE1O1VXISaInqUCOd-68XaqDFVT_USHnDNxrpso1M/edit
 */
function createTable() {
  var pre = document.getElementById('content');
  var tableTag = document.createElement('table');
  tableTag.setAttribute('id', 'workerTable');
  var headerRow = document.createElement('tr');
  var headerName = document.createElement('th');
  var headerActive = document.createElement('th');
  headerName.appendChild(document.createTextNode('Name'));
  headerActive.appendChild(document.createTextNode('Active'));
  headerRow.appendChild(headerName);
  headerRow.appendChild(headerActive);
  tableTag.append(headerRow);
  pre.appendChild(tableTag);
}

function listWorkers() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: SPREADSHEET_RANGE,
  }).then(function(response) {
    createTable();

    var today = new Date();
    var dd = String(today.getDate())
    var mm = String(today.getMonth() + 1)
    var yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;

    var range = response.result;
    if (range.values.length > 0) {
      // appendPre('Name:', 'p');
      var workerInfo = {};
      for (i = 0; i < range.values.length; i++) {
        var thisRow = range.values[i];
        var date = thisRow[0]
        var workerName = thisRow[1];
        var timeIn = thisRow[2];
        var timeOut = thisRow[3];

        if (workerName != "") {
          workerInfo[workerName] = {
            'date': date,
            'timeIn': timeIn,
            'timeOut': timeOut
          };
        }
        // Print columns A and E, which correspond to indices 0 and 4.
        // appendPre(row[0]);
      }
      var workers = Object.keys(workerInfo);
      workers.sort()
      for (i = 0; i < workers.length; i++) {
          // appendPre(workers[i], 'button');
          var name = workers[i];
          var active = '';
          if (workerInfo[name]['date'] == today) {
            if (workerInfo[name]['timeOut'] == '') {
              active = workerInfo[name]['timeIn'];
            } else {
              active = WORKED_TODAY_MESSAGE;
            }
          }
          createRow(workers[i], active);
      }
    } else {
      appendPre('No data found.');
    }
  }, function(response) {
    appendPre('Error: ' + response.result.error.message);
  });
}