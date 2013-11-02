var Canvas = require("1gamlib/canvas").Canvas;
var Resources = require("1gamlib/resources").Resources;
var Events = require("1gamlib/events").Events;
var Landing = function() {
    var loadComplete = false;
    var message = "Loading...";
    var landing = {
        loadComplete: function() {
            loadComplete = true;
            message = "<Load complete, click to start>";
        },
        init: function() {
            console.log("init landing.");
        },
        clear: function(callback) { callback(); },
        run: function() {
            Canvas.clear();
            if(Resources.logo) {
                Canvas.context.drawImage(Resources.logo, Canvas.width / 2 - Resources.logo.width / 2,
                                                 Canvas.height / 2 - Resources.logo.height / 2);
            }
            Canvas.context.font = "44px Rationale";
            Canvas.context.textAlign = "center";
            Canvas.context.textBaseline = "middle";
            Canvas.context.fillStyle = "black";
            Canvas.context.fillText(message, Canvas.width / 2, Canvas.height / 2 + 300);
        },
        click: function() {
            if(loadComplete) {
                landing.fire("done");
            }
        }
    };
    Events.attach(landing);
    return landing;
};

module.exports = Landing;
