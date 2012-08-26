Function.prototype.bind = function(scope) {
  var _function = this;

  return function() {
    return _function.apply(scope, arguments);
  }
}

window.battle = (function() {
  var battle = {
    setCanvas: function(canvas) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d');

      this.backgroundGradientStyle = this.context.createRadialGradient(
        this.canvas.width / 2,
        this.canvas.height / 2,
        0,
        this.canvas.width / 2,
        this.canvas.height / 2,
        Math.sqrt(
          (this.canvas.width / 2) * (this.canvas.width / 2) +
          (this.canvas.height / 2) * (this.canvas.height / 2)
        )
      );
      this.backgroundGradientStyle.addColorStop(0, 'rgba(0,0,0,0.3)');
      this.backgroundGradientStyle.addColorStop(1, 'rgba(0,0,0,0.9)');

      return this;
    },
    fillRectBackgroundGradient: function(x, y, w, h) {
      this.context.fillStyle = this.backgroundGradientStyle;

      this.context.fillRect(x, y, w, h);
    },
    lastSparklePoint: null,
    sparkleEffect: function(point) {
      if (this.lastSparklePoint) {
        this.context.globalCompositeOperation = 'copy';
        this.fillRectBackgroundGradient(this.lastSparklePoint.x - 30, this.lastSparklePoint.y - 30, 60, 60);
      }
      this.context.globalCompositeOperation = 'source-over';
      this.lastSparklePoint = point;
      for (var i = 0; i < 5; i += 1) {
        var newPoint = {x: point.x - 20 + Math.floor(Math.random()*40), y: point.y - 20 + Math.floor(Math.random()*40)};
        this.context.beginPath();
        this.context.moveTo(point.x, point.y);
        this.context.lineTo(newPoint.x, newPoint.y);
        this.context.strokeStyle = 'rgba(255,255,255,0.4)';
        this.context.lineWidth = 5;
        this.context.stroke();
      }
      var gradient = this.context.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        30
      );
      gradient.addColorStop(0, 'rgba(255,255,255,0.6)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      this.context.fillStyle = gradient;
      this.context.fillRect(point.x - 30, point.y - 30, 60, 60);
    },
    beginMouseEffect: function() {
      var battle = this;
      var mouseEffect = {
        locations: [],
        run: function() {
          if (typeof(this.interval === undefined)) {
            var mouseEffect = this;
            this.startMouseTracking();
            this.interval = setInterval(function() {
              if (this.locations.length > 1) {
                battle.context.lineCap = 'round';
                battle.context.lineJoin = 'round';

                var currentLocation = this.locations.shift();
                var firstLocation = currentLocation;

                battle.context.beginPath();
                battle.context.moveTo(currentLocation.x, currentLocation.y);
                this.locations.push(currentLocation);
                currentLocation = this.locations.shift();
                while (!(currentLocation.x === firstLocation.x && currentLocation.y === firstLocation.y)) {
                  battle.context.lineTo(currentLocation.x, currentLocation.y);
                  this.locations.push(currentLocation);
                  currentLocation = this.locations.shift();
                }
                this.locations.unshift(currentLocation);
                battle.context.globalCompositeOperation = 'copy';
                battle.context.lineWidth = 11;
                battle.context.strokeStyle = battle.backgroundGradientStyle;
                battle.context.stroke();

                while (this.locations.length > 50) {
                  this.locations.shift();
                }

                currentLocation = this.locations.pop();
                this.locations.push(currentLocation);
                battle.sparkleEffect(currentLocation);

                var time = (new Date()).getTime();

                battle.context.globalCompositeOperation = 'source-over';
                battle.context.lineWidth = 7 + Math.sin(time/200)*3;
                battle.context.strokeStyle = 'rgba(200,100,150,0.3)';

                battle.context.beginPath();
                currentLocation = this.locations.shift();
                firstLocation = currentLocation;
                battle.context.moveTo(currentLocation.x, currentLocation.y);
                this.locations.push(currentLocation);
                currentLocation = this.locations.shift();
                while (!(currentLocation.x === firstLocation.x && currentLocation.y === firstLocation.y)) {
                  battle.context.lineTo(currentLocation.x, currentLocation.y);
                  this.locations.push(currentLocation);
                  currentLocation = this.locations.shift();
                }
                this.locations.unshift(currentLocation);
                battle.context.stroke();
              }
            }.bind(this), 35);
          }
        },
        pause: function() {
          clearInterval(this.interval);
          this.stopMouseTracking();
        },
        startMouseTracking: function() {
          this.mouseTrackingBind = $(battle.canvas).mousemove(function(event) {
            var newLocation = {
              x: event.pageX - $(battle.canvas).offset().left,
              y: event.pageY - $(battle.canvas).offset().top
            };
            var lastLocation = mouseEffect.locations.pop();
            if (lastLocation) {
              mouseEffect.locations.push(lastLocation);
            }
            if (!lastLocation || Math.abs(newLocation.x - lastLocation.x) > 3 || Math.abs(newLocation.y - lastLocation.y) > 3) {
              mouseEffect.locations.push(newLocation);
            }
          });
        },
        stopMouseTracking: function() {
          $.unbind(this.mouseTrackingBind);
        }
      }

      $(this.canvas).mouseenter(function() {
        mouseEffect.run();
      }).mouseleave(function() {
        mouseEffect.pause();
      });
    },
    begin: function() {
      this.fillRectBackgroundGradient(0, 0, this.canvas.width, this.canvas.height);
      this.beginMouseEffect();

      return this;
    }
  };

  return {
    addProtoCanvas: function() {
      $('#game').append('<canvas id="battle" width="640" height="480" />');
      return $('#battle').css('z-index', '3')[0];
    },
    runProto: function() {
      battle.setCanvas(this.addProtoCanvas()).begin();
    },
    run: function(canvas) {
      battle.setCanvas(canvas).begin();
    }
  };
})();
