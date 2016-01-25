var googleCalendar = require('./googlecalendar.js');
var schedule = require('node-schedule');

var SECRET_FILE = '../client_secret.json';
var CALENDAR_ID = 'jnk4q16hsae07dnd2vhivp7ag4@group.calendar.google.com';

// every minute at 42"
var CALENDAR_REFRESH_INTERVAL = ''42 * * * * *'';
/*
function getTodaysAlarm(nextEvents) {

  var date = (new Date()).toISOString().substr(0, 10);

  // search in next events to see if there is an alarm for today
  for(var i = 0; i < nextEvents.length; i++) {
    if(typeof nextEvents[i].start.dateTime != 'undefined') {
      var startDate = nextEvents[i].start.dateTime.substr(0, 10);
      if(startDate == date && startDate > (new Date()).toISOString()) {
        return new Date(nextEvents[i].start.dateTime);
      }
    }
  }

  // no alarm found, use defaults
  switch((new Date()).getDay()) {

    // mon-fri: 07:00
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    f
      return new Date(date+'T07:00:00+01:00');

    // sat-sun: no alarm
    case 6:
    case 0:
      return null;
  }

  return null;
}*/

function triggerAlarm()
{
  console.log('AAAAALLLLLAAAAAAAAARRRRRRRRRMMMMMMM !!!!!!!!!!!');
}


var alarm = null;

// every minute, check when is the next alarm and schedule the alarm if found
var alarmSetter = schedule.scheduleJob(CALENDAR_REFRESH_INTERVAL, function() {

  console.log("alarm setter");
  googleCalendar.getNextEvents(SECRET_FILE, CALENDAR_ID).then(

    function(events) {

      var date = null;
      // take the first upcoming event in google calendar next events
      for(var i = 0; i < events.length; i++) {
        if(typeof events[i].start.dateTime != 'undefined') {
          var startDate = new Date(events[i].start.dateTime);

          if(startDate && startDate.getTime() > (new Date()).getTime()) {
            date = startDate;
            break;
          }
        }
      }

      if(alarm) {
        alarm.cancel();
      }
      if(date) {
        console.log('schedule alarm at '+date);
        alarm = schedule.scheduleJob(date, function() {
          triggerAlarm();
        });
      }
    },

    function(err) {
      console.log('Error when connecting to google calendar: ' + err);
    }
  );
});
