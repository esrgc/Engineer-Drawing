/*
Author: Tu hoang
ESRGC
OpenLayers API
The main script that controls the map.
All the map functions are be implemented here
*/

//MapViewer that inherits BaseViewer's prototype
ESRGC.iMapViewer = ESRGC.Class({
    isReady: false, //initially not ready (value changed to true when initMap callback finishes)
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
                    getLayerConfigs(layerObj.url, function (layerInfo) {
                        scope.initMap(layerInfo);
                    });
                    break; //only need the primary layer
                }
            }
        }
        else {
            log("No layer configuration found. Map Initialization failed");
            return;
        }

        //call back that actually creates the map object
        this.initMap = function (layerInfo) {

            if (layerInfo == null) {
                log("layerInfo couldn't be parsed.");
            }

            this.mapLayers = []; //array of layers
            var baseLayer = null;

            //Max extent from layerInfo above            
            var layerMaxExtent = new OpenLayers.Bounds(
                layerInfo.fullExtent.xmin,
                layerInfo.fullExtent.ymin,
                layerInfo.fullExtent.xmax,
                layerInfo.fullExtent.ymax
            );
            var resolutions = [];
            for (var i = 0; i < layerInfo.tileInfo.lods.length; i++) {
                resolutions.push(layerInfo.tileInfo.lods[i].resolution);
            }

            //loop through config object again to search for layers
            for (var i in this.layerConfigs) {
                var config = this.layerConfigs[i];
                var l = null;
                switch (config.type) {
                    case "arcTileMap":
                        l = new OpenLayers.Layer.ArcGISCache(config.name, config.url, {
                            isBaseLayer: config.isBaseLayer,
                            visibility: config.visibility,
                            attribution: "Provided by " + (config.layerName ? config.layerName : layerInfo.mapName),
                            displayInLayerSwitcher: config.showInSwitcher,
                            animationEnabled: config.animated,
                            //layer configuration
                            layerInfo: layerInfo
                        });

                        if (config.isPrimary)
                            baseLayer = l; //remember base layer to initialize the map object
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
                        if (typeof config.component != 'undefined')
                            l.params.COMPONENT = config.component;
                        break;
                }
                if (l != null) {
                    l.events.on({
                        "loadstart": ESRGC.AjaxLoader.onLoadStart,
                        "loadend": ESRGC.AjaxLoader.onLoadEnd
                    });
                    this.mapLayers.push(l); //push to the array
                }
            }
            //handle wms layer switching and turn off hybrid layer when street map layer is selected
            var switchLayerHandler = function (event) {
                var hybridLayer = this.getLayerByName("Hybrid");

                if (event.layer.name == "Street Map") {
                    if (hybridLayer != null && hybridLayer.visibility == true)
                        hybridLayer.setVisibility(false);

                }

                if (typeof this.events.onBaseLayerSwitched == 'function') {
                    this.events.onBaseLayerSwitched(event);
                }

                if (typeof this.events.onBaseLayerSwitched == 'function') {
                    this.events.onBaseLayerSwitched(event);
                }
            };

            //initialize map object
            this.map = new OpenLayers.Map('map', {
                maxExtent: baseLayer.maxExtent,
                units: baseLayer.units,
                resolutions: resolutions,
                numZoomLevels: baseLayer.numZoomLevels,
                tileSize: baseLayer.tileSize,
                displayProjection: baseLayer.displayProjection,

                eventListeners: {
                    //"changelayer": mapLayerChanged,
                    "changebaselayer": switchLayerHandler,
                    "moveend": function () {
                        //log(this.map.getExtent());
                    },
                    //"zoomend": function () { log("zoomend event"); log(this.map.getExtent()); },
                    scope: this//obj context to call the callback
                }
            });

            //add layers to map object
            this.map.addLayers(this.mapLayers);

            //add controls specified in prototype
            if (typeof this.controls != 'undefined') {
                for (var i in this.controls) {
                    this.map.addControl(this.controls[i]);
                }
            }

            //set restrict extent
            this.setRestrictedExtent(this.restrictedExtent);

            //zoom to initial extent provided by this
            if (this.initialExtent != null)
                this.zoomToExtent(this.initialExtent);
            else
                this.map.zoomToMaxExtent();

            //this.setMinResolution(this.minResolution);
            //this.setMaxResolution(this.maxResolution);

            //create drawfeature controls
            if (typeof ESRGC.Map.CustomDrawFeature != 'undefined') {
                this.drawFeatureControls = new ESRGC.Map.CustomDrawFeature({
                    map: this.map,
                    onInfoFeatureAdded: this.onInfoFeatureAdded
                });
                log('DrawFeatureControls created');
            }
            //if we reach this far then initialization suceeded
            log("Map has been successfully initialized");
            //this.updateStatusMsg("Ready");
            //call back when map is initialized
            if (typeof this.onMapReady == "function")
                this.onMapReady();
            this.isReady = true;
        }


        //setTimeout(function () { log('Waited 2 seconds for the map'); }, 2000);

    }
}, ESRGC.BaseViewer);


