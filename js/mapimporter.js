var MapImporter = function() {
    var mapImporter = {
        import: function(data) {
            console.log(data);
            var map = { layers: [] };
            for(var i = 0; i < data.layers.length; i++) {
                var mapData = [];
                var layer = data.layers[i];
                var width = layer.width;
                var height = layer.height;
                for(var x = 0; x < width; x++) {
                    for(var y = 0; y < height; y++) {
                        if(!mapData[x]) {
                            mapData[x] = [];
                        }
                        mapData[x][y] = layer.data.shift();
                    }
                }
                map.layers[i] = mapData;
            }
            return map;
        }
    };
    return mapImporter;
};

module.exports = MapImporter;

