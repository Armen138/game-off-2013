var Unit = require("./unit");
var Canvas = require("1gamlib/canvas").Canvas;

var NPC = function(x, y, id, map) {
    npc = new Unit(x, y, id, map);
    npc.absorb({
        action: function() {
            if(npc.missions.length > 0) {
                if(npc.missions[0].accepted) {
                    npc.fire("dialog", {
                        title: npc.missions[0].title,
                        text: npc.missions[0].progress
                    });
                } else {
                    npc.fire("dialog", {
                        title: npc.missions[0].title,
                        text: npc.missions[0].dialog,
                        accept: "Quest accepted: " + npc.missions[0].title,
                    });
                    npc.missions[0].accepted = true;
                }
            }
        },
        /*
         * Missions offered by this NPC, in this order
         */
        missions: [
            {
                title: "Missing books",
                dialog: "Have you seen my log books? I can't find them anywhere!",
                progress: "Have you found my log books yet?",
                accepted: false,
                accepts: "books",
                complete: "Thanks, I can't believe they were just laying around like that!",
                xp: 10,
                reward: "key"
            }
        ],
        name: "John",
        /*
         * I'm not even sure where to fit the npc description in the UI
         */
        description: "He smells funny, but he means well."
    });

    var def = {
        image: "player",
        size: 128,
        target: false,
        rotation: 0,
        position: {X: 37, Y: 128}
    };
    npc.setDefinition(def);
    npc.on("draw", function(position) {
        Canvas.context.fillStyle = "yellow";
        Canvas.context.strokeStyle = "orange";
        Canvas.context.textAlign = "center";
        Canvas.context.font = "18px Rationale";
        Canvas.context.fillText(npc.name, position.X, position.Y - 134);
        if(npc.missions.length > 0) {
            Canvas.context.font = "66px Rationale";
            var text = npc.missions[0].accepted ? "!" : "?";
            Canvas.context.fillText(text, position.X, position.Y - 154);
            Canvas.context.strokeText(text, position.X, position.Y - 154);
        }
    });
    return npc;
};

module.exports = NPC;
