/**
 * Test Game Script
 */
(function() {

  var canvases = $('#game > canvas'),
      // Game background & environment
      field = canvases[0],
      fieldContext = field.getContext('2d'),
      // Player layer
      actors = canvases[1],
      actorsContext = actors.getContext('2d'),
      // Over-player layer
      overlay = canvases[2],
      overlayContext = overlay.getContext('2d');

  // Load and draw game field background pattern
  var grassBackground = new Image;
  grassBackground.onload = function() {
    var grassPattern = fieldContext.createPattern(grassBackground, 'repeat');
    fieldContext.fillStyle = grassPattern;
    fieldContext.fillRect(0, 0, field.width, field.height);
  };
  grassBackground.src = 'img/grass.png';

  // Players
  var player,
      players = [];

  /*
   * Spritesheet Object
   */
  function CharacterSheet(dataURL, callback) {
    this.image = new Image;

    this.spriteSize = {
      width: 32,
      height: 32
    };

    if (typeof dataURL != 'undefined') {
      this.createFromData(dataURL, callback);
    }
  }
  CharacterSheet.prototype = {

    // Directional offsets for sprites
    offsets: {
      south: 0, west: 32,
      east: 64, north: 96
    },

    // Create a new spritesheet object from canvas data
    createFromData: function(dataURL, callback) {
      // Cache into local scope
      var self = this,
          image = self.image;

      // Post-load callback
      image.onload = function() {
        self.image = image;
        callback(self);
      };

      // Load from data url
      image.src = dataURL;
    }

  };

  /*
   * Character Object
   */
  function Character(characterSheet) {
    this.sheet = characterSheet; // typeof CharacterSheet
    this.coordinates = {x: 0, y: 0};
    this.sprite = 'south';
    this.spriteOffsets = {
      x: 32,
      y: 0
    };
  }
  Character.prototype = {

    draw: function(coordinates) {

      this.clearSprite();

      this.coordinates = coordinates;

      actorsContext.drawImage(
        this.sheet.image,
        this.spriteOffsets.x,
        this.spriteOffsets.y,
        this.sheet.spriteSize.width,
        this.sheet.spriteSize.height,
        this.coordinates.x,
        this.coordinates.y,
        this.sheet.spriteSize.width,
        this.sheet.spriteSize.height
      );

    },

    setSprite: function(direction) {
      switch (direction) {
        case 'north':
          this.sprite = 'north';
          this.spriteOffsets = {x: 32, y: 96};
          break;
        case 'west':
          this.sprite = 'west';
          this.spriteOffsets = {x: 32, y: 32};
          break;
        case 'east':
          this.sprite = 'east';
          this.spriteOffsets = {x: 32, y: 64};
          break;
        case 'south':
          this.sprite = 'south';
          this.spriteOffsets = {x: 32, y: 0};
          break;
      }
    },

    clearSprite: function() {

      actorsContext.clearRect(
        this.coordinates.x,
        this.coordinates.y,
        this.sheet.spriteSize.width,
        this.sheet.spriteSize.height
      );

    },

    getPlayerInfo: function() {
      var playerInfo = {
        coordinates: this.coordinates,
        sprite: this.sprite
      };
      return playerInfo;
    }

  };

  var socket = new io.Socket('bo.cx', {
    port: 9001
  });
  socket.connect();

  socket.on('message', function(message) {

    console.log(message);

    switch (message.type) {

      // Getting player character sheet
      case 'character_sheet':

        var csheet = new CharacterSheet(message.data, function(sheet) {
          player = new Character(sheet);
          player.draw({x: 0, y: 0});
          players.push({player: player, sessionId: message.sessionId});

          socket.send({
            type: 'joined',
            data: player.getPlayerInfo()
          });

        });

      break;

      case 'joined':
        var csheet = new CharacterSheet(message.data.spritesheetDataURL, function(sheet) {

          var newplayer = new Character(sheet);
          newplayer.setSprite(message.data.sprite);

          // set to prevent clearing 0,0
          newplayer.coordinates = message.data.coordinates;

          newplayer.draw(message.data.coordinates);

          players.push({sessionId: message.sessionId, player: newplayer});
        });
      break;

      case 'player_moved':
        for (var i = 0, j = players.length; i < j; i += 1) {
          if (players[i].sessionId == message.sessionId) {
            players[i].player.setSprite(message.data.sprite);
            players[i].player.draw(message.data.coordinates);
          }
        }
      break;

      case 'disconnected':
        for (var i = 0, j = players.length; i < j; i += 1) {
          if (players[i].sessionId == message.sessionId) {
            players[i].player.clearSprite();
            players.splice(i, 1);
          }
        }
      break;

      default:
        console.log(message);
      break;
    }

  });

  /*
   * Player movement
   */
  $(document).bind('keyup', function(event) {
    switch (event.keyCode) {
      // Left
      case 37:
        player.setSprite('west');
        player.draw({x: player.coordinates.x - 32, y: player.coordinates.y});
        break;
      // Up
      case 38:
        player.setSprite('north');
        player.draw({x: player.coordinates.x, y: player.coordinates.y - 32});
        break;
      // Right
      case 39:
        player.setSprite('east');
        player.draw({x: player.coordinates.x + 32, y: player.coordinates.y});
        break;
      // Down
      case 40:
        player.setSprite('south');
        player.draw({x: player.coordinates.x, y: player.coordinates.y + 32});
        break;
      default:
        return;
    }

    socket.send({
      type: 'player_moved',
      data: player.getPlayerInfo()
    });
  });

})();
