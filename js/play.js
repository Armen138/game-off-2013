/*jshint -W079 */

var Canvas = require("1gamlib/canvas").Canvas;
var Resources = require("1gamlib/resources").Resources;
var Particles = require("1gamlib/particles").Particles;
var Map = require("./map");
var Log = require("./netlog");
var Unit = require("./unit");
var Item = require("./item");
var NPC = require("./npc");
var astar = require("./astar");

var particleFeedback = function(position) {
    return  Particles({
        "position":{ "X": position.X, "Y": position.Y },
        "image":"particle",
        "scale":{"min":0.5,"max":1},
        "speed":{"min":0.001,"max":0.1},
        "ttl":{"min":399,"max":400},
        "count":50,
        "systemTtl": 300
    });
};

var particles = {
    systems: [],
    draw: function() {
        for(var i = 0; i < particles.systems.length; i++) {
            particles.systems[i].draw();
        }
    }
};

var ui = {
    root: {},
    inventory: {
        init: function(inventory) {
            ui.root.inventory = ui.inventory;
            ui.inventory.items = inventory;
        },
        toggle: function() {
            return ui.inventory.visible ? ui.inventory.hide() : ui.inventory.show();
        },
        show: function() {
            ui.inventory.visible = true;
            return ui.inventory.visible;
        },
        hide: function() {
            ui.inventory.visible = false;
            return ui.inventory.visible;
        },
        visible: true,
        draw: function(){
            if(ui.inventory.visible) {
                Canvas.context.fillStyle= "rgba(150, 150, 150, 0.9)";
                var x = Canvas.width / 2 - ui.inventory.items.length / 2 * 52;
                var y = Canvas.height - 64;
                for(var i = 0; i < ui.inventory.items.length; i++) {
                    var item = ui.inventory.items[i];
                    Canvas.context.fillRect(x + i * 52, y, 48, 48);
                    Canvas.context.drawImage(Resources[item.icon()], x + i * 52, y, 48, 48);
                }
            }
        },
        click: function(mouse) {
            var x = Canvas.width / 2 - ui.inventory.items.length / 2 * 52;
            var y = Canvas.height - 64;

            for(var i = 0; i < ui.inventory.items.length; i++) {
                if (mouse.X > x + i * 52 && mouse.X < x + i * 52 + 48 &&
                    mouse.Y > y && mouse.Y < y + 48) {
                    console.log("use item");
                    ui.inventory.items[i].use();
                    return true;
                 }
            }
            return false;
        }
    },
    dialog: function(title, dialog, callback) {
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
                    Canvas.context.fillStyle= "rgba(150, 150, 150, 0.9)";
                    Canvas.context.lineWidth = 4;
                    Canvas.context.strokeStyle = "black";
                    Canvas.context.fillRect(100, 100, Canvas.width - 200, 200);
                    Canvas.context.strokeRect(100, 100, Canvas.width - 200, 200);
                    Canvas.context.fillStyle = "black";
                    Canvas.context.fillText(title, 140, 140);
                    Canvas.context.font = "24px Rationale";
                    Canvas.context.fillText(dialog, 140, 180);
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
    //for(var x = 0; x < 100; x++) {
        //tiles[x] = [];
        //for(var y = 0; y < 100; y++) {
            //tiles[x][y] = Math.random() < 0.5 ? 0 : 1;
        //}
    //}
    var map = new Map();
    map.load("test2");
    var attachMapEvents = function() {
        //for(var handler in mapEvents) {
            //play[handler] = mapEvents[handler];
        //}
        map.on("select", playerAction);
    };
    var npc = new NPC(40, 40, 0, map);
    var player = new Unit(50, 50, 0, map);
    var item = new Item(30, 30, 0, map);
    item.on("pick-up", function(item) {
        play.log.info("You've picked up: " + item.name);
        play.log.info("\"" + item.description + "\"");
        play.inventory.push(item);
    });
    npc.dialog = "Have you seen my journals? I can't find them anywhere!";
    player.on("path-end", function(position) {
        var unit = map.unitFromMap(position.X + 1, position.Y - 1);
        if(unit && unit[0]) {
            unit[0].action();
        }
    });
    npc.on("dialog", function(dialog) {
        ui.dialog(dialog.title, dialog.text, function() {
            if(dialog.accept) {
                play.log.info(dialog.accept);
            }
        });
    });
    var play = {
        inventory: [],
        log: new Log({left: 150, top: 0, width: 400, height: 300}),
        init: function() {
            play.log.info("Start game.");
            saveProfile(profile);
            map.centerOn({X: 50, Y: 50});
        },
        clear: function(callback) { callback(); },
        run: function() {
            map.draw();
            particles.draw();
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
                particles.systems.push(particleFeedback(mouse));
            }
        },
        keydown: function(keycode) {
            if(keycode === 73) { //'i'
                console.log("toggle inventory");
                ui.inventory.toggle();
            }
        }
    };
    ui.inventory.init(play.inventory);
    attachMapEvents();
    return play;
};

module.exports = Play;
