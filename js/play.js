/*jshint -W079 */

var Canvas = require("1gamlib/canvas").Canvas;
var Map = require("./map");
var Log = require("./netlog");
var Unit = require("./unit");
var astar = require("./astar");

var ui = {
    root: {},
    dialog: function(dialog, callback) {
        var dialogBox = {
            visible: true,
            click: function(mouse) {
                if(mouse.X > 100 && mouse.X < Canvas.width - 100 &&
                    mouse.Y > 100 && mouse.Y < 300) {
                    dialogBox.visible = false;
                    console.log("ui click.");
                    callback();
                    return true;
                }
            },
            draw: function() {
                if(dialogBox.visible) {
                    Canvas.context.font = "34px Rationale";
                    Canvas.context.fillStyle= "rgba(150, 150, 150, 0.7)";
                    Canvas.context.lineWidth = 4;
                    Canvas.context.strokeStyle = "black";
                    Canvas.context.fillRect(100, 100, Canvas.width - 200, 200);
                    Canvas.context.strokeRect(100, 100, Canvas.width - 200, 200);
                    Canvas.context.fillStyle = "black";
                    Canvas.context.fillText(dialog, 140, 140);
                }
            }
        };

        ui.root.dialog = dialogBox;
    },
    draw: function() {
        for(var item in ui.root) {
            ui.root[item].draw();
        }
    },
    mouseup: function(mouse) {
        for(var item in ui.root) {
            if(ui.root[item].click(mouse)) {
                return true;
            }
        }
        return false;
    }
};
var mapEvents = {
    click: function(mouse) {
        if(mouse.button === 2) {
            //unitControl.selection.deselect();
        }
    },
    mousedown: function(mouse) {
        map.mousedown(mouse, mouse.button);
    },
    mouseup: function(mouse) {
        map.mouseup(mouse, mouse.button);
    },
    mousemove: function(mouse) {
        map.mousemove(mouse);
    }
};

var saveProfile = function(profile) {
    localStorage.profile = JSON.stringify(profile);
};

var Play = function(profile) {
    var playerAction = function(mouse) {
        var walk = true;
        var unit = map.unitFromMap(mouse.X, mouse.Y);
        if(unit  && unit[0]) {
            console.log("do something to this unit");
            console.log(unit);
            if(unit[0].friendly) {
                mouse.X--;
                mouse.Y++;
                console.log("speak");
            } else {
                console.log("attack");
                //walk is false for ranged attack
                walk = false;
            }
        }
        if(walk) {
            var path = astar.findPath(tiles, player.tilePosition, mouse);
            player.path = (path);
        }
    };
    profile = profile || {};
    var tiles = [];
    for(var x = 0; x < 100; x++) {
        tiles[x] = [];
        for(var y = 0; y < 100; y++) {
            tiles[x][y] = Math.random() < 0.5 ? 0 : 1;
        }
    }
    var map = new Map(tiles);
    var attachMapEvents = function() {
        //for(var handler in mapEvents) {
            //play[handler] = mapEvents[handler];
        //}
        map.on("select", playerAction);
    };
    var npc = new Unit(40, 40, 0, map);
    var player = new Unit(50, 50, 0, map);
    npc.dialog = "howdy, pardner";
    player.on("path-end", function(position) {
        var unit = map.unitFromMap(position.X + 1, position.Y - 1);
        if(unit && unit[0]) {
            unit[0].action();
        }
    });
    npc.on("dialog", function(dialog) {
        ui.dialog(dialog, function() {
            play.log.info("Howdy to you too");
        });
    });
    var play = {
        log: new Log({left: 150, top: 0, width: 400, height: 300}),
        init: function() {
            play.log.info("Start game.");
            saveProfile(profile);
            map.centerOn({X: 50, Y: 50});
        },
        clear: function(callback) { callback(); },
        run: function() {
            map.draw();
            play.log.draw();
            ui.draw();
        },
        click: function(mouse) {
        },
        mousemove: function(mouse) {
            map.mousemove(mouse);
        },
        mousedown: function(mouse) {
            map.mousedown(mouse, mouse.button);
        },
        mouseup: function(mouse) {
            if(!ui.mouseup(mouse)) {
                map.mouseup(mouse, mouse.button);
            }
        },
    };
    attachMapEvents();
    return play;
};

module.exports = Play;
