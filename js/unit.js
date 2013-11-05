var Canvas = require("1gamlib/canvas").Canvas;
var Settings = require("./settings");
//var Particles = require("./particles");
var Sponge = require("1gamlib/sponge").Sponge;
var Events = require("1gamlib/events").Events;
var Resources = require("1gamlib/resources").Resources;


function distance(p1, p2) {
    var xdiff = Math.abs(p1.X / 32 - p2.X / 32),
        ydiff = Math.abs(p1.Y / 32 - p2.Y / 32);
    return Math.sqrt(Math.pow(xdiff, 2) + Math.pow(ydiff, 2));
}

function render(def, position, angle, center) {
    var now        = Date.now();
    var angles = {};
    var direction = 1;
    var image    = Resources[def.image] || Resources[def.image.active[def.frame || 0]];
    var p = position; //{X:  position.X + center.X, Y: position.Y + center.Y };
    center = center || {X: image.width / 2, Y: image.height / 2 };
    Canvas.context.save();
    Canvas.context.translate(p.X, p.Y);
    Canvas.context.drawImage(image, -center.X, -center.Y);
    Canvas.context.restore();
    render.last = now;
}

render.last = 0;
render.lastFrame = 0;

var Unit = function(tileX, tileY, id, map) {
    var fireTime = 0;
    var dying = false;
    var settings = Settings();
    var def = {
        image: "player",
        size: 128,
        target: false,
        rotation: 0,
        position: {X: 37, Y: 128}
    };//renderModel[data.name];
    var tileTime = 0;
    var stats = {
        angle: 0,
        cannonAngle: 0,
        kills: 0,
        fireTime: 0,
        incomeTime: 0,
        tileTime: 0
    };
    var data = {
        name: "test1",
        range: 5,
        speed: 400
    };
    var unit = {};
    Sponge.attach(unit);
    Events.attach(unit);
    unit.absorb(data);
    unit.absorb({
        size: def.size,
        type: data.name,
        dead: false,
        angle: 0,
        path: [],
        range: data.range,
        id: id,
        position: {
            X: tileX * settings.tileSize,
            Y: tileY * settings.tileSize
        },
        tilePosition: {
            X: tileX,
            Y: tileY
        },
        badge: "",
        syncPosition: function(serverPosition, tts) {
            console.log("sync position");
            var pos = tts(serverPosition.X, serverPosition.Y);
            unit.position.X = pos.X;
            unit.position.Y = pos.Y;
            unit.tilePosition.X = serverPosition.X;
            unit.tilePosition.Y = serverPosition.Y;
            unit.map.unitToMap(unit, unit.tilePosition.X, unit.tilePosition.Y);
        },
        update: function() {
            if(!dying && !unit.dead && unit.health < 0) {
                dying = true;
                Resources.explosion.play();
                //if(unit.owner.id === 0) {
                    unit.fire("death");
                //}
                unit.explosion = Particles(
                    {
                        "position":{ "X": unit.position.X + unit.size / 2, "Y": unit.position.Y + unit.size / 2},
                        "image":"particle",
                        "scale":{"min":0.5,"max":1},
                        "speed":{"min":0.001,"max":0.1},
                        "ttl":{"min":399,"max":400},
                        "count":50,
                        "systemTtl": 300
                    }
                );
                unit.explosion.on("death", function() {
                    unit.dead = true;
                });
            }
            if(unit.target && unit.target.dead) {
                unit.target = null;
                if(unit.owner.id === 0) {
                    // Resources.targetdestroyed.play();
                }
            }
        },
        draw: function(tts) {
            var now = Date.now();
            if(dying && unit.explosion) {
                unit.explosion.draw();
                return false;
            }
            unit.update();
            if(unit.path.length > 0) {
                var curTime = now - tileTime;
                if(curTime > data.speed) {
                    var to = unit.path.shift();
                    unit.syncPosition(to, tts);
                    tileTime = now;
                } else {
                    var p0 = tts(unit.path[0].X, unit.path[0].Y);
                    var p1 = tts(unit.tilePosition.X, unit.tilePosition.Y);
                    var xdest = p0.X, //unit.path[0].X * settings.tileSize,
                        ydest = p0.Y, //unit.path[0].Y * settings.tileSize,
                        xtarg = p1.X, //unit.tilePosition.X * settings.tileSize,
                        ytarg = p1.Y, //unit.tilePosition.Y * settings.tileSize,
                        xdiff = xdest - xtarg,
                        ydiff = ydest - ytarg,
                        fract = parseFloat(curTime) / parseFloat(data.speed);
                    unit.position.X = xtarg + (fract * xdiff) | 0;
                    unit.position.Y = ytarg + (fract * ydiff) | 0;
                    unit.angle = Math.atan2((unit.path[0].X - unit.tilePosition.X),
                        (unit.tilePosition.Y - unit.path[0].Y));
                }
            } else {
                var pos = tts(unit.tilePosition.X, unit.tilePosition.Y);
                unit.position.X = pos.X;
                unit.position.Y = pos.Y;

            }
            if(unit.target) {
                now = Date.now();
                var dist = distance(unit.target.position, unit.position);
                if(dist < unit.range) {
                    if(now - fireTime > unit.loadTime) {
                        unit.fire("projectile", {
                            time: dist * 100,
                            target: {
                                X: unit.target.position.X + unit.target.size / 2,
                                Y: unit.target.position.Y + unit.target.size / 2
                            },
                            origin: {
                                X: unit.position.X + 16,
                                Y: unit.position.Y + 16
                            }
                        });
                        fireTime = now;
                    } else if(unit.path.length === 0) {
                        // console.log("move to target");
                    }
                }

            }
            if(unit.selected) {
                Canvas.context.strokeStyle = "rgba(0, 255, 0, 0.3)";
                Canvas.context.strokeRect(unit.position.X, unit.position.Y, 32, 32);
            }
            var t = null;
            if(unit.target) {
                t = unit.target.position;
            }
            Canvas.context.save();
            render(def, unit.position, unit.angle, def.position);
            Canvas.context.restore();
            return unit.dead;
        }
    });
    unit.map = map;
    unit.map.unitToMap(unit, unit.tilePosition.X, unit.tilePosition.Y);
    return unit;
};

module.exports =  Unit;
