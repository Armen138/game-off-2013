/**
 * NetLog, a canvas-based logger for network output and other things
 * @class
 * @param {HTMLContext} canvas.context to draw on
 * @param {object} rect top, left, width, height rectangle to populate on the canvas
 * @param {object} [optional] settings any additional settings you wish to set
 **/
 //define(["1gamlib/canvas"], function(Canvas) {
(function() {
    var Canvas = require("1gamlib/canvas").Canvas;
    var chop = function(msg, width) {
        var words = msg.split(" ");
        Canvas.context.font = "21px Rationale";
        var fit = true;
        var line = [];
        var lines = [];
        while(words.length > 0) {
            line.push(words.shift());
            if(Canvas.context.measureText(line.join(" ")).width > width - 10) {
                var tmp = line.pop();
                lines.push(line.join(" "));
                line = [tmp];
            }
        }
        if(line.length > 0) {
            lines.push(line.join(" "));
        }
        return lines;
        // canvas.context.measureText(msg);

    };
    var NetLog = function(rect, settings) {
        var canvas = Canvas.create(rect);
        var dirty = false;
        var queue = [],
            entry = "",
            scrollIndex = 0,
            messageHandlers = [],
            idleTime = 0,
            dequeue = function() {
                if(queue.length > netlog.bufferSize) {
                    queue.shift();
                }
                dirty = true;
            };
            /** @scope NetLog **/
        var netlog = {
            inputMode: false,
            shadow: true,
            outline: true,
            messageColor: "white",
            errorColor: "red",
            infoColor: "yellow",
            chatColor: "blue",
            bufferSize: 200,
            idleDelay: 2000,
            fadeDuration: 2000,
            /**
             * add message handler
             * @param {function} handler
             **/
            onMessage: function(handler) {
                messageHandlers.push(handler);
            },
            /**
             * remove message handler
             * @param {function} handler (same one as passed to onMessage)
             **/
            removeMessageHandler: function(handler) {
                for(i = 0; i < messageHandlers.length; i++) {
                    if(messageHandlers[i] === handler) {
                        messageHandlers.splice(i, 1);
                        break;
                    }
                }
            },
            /**
             * draw the log output
             **/
            draw: function() {
                var now = (new Date()).getTime(),
                    idleLevel = (now - idleTime - netlog.idleDelay),
                    bgalpha = 1.0;
                if(dirty) {
                    canvas.element.width = canvas.element.width;
                    dirty = false;
                    // canvas.context.save();
                    // if(netlog.inputMode) {
                    //     if(idleLevel > 0 && entry === "") {
                    //         if(idleLevel > netlog.fadeDuration) {
                    //             netlog.inputMode = false;
                    //             idleTime = 0;
                    //             bgalpha = 0;
                    //         } else {
                    //             bgalpha = 1.0 - idleLevel / netlog.fadeDuration;
                    //             if(bgalpha < 0) { bgalpha = 0; }
                    //         }
                    //     }
                    //     canvas.context.globalAlpha = bgalpha;
                    //     canvas.context.fillStyle = netlog.backgroundColor;
                    //     canvas.context.fillRect(rect.left, rect.top, rect.width, rect.height);
                    // }
                    var line = rect.height - 50,
                        alpha = 1.0;
                    canvas.context.textBaseline = "hanging";
                    canvas.context.font = "21px Rationale";
                    canvas.context.strokeStyle = "rgba(0, 0, 0, 1.0)";
                    for(var i = queue.length - 1 - scrollIndex; i >= 0; --i) {
                        switch(queue[i].level) {
                            case "message":
                                canvas.context.fillStyle = netlog.messageColor;
                            break;
                            case "error":
                                canvas.context.fillStyle = netlog.errorColor;
                            break;
                            case "info":
                                canvas.context.fillStyle = netlog.infoColor;
                            break;
                            default:
                                canvas.context.fillStyle = "gray";
                            break;
                        }
                        // if(netlog.inputMode === false || (idleLevel > 0 && idleLevel < netlog.fadeDuration && entry === "")) {
                        // if(entry === "") {
                            var levelCorrector = 0;
                            // if(idleLevel > 0 && netlog.inputMode) {
                            //     levelCorrector = (1.0 - idleLevel / netlog.fadeDuration) * (1.0 - alpha);
                            // }
                        canvas.context.globalAlpha = alpha;// + levelCorrector;
                        // }
                        canvas.context.lineWidth = 2;
                        if(netlog.shadow) {
                            canvas.context.shadowColor = "rgba(0, 0, 0, 0.4)";
                            canvas.context.shadowOffsetX = 0;
                            canvas.context.shadowOffsetY = 0;
                            canvas.context.shadowBlur = 4;
                        }
                        if(netlog.outline) {
                            canvas.context.strokeText(queue[i].message, 10, line);
                        }
                        canvas.context.fillText(queue[i].message, 10, line);
                        line -= 20;
                        alpha -= 0.1;
                        if(line < 0) {
                            break;
                        }
                    }
                    canvas.context.globalAlpha = 1.0;
                    if(netlog.inputMode) {
                        canvas.context.font = "20px Arial";
                        canvas.context.fillStyle = netlog.chatColor;
                        canvas.context.fillText(entry, 10, rect.height - 25);
                    }
                    // canvas.context.restore();

                }
                var topOffset = 0;
                if(queue.length < 10) {
                    topOffset = (9 - queue.length) * 20 - 10;
                }
                Canvas.context.drawImage(canvas.element, rect.left, rect.top - topOffset);
            },
            /**
             * send a message to the logger
             * @param {string} msg message to display
             **/
            message: function(msg) {
                list = chop(msg, rect.width);
                //console.log(list);
                for(var i  = 0; i < list.length; i++) {
                    queue.push({
                        level: "message",
                        message: list[i]
                    });
                }
    //             queue = queue.concat(list);
    //             console.log(queue);
                // // queue.push({ level: "message", message: msg });
                dequeue();
            },
            /**
             * send an error message to the logger
             * @param {string} msg message to display
             **/
            error: function(msg) {
                queue.push({ level: "error", message: msg });
                dequeue();
            },
            /**
             * send an informative message to the logger
             * @param {string} msg message to display
             **/
            info: function(msg) {
                queue.push({ level: "info", message: msg });
                dequeue();
            },
            clear: function() {
                queue = [];
            },
            /**
             * remove last character from input
             **/
            backspace: function() {
                dirty = true;
                entry = entry.substr(0, entry.length - 1);
            },
            /**
             * key input handler
             * @param {number} keyCode
             */
            key: function(keyCode) {
                switch(keyCode) {
                    case 13:
                        scrollIndex = 0;
                        idleTime = (new Date()).getTime();
                        if(!netlog.inputMode) {
                            netlog.inputMode = true;
                        } else {
                            if(entry !== "") {
                                for(var i = 0; i < messageHandlers.length; i++) {
                                    messageHandlers[i](entry);
                                }
                            }
                            entry = "";
                        }
                    break;
                    case 8:
                    break;
                    case 32:
                        entry += " ";
                    break;
                    default:
                        if(netlog.inputMode) {
                            scrollIndex = 0;
                            entry += String.fromCharCode(keyCode);
                        }
                    break;
                }
            }
        };
        if(!settings || !settings.disableInput) {
            document.addEventListener("keypress", function(e) {
                //because the keyup event doesn't populate e.keyCode with a proper char code
                netlog.key(e.charCode || e.keyCode);
                dirty = true;
            });

            document.addEventListener("keydown", function(e) {
                //because chrome will navigate 'back' on backspace. do not want.
                if(e.keyCode === 8) {
                    e.preventDefault();
                    return false;
                }
                //because firefox will kill the websocket connection on escape. do not want.
                if(e.keyCode === 27) {
                    e.preventDefault();
                    return false;
                }
                //because all browsers "scroll down" on space
                if(e.keyCode === 32) {
                    //e.preventDefault();
                    return true;
                }
            });
            document.addEventListener("keyup", function(e) {
                //because keypress doesn't trigger for special keys
                if(netlog.inputMode) {
                    dirty = true;
                    idleTime = (new Date()).getTime();
                    if(e.keyCode === 27) {
                        netlog.inputMode = false;
                    }
                    if(e.keyCode === 8) {
                        netlog.backspace();
                    }
                    /*if(e.keyCode === 32) {
                        entry += " ";
                        alert("space2");
                    }*/
                    if(e.keyCode === 33) {
                        //pgUp
                        scrollIndex += 4;
                        if(scrollIndex >= queue.length) {
                            scrollIndex = queue.length - 1;
                        }
                    }
                    if(e.keyCode === 34) {
                        //pgDwn
                        scrollIndex -= 4;
                        if(scrollIndex < 0) {
                            scrollIndex = 0;
                        }
                    }
                }
            });

        }

        if(settings) {
            for(var setting in settings) {
                if(settings.hasOwnProperty(setting)) {
                    netlog[setting] = settings[setting];
                }
            }
        }
        return netlog;
    };
    module.exports = NetLog;
 }());
