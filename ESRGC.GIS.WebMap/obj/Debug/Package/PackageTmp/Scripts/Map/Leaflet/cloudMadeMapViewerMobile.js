/*
Tu Hoang - ESRGC
Mobile browser version
cloudmade viewer
API key: c0925b1494384159af7cd710aadbda8d
*/

ESRGC.CloudMadeMobileMapViewer = ESRGC.Class({
    initialize: function (options) {
        extend2(this, options); //copy options to this object
        this.mapLayers = []; //array of layers

        //loop through config object again to search for layers
        for (var i in this.layerConfigs) {
            var config = this.layerConfigs[i];
            var l = null;
            switch (config.type) {
                case "cloudmade":
                    // create a CloudMade tile layer
                    var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/c0925b1494384159af7cd710aadbda8d/997/256/{z}/{x}/{y}.png';
                    var cloudmade = new L.TileLayer(cloudmadeUrl, { maxZoom: 18 });
                    l = cloudmade;
                    break;
                case "wms":
                    l = new L.TileLayer.WMS(config.url,
                        {
                            layers: config.layers,
                            format: "image/png",
                            version: "1.3.0",
                            transparent: true
                        });

                    break;
            }
            if (l != null) {
                this.mapLayers.push(l); //push to the array
                if (config.isPrimary) {
                    baseLayer = l; //remember base layer to initialize the map object
                }


            }
        }

        // initialize the map on the "map" div with a given center and zoom 
        this.map = new L.Map('map', //{ zoomControl: false, center: new L.LatLng(0,0), zoom: 1 }
                {
                    center: new L.LatLng(options.center.y, options.center.x),
                    zoom: options.center.level,
                    zoomControl: false
                }
        );
        var scope = this;
        this.map.on("zoomend", function () {
            //log(scope.map.getBoundsZoom());
            log("zoom:  " + scope.map.getZoom());
        });

        // add the CloudMade layer to the map
        this.addLayers(this.mapLayers);

        this.zoomToExtent(this.initialExtent);
    },
    addLayers: function (layers) {
        if (typeof layers != "undefined") {
            for (var i in layers) {
                var l = layers[i];
                log(typeof l);
                if (typeof l != "function")
                    this.map.addLayer(layers[i]);
            }
        }
    }

}, ESRGC.BaseViewer);