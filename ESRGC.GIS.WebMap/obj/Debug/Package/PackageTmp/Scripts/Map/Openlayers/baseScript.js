/*
Author: Tu hoang
ESRGC
Provides base (prototype) functions for mapviewer 
OpenLayers API

available events registered by calling 'on' function (derived from component) on the current object.
onInfoToolClick: info tool click event handler
onBaseLayerSwitched: base layer switch event handler
*/

//base prototype for map viewer
ESRGC.BaseViewer = ESRGC.Class({
    //constructor
    initialize: function () {
        ESRGC.Component.prototype.initialize.apply(this, arguments);
    },
    //utility function to update status message
    updateStatusMsg: ESRGC.updateStatusMessage,
    toolVectorLayers: [],

    //this function registers a vector layer with selectFeature control
    //valid option:
    //{layers}: a vector layer or array of vector layers
    setVectorLayers: function (layers) {
        if (typeof this.selectControl == "undefined") {
            //create select control for feature select (used to pass in tool object)
            this.selectControl = new OpenLayers.Control.SelectFeature(layers,
             {
                 clickout: false, toggle: true,
                 multiple: false, hover: false,
                 toggleKey: "ctrlKey", // ctrl key removes from selection
                 multipleKey: "shiftKey" // shift key adds to selection
             });
            this.map.addControl(this.selectControl);
            this.selectControl.activate(); //activate select control
        }
        else {
            this.toolVectorLayers = layers;
            this.selectControl.setLayer(layers); //reset layers
        }

    },
    //map functions
    getCurrentExtent: function () {
        var bounds = this.map.getExtent();
        //convert bound object to extent object (left, top, right, bottom)
        return { xmin: bounds.left, ymin: bounds.bottom, xmax: bounds.right, ymax: bounds.top };
    },
    //set restricted extent
    setRestrictedExtent: function (extent) {
        this.map.restrictedExtent = new OpenLayers.Bounds(extent.xmin, extent.ymin, extent.xmax, extent.ymax);
    },
    setMaxExtent: function (extent) {
        this.map.maxExtent = new OpenLayers.Bounds(extent.xmin, extent.ymin, extent.xmax, extent.ymax);
    },
    setMinResolution: function (resolution) {
        this.map.minResolution = resolution;
    },
    setMaxResolution: function (resolution) {
        this.map.maxResolution = resolution;
    },
    zoomToExtent: function (extent) {
        if (typeof extent == 'undefined' || extent == null)
            return;
        this.map.zoomToExtent(new OpenLayers.Bounds(extent.xmin, extent.ymin, extent.xmax, extent.ymax), false);
    },
    zoomToFullExtent: function () {
        this.map.zoomToMaxExtent();
        //this.zoomToExtent(this.this.layerInfo.fullExtent);
    },
    zoomToPoint: function (x, y) {
        this.map.zoomToExtent(new OpenLayers.Bounds(x, y - 1, x + 1, y));
    },
    zoomIn: function () {
        this.map.zoomIn();
    },
    zoomOut: function () {
        this.map.zoomOut();
    },
    zoomToDataExtent: function (layer) {
        var extent = layer.getDataExtent();
        if (extent != null) {
            this.map.zoomToExtent(extent); //using api function since extent is a Bound object
        }
    },
    panTo: function (x, y) {
        this.map.panTo(new OpenLayers.LonLat(x, y));
    },
    addLayerToMap: function (layer) {
        this.map.addLayers([layer]);
    },
    addLayers: function (layers) {
        this.map.addLayers(layer);
    },
    addJsonDataToVectorLayer: function (layer, data) {
        var features = []; //create new array of features
        //process graphic
        for (var i in data) {
            var dataEntry = data[i];
            //parse the wkt
            var wkt = dataEntry.Wkt;
            if (typeof wkt == 'undefined')
                continue;

            var geometry = OpenLayers.Geometry.fromWKT(wkt);
            //delete dataEntry.wkt;
            //create feature
            features.push(new OpenLayers.Feature.Vector(geometry, dataEntry));
            //remove current graphics and add new features           
        }
        layer.removeAllFeatures();
        layer.addFeatures(features);
    },
    getWktFromVectorLayer: function (layer) {

    },
    clearLayerFeatures: function (layer) {
        if (typeof layer != "undefined")
            layer.removeAllFeatures();
    },
    removeLayerFromMap: function (layer) {
        this.map.removeLayer(layer, false);
    },
    getLayerByName: function (name) {
        for (var i in this.map.layers) {
            if (this.map.layers[i].name == name)
                return this.map.layers[i];
        }
    },
    switchWMSLayer: function (layers, layerName) {
        try {
            if (this.map == null)
                return;
            var wmsLayer = null;
            var temp = this.getLayerByName(layerName);
            if (temp instanceof OpenLayers.Layer.WMS)
                wmsLayer = temp;
            //switch layers
            wmsLayer.params.LAYERS = layers;
            wmsLayer.redraw();
        } catch (e) {
            log(e);
        }
    },
    //create a new wms layer with provided config and add to map object
    //sample options
    /*    {
    isBaseLayer: config.isBaseLayer,
    singleTile: true,
    visibility: config.visibility,
    opacity: config.opacity,
    displayInLayerSwitcher: config.showInSwitcher,
    animationEnabled: config.animated
    }
    */
    createWMSLayer: function (config) {
        if (typeof config.options == 'undefined')
            config.options = {
                isBaseLayer: false,
                singleTile: true,
                visibility: true,
                opacity: 1,
                displayInLayerSwitcher: false,
                animationEnabled: true
            };
        var l = new OpenLayers.Layer.WMS(config.name, config.url,
            {
                layers: config.layers,
                format: "image/png",
                version: "1.3.0",
                transparent: true
            },
            config.options
        );
        if (typeof config.component != 'undefined')
            l.params.COMPONENT = config.component;
        l.events.on({
            "loadstart": ESRGC.AjaxLoader.onLoadStart,
            "loadend": ESRGC.AjaxLoader.onLoadEnd
        });
        this.map.addLayer(l);
        return l;
    },
    changeWmsLayerConfig: function (layer, config) {
        for (var i in config) {
            switch (i) {
                case 'url':
                    layer.setUrl(config[i]);
                    break;
                case 'layers':
                    layer.params.LAYERS = config[i];
                    break;
                case 'component':
                    layer.params.COMPONENT = config[i];
                    break;
                case 'name':
                    layer.name = config[i];
            }
        }
        layer.redraw();
    },
    //set layer visibility on/off 
    //{layer}: layer to set
    //{visibility}: boolean value
    setLayerVisibility: function (layer, visibility) {
        if (typeof layer !== "undefined")
            layer.setVisibility(visibility);
    },
    refresh: function () {
        if (this.map != null) {
            this.map.render("map");
        }
    },
    //get xy from pixel (OL pixel
    getXYFromPixel: function (pixel) {
        return this.map.getLonLatFromPixel(pixel);
    },
    /*
    Create service vector layer with provided options
    Valid options:
    {name}: vector layer name
    {style}: style used with style map (could include ruleSet when passing in new style) -- default is used if not available
    {styleSelect}: style used when selecting vector graphic -- default is used if not available
    {strategies}: optional strategies such as ClusterStrategy -- default is none
    {featureSelect}: event handler for feature selecting -- default is used if not available
    {featureUnselect}: event handler for feature unselecting -- default is used if not available
    */
    createDefaultVectorLayer: function (options) {
        //default rules for vector features
        var ruleSet = [
                new OpenLayers.Rule({
                    filter: new OpenLayers.Filter.Comparison({
                        type: "==",
                        property: "cls",
                        value: "one"
                    }),
                    symbolizer: {
                        externalGraphic: "../img/marker-blue.png"
                    }
                }),
                new OpenLayers.Rule({
                    filter: new OpenLayers.Filter.Comparison({
                        type: "==",
                        property: "cls",
                        value: "two"
                    }),
                    symbolizer: {
                        externalGraphic: "../img/marker-green.png"
                    }
                }),
                new OpenLayers.Rule({
                    elseFilter: true
                })
            ];
        //define default styles for style map
        var styleOption = options.style || {
            pointRadius: 10,
            strokeWidth: 6,
            strokeOpacity: 0.7,
            strokeColor: "lime",
            fillColor: "Transparent",
            fillOpacity: 0
        };
        var style = new OpenLayers.Style(styleOption,
            {
                rules: options.ruleSet || ruleSet//using default rules unless different style is passed in with different rule set
            }
        );
        var styleSelect = options.styleSelect || new OpenLayers.Style({
            strokeColor: "Red",
            fillColor: "Transparent",
            fillOpacity: 0
        });

        var strategies = options.strategy ? [options.strategy] : null;

        //create vector layer for the tool
        var vectorLayer = new OpenLayers.Layer.Vector(options.name, {
            strategies: strategies,
            styleMap: new OpenLayers.StyleMap({
                "default": style,
                "select": styleSelect
            }),
            displayInLayerSwitcher: false, //doesn't show in layer switcher
            visibility: false
        });

        //add vector layer to the map
        this.map.addLayer(vectorLayer);

        //feature select variables (closure scope)
        var serviceBase = options.scope;

        /*Feature select events -- generate pop ups*/
        var onFeatureSelect = options.featureSelect || function (event) {
            selectedFeature = event.feature;
            var content = serviceBase.generateHTMLContent(selectedFeature);
            popup = new OpenLayers.Popup.FramedCloud("popup_" + serviceBase.name,
                                     selectedFeature.geometry.getBounds().getCenterLonLat(),
                                     null,
                                     content,
                                     null, true,
            //on popup close event
                                     function (evt) {
                                         var select = serviceBase.mapViewer.selectControl;
                                         if (select != null)
                                             select.unselect(selectedFeature);

                                     });
            selectedFeature.popup = popup;
            this.map.addPopup(popup);
        };
        var onFeatureUnselect = options.featureUnselect || function (event) {
            var feature = event.feature;
            this.map.removePopup(feature.popup);
            feature.popup.destroy();
            feature.popup = null;
        }

        //register event handlers to the layer
        vectorLayer.events.on({
            "featureselected": onFeatureSelect,
            "featureunselected": onFeatureUnselect
        });
        return vectorLayer;
    },
    //renderer for measure tools
    renderers: (OpenLayers.Util.getParameters(window.location.href).renderer) ?
                                                [OpenLayers.Util.getParameters(window.location.href).renderer] :
                                                OpenLayers.Layer.Vector.prototype.renderers,
    createMarkerLayer: function (name, option) {
        var markers = new OpenLayers.Layer.Markers(name, option);
        this.map.addLayer(markers);
        return markers;
    },
    addMarkerAtPoint: function (point, markerLayer, imgPath) {
        if (typeof markerLayer == 'undefined') {
            log('basescript.addMarkerAtPoint(): "markerLayer is undefined"');
            return;
        }
        if (typeof point == 'undefined' ||
           typeof point.x == 'undefined' ||
           typeof point.y == 'undefined') {
            log('location is invalid')
            return;
        }
        var size = new OpenLayers.Size(25, 41);
        var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
        var icon = new OpenLayers.Icon(imgPath, size, offset);
        markerLayer.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(point.x, point.y), icon));

    },
    removeAllMarkers: function (markerLayer) {
        //remove all markers
        for (var i in markerLayer.markers) {
            markerLayer.removeMarker(markerLayer.markers[i]);
        }
    },
    //Map controls
    controls: {
        info: new OpenLayers.Control.Click({
            onClick: function (evt) {
                //handler invoke
                var mapViewer = ESRGC.getMapViewer();
                var coords = mapViewer.getXYFromPixel(evt.xy);
                var handler = mapViewer.events.onInfoToolClick;
                if (typeof handler == 'function')
                    handler.call(this, { x: coords.lon, y: coords.lat });
            }
        }),
        layerSwitcher: ESRGC.Map.control.getLayerSwitcher(),
        mousePosition: ESRGC.Map.control.getMousePosition(),
        navigation: ESRGC.Map.control.getNavigation(),
        zoomBox: ESRGC.Map.control.getZoomBox(),
        zoomExtent: ESRGC.Map.control.getZoomExtent(),
        navHistory: ESRGC.Map.control.getNavHistory(),
        lineMeasure: ESRGC.Map.control.getLineMeasure(),
        areaMeasure: ESRGC.Map.control.getAreaMeasure()
    },
    activateControl: function (control) {
        if (typeof this.controls[control] != 'undefined')
            this.controls[control].activate();
    },
    deactivateControl: function (control) {
        if (typeof this.controls[control] != 'undefined')
            this.controls[control].deactivate();
    },
    getControl: function (type) {
        return this.controls[type];
    },
    nextExtent: function () {
        if (typeof this.controls['navHistory'] != 'undefined') {
            this.controls['navHistory'].next.trigger();
        }
    },
    previousExtent: function () {
        if (typeof this.controls['navHistory'] != 'undefined') {
            this.controls['navHistory'].previous.trigger();
        }
    },
    //expand layer switcher
    expandLayerSwitcher: function () {
        var switcher = this.controls['layerSwitcher'];
        if (typeof switcher != 'undefined') {
            switcher.showControls(false);
            switcher.maximizeControl();
        }
    }
}, ESRGC.Component);


