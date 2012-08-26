/*
 * Module dependencies
 */
var http = require('http'),
    fs = require('fs'),
    io = require('socket.io'),
    sprite_factory = require('./js/sprite-factory'),
    playerBuffer = require('./js/player-buffer'),
    common = require('./js/mmo-common');
    
/*
character = sprite_factory.loadSheet('character', function(canvas) {
  console.log(canvas.getContext('2d'));
  
  var out = fs.createWriteStream(__dirname + '/img/sheet.png'),
      stream = canvas.createPNGStream();

  stream.on('data', function(chunk) {
    out.write(chunk);
  });
  
});
*/


/*
 * Create a new http server for our page output
 
var htmlServer = http.createServer(function(request, response) {
  
}).listen(3000);
*/

var spritesheets = {};

/*
 * Create a new http server for our socket.io instance
 * Serves no purpose for output as is?
 */
var ioServer = http.createServer(function(request, response) {
  
  // Do we need this?
  response.writeHead(200, {
    'Content-type': 'text/html'
  });
  response.end('fuubar');
  
});
ioServer.listen(9001);

/*
 * Set up the socket.io listener
 */
var ioSocket = io.listen(ioServer);

// Main connection listener
ioSocket.on('connection', function(client) {
  
  // Give the user their sprite
  sprite_factory.loadSheet('character', function(canvas) {
    
    spritesheets.character = canvas;
    
    console.log('[Initial CharacterSheet Loaded]');
    
    // Send client their character sheet as a data url
    common.sendClientMessage(client, 'character_sheet', canvas.toDataURL());
    
  });

  // When a client prods us with data
  client.on('message', function(message) {
        
    switch (message.type) {
      // New Player Joined
      case 'joined':
        message.data.spritesheetDataURL = spritesheets.character.toDataURL();
        common.sendClientBroadcast(client, 'joined', message.data);

        // Send da buffer
        playerBuffer.send(client);

        // set join in da buffer
        playerBuffer.set(client.sessionId, message.data);

        console.log('[New Player Joined: '+ client.sessionId +']');
      break;
      // Player moved
      case 'player_moved':
        common.sendClientBroadcast(client, 'player_moved', message.data);

        // set movement in da buffer
        playerBuffer.set(client.sessionId, message.data);

        console.log('[Player #'+ client.sessionId +' Moved]');
      break;
    }
    
  });
  
  // Y art dey leaving?
  client.on('disconnect', function() {

    common.sendClientBroadcast(client, 'disconnected', null);

    // remove from da buffer
    playerBuffer.remove(client.sessionId);

    console.log('[Player Disconnected: '+ client.sessionId +']');

  });
  
});

/*
var http = require('http'),
    Canvas = require('canvas'),
    char_sprite = new Canvas(32, 32),
    char_sprite_ctx = char_sprite.getContext('2d'),
    Image = Canvas.Image,
    filesys = require('fs');
    
function Character() {
  this.facing = 'south';
  this.sprite = null;
}
Character.prototype = {
  
};
    
var img = new Image;
img.onload = function() {
  char_sprite_ctx.drawImage(img, 0, 0);
};
img.src = __dirname + '/img/character.png';

var out = filesys.createWriteStream(__dirname + '/img/sprite.png'),
    stream = char_sprite.createPNGStream();
    
stream.on('data', function(chunk) {
  out.write(chunk);
});
*/



