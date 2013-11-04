/*jshint -W079 */

var Canvas = require("1gamlib/canvas").Canvas;
var Map = require("./map");
var Log = require("./netlog");

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
        for(var handler in mapEvents) {
            play[handler] = mapEvents[handler];
        }
        //map.on("select", unitControl.select);
    };
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
        }
    };
    attachMapEvents();
    return play;
};

module.exports = Play;
