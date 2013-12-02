/*jshint -W079 */

var Canvas = require("1gamlib/canvas").Canvas;
var Resources = require("1gamlib/resources").Resources;
var Events = require("1gamlib/events").Events;
var Settings = require("./settings");
var Importer = require("./mapimporter");
var mouseTile = { X: 0, Y: 0 };
var tileMap = {
    "0": "tile",
    "41": "rock",
    "42": "rock",
    "43": "rock",
    "21": "rock",
    "22": "rock",
    "undefined": "rock"
};
var importer = new Importer();

console.log(importer instanceof Importer);
var layers = {
    units: [],
    stuff: []
};

var getMapData = function(file, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", file, true);
    xhr.onload = function() {
        var mapData = importer.import(
                JSON.parse(xhr.responseText)
                );
        callback(mapData);
    };
    xhr.send(null);
};

/** @class Map */
var Map = function() {
    var tiles = null;
    //init layers
    for(var i = 0; i < 100; i++) {
        for(var l in layers) {
            layers[l][i] = [];
        }
    }

    var drawMouse = function() {
        var tile = "mouse"; //Math.random() < 0.5 ? "box" : "pebbles";

        var p = tileToScreen(map.mouse.X, map.mouse.Y);
        var correction = Resources[tile].height - (settings.width / 2);
        Canvas.context.save();
        Canvas.context.translate(p.X, p.Y);
        Canvas.context.drawImage(Resources[tile],
                -(settings.width / 2), -(settings.height / 2) - correction);
        Canvas.context.restore();
    };
    var tileToScreen = function(x, y) {
        return {
            X: (x * (settings.width / 2)) + (y * (settings.width / 2)),
            Y: (x * -(settings.height / 2)) + (y * (settings.height / 2))
        };
    };

    var screenToTile = function(x, y) {
        x += 64;
        //y += 16;
        x += map.position.X;
        y += map.position.Y;
        return {
            X : (x / (settings.width)) - (y / (settings.height)) | 0,
            Y : (x / (settings.width)) + (y / (settings.height)) | 0
        };
    };
    var pixelToTile = function(x, y) {
        return {
            X : (x / (settings.width)) - (y / (settings.height)) | 0,
            Y : (x / (settings.width)) + (y / (settings.height)) | 0
        };
    };
    var settings = Settings();
    var drag = {
        start: {X: 0, Y: 0},
        mapStart: {X: 0, Y: 0},
        previous: {X: 0, Y:0},
        active: false
    };
    var select = {
        start: {X: 0, Y: 0}
    };

    var getArea = function(start, end) {
        /*
         * A couple of vector-utility functions.
         * Will move to a vector utility module
         */
        function copy(obj) {
            var result = {};
            for(var prop in obj) {
                result[prop] = obj[prop];
            }
            return result;
        }
        function swap(prop, first, second) {
            var temp = first[prop];
            first[prop] = second[prop];
            second[prop] = temp;
        }
        /*
         * Must work with copies, modifying the originals does
         * strange things.
         * We need all 4 corners of the diamond in tile-space
         * for this to work.
         */
        var startTile = copy(start);
        var endTile = copy(end);
        var topLeft = tileToScreen(startTile.X, startTile.Y);
        var bottomRight = tileToScreen(endTile.X, endTile.Y);
        /*
         * check which corner is what in screen-space
         * we can't just swap corners in tile-space, because
         * our selection box is a diamond. We need to convert it
         * back if any swapping is performed (dirty, dirty swaps)
         */
        var dirtySwap = false;
        if(topLeft.X > bottomRight.X) {
            swap('X', topLeft, bottomRight);
            dirtySwap = true;
        }
        if(topLeft.Y > bottomRight.Y) {
            swap('Y', topLeft, bottomRight);
            dirtySwap = true;
        }
        if(dirtySwap) {
            startTile = pixelToTile(topLeft.X, topLeft.Y);
            endTile = pixelToTile(bottomRight.X, bottomRight.Y);
        }
        var bottomLeftTile = pixelToTile(topLeft.X, bottomRight.Y);
        var topRightTile = pixelToTile(bottomRight.X, topLeft.Y);
        var tilesToDraw = [];
        /*
         * x and y are coordinates in tile-space. The tiles are collected diagonally,
         * in a diamond-shape(the 'true' shape of the selection box).
         * going through diagonals this way skips a row, we need to compensate for that,
         * hence the 'oddEven' loop.
         * When the bottom-right tile lands on an uneven tile, an extra row/column of
         * tiles is selected. We'll need to compensate for that.
         */
        var correction = 0;
        for(var y = 0; y <= bottomLeftTile.Y - startTile.Y; y++) {
            for(var oddEven = 0; oddEven < 2; oddEven++) {
                for(var x = 0; x <= topRightTile.X - startTile.X - correction; x++) {
                    tilesToDraw.push({
                        X: (startTile.X - y) + x,
                        Y: (startTile.Y + y + oddEven) + x
                    });
                }
            }
        }
        return tilesToDraw;
    };

    var areaDebug = function(start, end) {
        var tilesToDraw = getArea(start, end);
        for(i = 0; i < tilesToDraw.length; i++) {
            Canvas.context.save();
            var tile = tileToScreen(tilesToDraw[i].X, tilesToDraw[i].Y);
            Canvas.context.translate(tile.X, tile.Y);
            Canvas.context.drawImage(Resources.mouse, -32, -16);
            Canvas.context.restore();
        }
    };
    /** @alias Map */
    var map = {
        mouse: {},
        scrollSpeed: {X: 0, Y: 0},
        scale: { X: 1, Y: 1 },
        position: {
            X: 0,
            Y: -500
        },
        load: function(name) {
            getMapData("maps/" + name + ".json", function(data) {
                console.log(data);
                tiles = data;
            });
        },
        layers: function() {
            return layers;
        },
        unitFromMap: function(x, y) {
            if(layers.units[x] && layers.units[x][y]) {
                return layers.units[x][y];
            }
            return null;
        },
        unitToMap: function(unit, x, y) {
            //if(layers.units[x][y] && layers.units[x][y] !== unit) {
                //console.log(layers.units[x][y]);
                //console.log("not mapping unit.");
                //return false;
            //} else {
                console.log("mapping unit.");
                if(unit.lastMapPosition) {
                    delete  layers.units[unit.lastMapPosition.X]
                                        [unit.lastMapPosition.Y]
                                        [unit.id]; // = null;
                }
                if(!layers.units[x][y]) {
                    layers.units[x][y] = {};
                }
                layers.units[x][y][unit.id] = unit;
                unit.lastMapPosition = {X: x, Y: y};
            //}
            return true;
        },
        /**  draw */
        draw: function() {
            Canvas.clear("#373d3a");
            Canvas.context.save();
            Canvas.context.translate(-map.position.X, -map.position.Y);
            var x = 0,
                y = 0;
            for(var l = 0; l < tiles.layers.length; l++) {
                for(y = 0; y < tiles.layers[l].length; y++) {
                    for(x = tiles.layers[l][0].length - 1; x >= 0; --x) {
                        var tile = tileMap[tiles.layers[l][x][y]];
                        if(tile !== undefined) {
                            var p = tileToScreen(x, y);
                            var correction = Resources[tile].height - settings.height;
                            Canvas.context.save();
                            Canvas.context.translate(p.X, p.Y);
                            Canvas.context.drawImage(Resources[tile],
                                    -(settings.width / 2),
                                    -(settings.height / 2) - correction);
                            Canvas.context.restore();
                        } else {
                            //console.log("no such tile: " + tiles.layers[l][x][y]);
                        }
                    }
                }
            }
            x = 0;
            y = 0;
            for(y = 0; y < tiles.length; y++) {
                for(x = tiles[0].length - 1; x >= 0; --x) {
                    for(var u in layers.units[x][y]) {
                        if(layers.units[x][y][u].draw(tileToScreen)) {
                            delete layers.units[x][y][u];
                        }
                    }
                }
            }
            drawMouse();
            Canvas.context.restore();
            map.fire("draw");
        },
        /** move event receiver
         * @param {object} position X, Y
         * */
        mousemove: function(position) {
            map.mouse = screenToTile(position.X, position.Y);
            if(drag.active) {
                var diff = {
                    X: drag.start.X - position.X,
                    Y: drag.start.Y - position.Y
                };
                map.scrollSpeed.X = drag.previous.X - position.X;
                map.scrollSpeed.Y = drag.previous.Y - position.Y;

                map.position.X = drag.mapStart.X + diff.X;
                map.position.Y = drag.mapStart.Y + diff.Y;
                drag.previous.X = position.X;
                drag.previous.Y = position.Y;
            }
        },
        /** mouse event receiver */
        mousedown: function(position, button) {
            map.mouse.left = true;
            map.mouse = screenToTile(position.X, position.Y);
            if(button === 2) {
                drag.mapStart = {X: map.position.X, Y: map.position.Y};
                drag.start = position;
                drag.previous.X = position.X;
                drag.previous.Y = position.Y;
                drag.active = true;
            } else {
                select.start = {X: map.mouse.X, Y: map.mouse.Y};
                select.active = true;
            }
        },
        /** mouse event receiver */
        mouseup: function(position, button) {
            map.mouse = screenToTile(position.X, position.Y);
            if(select.active) {
                //var area = getArea(select.start, map.mouse);
                map.fire("select", select.start);
            }
            drag.active = false;
            select.active = false;
            map.mouse.left = false;
        },
        /** center on position
         * @public
         * @name centerOn
         * @method centerOn
         * @memberOf Map
         * @param {vector2} to position to center on
         */
        centerOn: function(to) {
            //center on coords
            var at = tileToScreen(to.X, to.Y);
            map.position.X = at.X - settings.viewPort.width / 2;
            map.position.Y = at.Y - settings.viewPort.height / 2;
            console.log(at);
        }
    };
    window.map = map;
    Events.attach(map);
    return map;
};
//getMapData("maps/test2.json", function(data) {
    //console.log(data);

//});
module.exports = Map;

