var Canvas = require("1gamlib/canvas").Canvas;
var easing = require("1gamlib/easing").easing;
var Events = require("1gamlib/events").Events;
var Button = function(label, index) {
    var start = Date.now();
    var ready = false;
    var color = "rgba(125, 120, 117, 0.5)";
    var size = {
        width: 400,
        height: 60,
        margin: 30
    };
    var from = {
        X: -size.width,
        Y: index * (size.height + size.margin) + size.margin
    };
    var to = {
        X: size.width + size.margin,
        Y: from.Y
    };
    var duration = 500;
    var button = {
        position: {
            X: from.X,
            Y: from.Y
        },
        label: label,
        has: function(mouse) {
            return (mouse.X > button.position.X &&
                mouse.X < button.position.X + size.width &&
                mouse.Y > button.position.Y &&
                mouse.Y < button.position.Y + size.height);
        },
        hover: function(over) {
            if(over) {
                color = "rgba(255, 0, 0, 0.4)";
            } else {
                color = "rgba(125, 120, 117, 0.5)";
            }
        },
        draw: function() {
            var now = Date.now();
            if(!ready && now - start < duration) {
                button.position.X = easing(now - start, from.X, to.X, duration);
            } else {
                if(!ready) {
                    button.position.X = from.X + to.X;
                    ready = true;
                    button.fire("ready");
                }
            }
            Canvas.context.save();
            Canvas.context.textAlign = "center";
            Canvas.context.textBaseline = "middle";
            Canvas.context.font = "32px Rationale";
            Canvas.context.lineCap = "round";
            Canvas.context.fillStyle = color; //"rgba(125, 120, 117, 0.5)";
            Canvas.context.strokeStyle = "rgba(110, 105, 102, 1.0)";
            Canvas.context.translate(button.position.X, button.position.Y);
            Canvas.context.fillRect(0, 0, size.width, size.height);
            Canvas.context.lineWidth = 4;
            Canvas.context.strokeText(button.label, size.width / 2, size.height / 2);
            Canvas.context.fillStyle = "black";
            Canvas.context.lineWidth = 12;
            Canvas.context.fillText(button.label, size.width / 2, size.height / 2);
            Canvas.context.strokeRect(0, 0, size.width, size.height);
            Canvas.context.restore();
        }
    };
    Events.attach(button);
    return button;
};
/*
 * Main menu state
 * @class
 * @param {Array} buttons An array of strings to appear as button labels.
 */
var Menu = function(buttons) {
    var items = [];
    var menu = {
        init: function() {
            var index = 0;
            function createButton() {
                var button = Button(buttons[index], index);
                items.push(button);
                button.on("ready", function() {
                    index++;
                    if(index < buttons.length) {
                        createButton();
                    }
                });

            }
            createButton();
        },
        clear: function(callback) {
            callback();
        },
        click: function(mouse) {
            for(var i = 0; i < items.length; i++) {
                if(items[i].has(mouse)) {
                    menu.fire("click", items[i]);
                }
            }
        },
        mousemove: function(mouse) {
            for(var i = 0; i < items.length; i++) {
                if(items[i].has(mouse)) {
                    items[i].hover(true);
                } else {
                    items[i].hover(false);
                }
            }
        },
        run: function() {
            Canvas.clear();
            for(var i = 0; i < items.length; i++) {
                items[i].draw();
            }
        }
    };
    Events.attach(menu);
    return menu;
};

module.exports = Menu;
