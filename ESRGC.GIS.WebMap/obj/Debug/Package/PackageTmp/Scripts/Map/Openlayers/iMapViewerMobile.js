/*
Tu Hoang - ESRGC
The main script that controls the map.
All the map functions are be implemented here

*/
//MapViewer that inherits BaseViewer's prototype
ESRGC.iMapMobileMapViewer = ESRGC.Class({
    initialize: function (options) {
        extend2(this, options); //copy all passed-in parameters
        ESRGC.BaseViewer.prototype.initialize.apply(this, arguments);
        this.map = null;
        var scope = this; //closure scope

        //loop through configuration options
        if (this.layerConfigs !== undefined) {
            for (var i in this.layerConfigs) {
                var layerObj = this.layerConfigs[i];
                //if it's a street map then use its config to init the map
                //otherwise just create a layer
                if (typeof layerObj.isPrimary != "undefined" && layerObj.isPrimary == true) {
                    //get layer configuration
                    getLayerConfigs(layerObj.url, function (data) {
                        scope.initMap(data);
                    });
                    break; //only need the primary layer
                }
            }
        }
        else {
            log("No layer configuration found. Map Initialization failed");
            return;
        }
    },

    //call back that actually creates the map object
    initMap: function (data) {

        if (data == null) {
            log("Layer data couldn't be parsed.");
        }

        this.mapLayers = []; //array of layers
        var baseLayer = null;

        //loop through config object again to search for layers
        for (var i in this.layerConfigs) {
            var config = this.layerConfigs[i];
            var l = null;
            switch (config.type) {
                case "arcTileMap":
                    l = new OpenLayers.Layer.ArcGISCache(config.name, config.url, {
                        layerInfo: data,
                        isBaseLayer: config.isBaseLayer,
                        visibility: config.visibility,
                        attribution: "Provided by " + (config.layerName ? config.layerName : data.mapName),
                        displayInLayerSwitcher: config.showInSwitcher,
                        animationEnabled: config.animated
                    });


                    break;
                case "wms":
                    l = new OpenLayers.Layer.WMS(config.name, config.url,
                            {
                                layers: config.layers,
                                format: "image/png",
                                version: "1.3.0",
                                transparent: true
                            },
                            {
                                isBaseLayer: config.isBaseLayer,
                                singleTile: true,
                                visibility: config.visibility,
                                opacity: config.opacity,
                                displayInLayerSwitcher: config.showInSwitcher,
                                animationEnabled: config.animated
                            }
                        );
                    break;
            }
            if (l != null) {
                l.events.on({
                    "loadstart": ESRGC.AjaxLoader.onLoadStart,
                    "loadend": ESRGC.AjaxLoader.onLoadEnd
                });
                this.mapLayers.push(l); //push to the array
                if (config.isPrimary)
                    baseLayer = l; //remember base layer to initialize the map object
            }
        }
        //handle wms layer switching and turn off hybrid layer when street map layer is selected
        var switchLayerHandler = function (event) {
            var hybridLayer = this.getLayerByName("Hybrid");
            var wmsLayer = this.getLayerByName("Parcel Layer");

            if (event.layer.name == "Street Map") {
                if (hybridLayer != null && hybridLayer.visibility == true)
                    hybridLayer.setVisibility(false);
                if (wmsLayer != null)
                    this.switchWMSLayer("Parcels", wmsLayer.name);
            }
            else {
                if (wmsLayer != null)
                    this.switchWMSLayer("ParcelGaz", wmsLayer.name);
            }
        };
        //initialize map object
        this.map = new OpenLayers.Map('map', {
            maxExtent: baseLayer.maxExtent,
            units: baseLayer.units,
            resolutions: baseLayer.resolutions,
            numZoomLevels: baseLayer.numZoomLevels,
            tileSize: { w: 128, h: 128 },
            displayProjection: baseLayer.displayProjection,
            StartBounds: baseLayer.initialExtent,
            controls: [
                    new OpenLayers.Control.Attribution(),
                    new OpenLayers.Control.TouchNavigation({
                        dragPanOptions: {
                            enableKinetic: true
                        }
                    })
            //                    , new OpenLayers.Control.ZoomPanel()
                ]
            //,
            //                eventListeners: {
            //                    //"changelayer": mapLayerChanged,
            //                    "changebaselayer": switchLayerHandler,
            //                    scope: this//obj context to call the callback
            //                }
        });

        //add layers to map object
        this.map.addLayers(this.mapLayers);


        //zoom to initial extent provided by this
        if (this.initialExtent != null)
            this.zoomToExtent(this.initialExtent);
        else
            this.map.zoomToMaxExtent();

        this.setRestrictedExtent(this.restrictedExtent);
//        this.setMinResolution(this.minResolution);
//        this.setMaxResolution(this.maxResolution);

        //if we reach this far then initialization suceeded
        log("Successfully initialized");
        this.updateStatusMsg("Ready");


    }
}, ESRGC.BaseViewer);

