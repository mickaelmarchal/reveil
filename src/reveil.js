var googleCalendar = require('./googlecalendar.js');
var sonos = require('./sonos.js');
var schedule = require('node-schedule');

var SECRET_FILE = '../client_secret.json';
var CALENDAR_ID = 'jnk4q16hsae07dnd2vhivp7ag4@group.calendar.google.com';

// every minute at 42"
var CALENDAR_REFRESH_INTERVAL = '42 * * * * *';


function triggerAlarm()
{
  console.log('AAAAALLLLLAAAAAAAAARRRRRRRRRMMMMMMM !!!!!!!!!!!');
  sonos.startPlaying();
}


var alarm = null;

// every minute, check when is the next alarm and schedule the alarm if found
var alarmSetter = schedule.scheduleJob(CALENDAR_REFRESH_INTERVAL, function() {

  sonos.init();

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
