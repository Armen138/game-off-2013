var Unit = require("./unit");

var Item = function(x, y, id, map) {
    item = new Unit(x, y, id, map);
    item.absorb({
        action: function() {
            item.fire("pick-up", item);
            item.dead = true;
        },
        name: "books",
        description: "Some old journals, they look like they might come apart at any moment",
        icon: function() {
            return def.image;
        },
        use: function() {
           console.log("click-activated item?");
        }
    });

    var def = {
        image: "books",
        size: 48,
        target: false,
        rotation: 0,
        position: {X: 24, Y: 25}
    };

    item.setDefinition(def);
    return item;
};

module.exports = Item;
