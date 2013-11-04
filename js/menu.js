var Canvas = require("1gamlib/canvas").Canvas;
var Resources = require("1gamlib/resources").Resources;
var easing = require("1gamlib/easing").easing;
var Events = require("1gamlib/events").Events;
/*
 * @private
 * @class
 * @param {String} label Label to display on the button
 * @param {Number} index Order in which to display button
 */
var Button = function(label, index, options) {
    options = options || {};
    var start = Date.now();
    var retreat = false;
    var ready = false;
    var color = options.color || "rgba(125, 120, 117, 0.5)";
    var stroke = options.stroke || "rgba(110, 105, 102, 1.0)";
    var size = {
        width: options.width || 400,
        height: options.height || 60,
        margin: options.margin || 30
    };
    var from = {
        X: -size.width,
        Y: index * (size.height + size.margin) + size.margin
    };
    var to = {
        X: size.width + size.margin,
        Y: from.Y
    };
    var duration = options.duration || 200;
    /*
     * @alias Button
     */
    var button = {
        position: {
            X: from.X,
            Y: from.Y
        },
        retreat: function() {
            retreat = true;
            start = Date.now();
            ready = false;
        },
        label: label,
        /*
         * @member
         * @param {Vector} mouse Position queried
         * @returns true if the given position falls inside this button
         */
        has: function(mouse) {
            return (mouse.X > button.position.X &&
                mouse.X < button.position.X + size.width &&
                mouse.Y > button.position.Y &&
                mouse.Y < button.position.Y + size.height);
        },
        /*
         * Set or unset 'hover' state
         * @member
         * @param {boolean} over To set hover, or not to set hover, that is the question.
         */
        hover: function(over) {
            if(over) {
                color = "rgba(255, 255, 255, 0.4)";
            } else {
                color = "rgba(125, 120, 117, 0.5)";
            }
        },
        /*
         * Draw the stupid button already.
         */
        draw: function() {
            var now = Date.now();
            if(!ready && now - start < duration) {
                if(!retreat) {
                    button.position.X = easing(now - start, from.X, to.X, duration);
                } else {
                    button.position.X = easing(now - start, from.X + to.X, -to.X, duration);
                }
            } else {
                if(!ready) {
                    ready = true;
                    if(!retreat) {
                        button.fire("ready");
                        button.position.X = from.X + to.X;
                    }  else {
                        button.fire("done");
                        button.position.X = from.X;
                    }
                }
            }
            Canvas.context.save();
            Canvas.context.textAlign = "center";
            Canvas.context.textBaseline = "middle";
            Canvas.context.font = "32px Rationale";
            Canvas.context.lineCap = "round";
            Canvas.context.fillStyle = color;
            Canvas.context.strokeStyle = stroke;
            Canvas.context.translate(button.position.X, button.position.Y);
            Canvas.context.fillRect(0, 0, size.width, size.height);
            Canvas.context.lineWidth = 2;
            Canvas.context.strokeText(button.label, size.width / 2, size.height / 2);
            Canvas.context.fillStyle = "black";
            Canvas.context.lineWidth = 1;
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
    var drawBackground = function() {
        var screenAspect = Canvas.width / Canvas.height;
        var bgAspect = Resources.sketch.width / Resources.sketch.height;
        var width = 0;
        var height = 0;
        var position = {X: 0, Y: 0};
        if(bgAspect < screenAspect) {
            width = Canvas.width;
            height = Canvas.width / bgAspect;
            position.Y = (Canvas.height - height) / 2;
        } else {
            width = Canvas.height * bgAspect;
            height = Canvas.height;
            position.X = (Canvas.width - width) / 2;
        }
        Canvas.context.drawImage(Resources.sketch, position.X, position.Y, width, height);
    };
    var drawFooter = function() {
        Canvas.context.save();
        Canvas.context.font = "12px Rationale";
        Canvas.context.textAlign = "center";
        Canvas.context.textBaseline = "middle";
        Canvas.context.fillStyle = "black";
        Canvas.context.translate(Canvas.width / 2, Canvas.height - 50);
        Canvas.context.fillText("(C) 2013 armen & tsatse", 0, 0);
        Canvas.context.restore();
    };
    var items = [];
    var menu = {
        init: function() {
            var index = 0;
            function createButton() {
                var button = new Button(buttons[index], index);
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
            var index = 0;
            function removeButton() {
                button = items[index];
                button.retreat();
                button.on("done", function() {
                    index++;
                    if(index < buttons.length) {
                        removeButton();
                    }  else {
                        callback();
                    }
                });
            }
            removeButton();
        },
        click: function(mouse) {
            var test = function() { console.log("done"); };
            for(var i = 0; i < items.length; i++) {
                if(items[i].has(mouse)) {
                    menu.fire(items[i].label);
                    //menu.clear(test);
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
            drawBackground();
            for(var i = 0; i < items.length; i++) {
                items[i].draw();
            }
            drawFooter();
        }
    };
    Events.attach(menu);
    return menu;
};

module.exports = Menu;
