
var SonosDiscovery = require('sonos-discovery');
var discovery = new SonosDiscovery();

var PLAYER_NAME = 'Chambre';
var PLAYLIST_TO_PLAY = 'France Inter';
var player = null;

module.exports = {

  init: function() {

    if(player) {
      return;
    }

    // find player in the list of all players
    for (var uuid in discovery.players) {
      var currentPlayer = discovery.players[uuid];
      var simple = currentPlayer.convertToSimple();
      if(simple.roomName == PLAYER_NAME) {
        player = currentPlayer;
        break;
      }
    }
  },

  startPlaying: function() {
    this.init();

    console.log('-- start playing --');

    player.getFavorites(function (success, favorites) {

        var toPlay = null;
        for (var i = 0; i < favorites.length; i++) {
          if(favorites[i].title == PLAYLIST_TO_PLAY) {
            toPlay = favorites[i];
            break;
          }
        }
        console.log(toPlay);
        if(toPlay) {
          player.replaceQueueWithPlaylist(toPlay.uri.toLowerCase(), function (success) {
          if (success) {
            console.log("replaced queue with playlist "+ player.title + ".");
            player.setVolume(15)
            player.play();
          }
        });
        }
    });

    /*
    if(masterPlayer) {

      //mute / unmute
      socket.on('mute', function(mute) {
        masterPlayer.groupMute(mute);
      });


      discovery.on('group-mute', function (data) {
        socket.emit('group-mute', data);
      });

      socket.emit('state', masterPlayer.convertToSimple());
    }
*/




  }




}
