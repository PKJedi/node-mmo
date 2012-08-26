var Canvas = require('canvas');

exports.loadSheet = function(sheet_name, callback) {
  
  var sheet_canvas = new Canvas(96, 128),
      sheet_context = sheet_canvas.getContext('2d'),
      sheet_img = new Canvas.Image;
            
  sheet_img.onload = function() {
    sheet_context.drawImage(sheet_img, 0, 0);    
    callback(sheet_canvas);
  };
  
  sheet_img.onerror = function(fff) {
    console.log(fff);
  };

  sheet_img.src = __dirname + '/../img/sheets/' + sheet_name + '.png'; 
  
};