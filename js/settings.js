var Canvas = require("1gamlib/canvas").Canvas;
module.exports = function() {
    return {
        width: 128,
        height: 64,
        viewPort: {
            width: Canvas.width,
            height: Canvas.height
        },
        //hud: {width: 0},
        //minimap: {width: 128, height: 128}
    };
};

