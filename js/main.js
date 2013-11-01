var Canvas = require("1gamlib/canvas").Canvas;
var Resources = require("1gamlib/resources").Resources;
var Menu = require("1gamlib/menu").Menu;
var game = require("1gamlib/game").game;
var files = require("./files");

Canvas.size({
    width: window.innerWidth,
    height: window.innerHeight
});

var menu = Menu(Canvas.element, [
    {
        "label": "New Game",
        "action": function() {
            game.state = newGame;
        }
    },
    {
        "label": "Options",
        "action": function() {
            game.state = options;
        }
    }
], "sketch");

game.state = menu;
Resources.on("load", function() {
    game.run();
});
Resources.load(files);
