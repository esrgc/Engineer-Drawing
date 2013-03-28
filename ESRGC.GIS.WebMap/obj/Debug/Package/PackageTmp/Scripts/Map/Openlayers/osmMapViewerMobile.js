/*
Tu Hoang - ESRGC
Mobile version
OpenStreetMap viewer
*/

ESRGC.OsmMobileMapViewer = new ESRGC.Class({
    initialize: function (options) {
        ESRGC.BaseViewer.prototype.initialize.apply(this, arguments);

        this.mapLayers = []; //array of layers
        var baseLayer = null;

       //loop through config object again to search for layers
        for (var i in this.layerConfigs) {
            var config = this.layerConfigs[i];
            var l = null;
            switch (config.type) {
                case "mapnik":
                    l = new OpenLayers.Layer.OSM("OpenStreetMap", null, {
                        isBaseLayer: config.isBaseLayer,
                        visibility: config.visibility,
                        displayInLayerSwitcher: config.showInSwitcher,
                        animationEnabled: config.animated,
                        transitionEffect: "resize",
                        sphericalMercator: true,
                        maxExtent: new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34)
                        
                    });
                    break;
                case "wms":
                    l = new OpenLayers.Layer.WMS(config.name, config.url,
                            {
                                layers: config.layers,
                                format: "image/png",
                                version: "1.3.0",
                                transparent: true,
                            },
                            {
                                isBaseLayer: config.isBaseLayer,
                                singleTile: true,
                                visibility: config.visibility,
                                opacity: config.opacity,
                                displayInLayerSwitcher: config.showInSwitcher,
                                animationEnabled: config.animated,
//                                projection: new OpenLayers.Projection("EPSG:4326"),
//                                reproject: true
                                //maxResolution: 156543.0339 //lvl 0 for gmaps
                                //destinationSRS: 'EPSG:4326' //this is needed by the modified wms class so can be replaced
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
                {
                    baseLayer = l; //remember base layer to initialize the map object
                    //baseLayer.projection = aliasproj;
                }
                
                
            }
        }


        this.map = new OpenLayers.Map('map', {
            projection: new OpenLayers.Projection("EPSG:900913"),
            displayProjection: new OpenLayers.Projection("EPSG:4326"),
            units: "m",
            maxResolution: 156543.0339,
            maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34,
                20037508.34, 20037508.34),
            controls: [
                new OpenLayers.Control.Attribution(),
                new OpenLayers.Control.TouchNavigation({
                    dragPanOptions: {
                        enableKinetic: true
                    }
                })
            ],

            eventListeners: {
                //"changelayer": mapLayerChanged,
                //"zoomend": function () { log(this.map.getExtent()); },
                //"moveend": function () { log(this.map.getExtent()); },
                scope: this//obj context to call the callback
            }
        });

        //add layers to map object
        this.map.addLayers(this.mapLayers);

        //zoom to initial extent provided by this
        if (this.initialExtent != null)
            this.zoomToExtent(this.initialExtent);
        else
            this.map.zoomToMaxExtent();
    }
}, ESRGC.BaseViewer);
