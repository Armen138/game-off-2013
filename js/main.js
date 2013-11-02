var Canvas = require("1gamlib/canvas").Canvas;
var Resources = require("1gamlib/resources").Resources;
var Menu = require("./menu");
var game = require("1gamlib/game").game;
var files = require("./files");
var Play = require("./play");
var Landing = require("./landing");
Canvas.size({
    width: window.innerWidth,
    height: window.innerHeight
});

var menuOptions = ["New Game", "Options"];
if(localStorage.profile) {
    menuOptions.unshift("Continue");
}
var landing = new Landing();
var menu = new Menu(menuOptions);
menu.on("New Game", function() {
    game.state = new Play();
});

menu.on("Continue", function() {
    game.state = new Play(JSON.parse(localStorage.profile));
});
landing.on("done", function() {
    game.state = menu;
});
game.state = landing;//menu;
game.run();
Resources.on("load", function() {
    landing.loadComplete();
});

Resources.load(files);
