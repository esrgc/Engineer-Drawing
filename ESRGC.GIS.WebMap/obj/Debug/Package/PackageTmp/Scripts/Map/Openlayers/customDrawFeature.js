/*
Author: Tu Hoang
ESRGC 2012
Openlayers

CustomDrawFeature class
provides draw control and extra functionaliies with draw vector layer
*/

ESRGC.Map.CustomDrawFeature = ESRGC.Class({
    isEnabled: false,
    currentActiveControl: 'point',
    initialize: function (options) {
        ESRGC.Component.prototype.initialize.apply(this, arguments);
        //check for map object
        if (typeof this.map == 'undefined') {
            log('map object not found..control might not work properly');
        }
        var map = this.map;
        //create style
        this.drawVectorLayer = new OpenLayers.Layer.Vector('Draw Layer', {
            styleMap: new OpenLayers.StyleMap({
                'default': this.drawingStyle
            }),
            displayInLayerSwitcher: false, //doesn't show in layer switcher
            visibilty: true
        });
        map.addLayer(this.drawVectorLayer);

        //event handler to be called by the controls
        if (typeof this.onInfoFeatureAdded == 'function')
            this.on('onFeatureAdded', this.onInfoFeatureAdded);

        //set z-index
        //log('zindex' + this.drawVectorLayer.getZIndex());
        this.drawVectorLayer.setZIndex(1000); //make sure the drawing is on top
        //log('zindex after: ' + this.drawVectorLayer.getZIndex());

        //create draw features
        this.drawFeatureControls = {
            point: new OpenLayers.Control.DrawFeature(this.drawVectorLayer,
                OpenLayers.Handler.Point),
            line: new OpenLayers.Control.DrawFeature(this.drawVectorLayer,
                        OpenLayers.Handler.Path),
            polygon: new OpenLayers.Control.DrawFeature(this.drawVectorLayer,
                        OpenLayers.Handler.Polygon),
            box: new OpenLayers.Control.DrawFeature(this.drawVectorLayer,
                        OpenLayers.Handler.RegularPolygon, {
                            handlerOptions: {
                                sides: 4,
                                irregular: true
                            }
                        }
                    ),
            buffer: new OpenLayers.Control.DrawFeature(this.drawVectorLayer,
                        OpenLayers.Handler.RegularPolygon, {
                            handlerOptions: {
                                sides: 30,
                                irregular: false
                            }
                        }
                    )
        };
        for (var i in this.drawFeatureControls) {
            //add all controls to map 
            map.addControl(this.drawFeatureControls[i]);
            //wire events handler
            this.drawFeatureControls[i].events.on({
                featureadded: function (event) {
                    log('feature added event.');
                    if (typeof this.events.onFeatureAdded == 'function')
                        this.events.onFeatureAdded.call(this, event);
                },
                scope: this
            });
        }
    },
    setEnabled: function (enabled, clear) {
        this.isEnabled = enabled;
        if (enabled) {
            //enable the previous active control
            this.activateControl(this.currentActiveControl);
        }
        else {
            //find current active control
            for (var i in this.drawFeatureControls) {
                var control = this.drawFeatureControls[i];
                if (control.active)
                    this.currentActiveControl = i;
            }
            //disable all controls
            for (var i in this.drawFeatureControls)
                this.drawFeatureControls[i].deactivate();
            //if true or not specified then clear the graphics
            if (typeof clear == 'undefined' || clear)
                this.clearFeatures();
        }
    },
    clearFeatures: function () {
        this.drawVectorLayer.removeAllFeatures();
    },
    getDrawFeatures: function () {
        return this.drawVectorLayer.features;
    },
    activateControl: function (type) {
        if (type == '' || !this.isEnabled) {
            log('**CustomDrawFeature.activateControl: no control selected or controls are disabled');
            this.currentActiveControl = type; //type changed when disabled
            return;
        }
        this.drawFeatureControls[type].activate();
        this.drawVectorLayer.setZIndex(1000); //prevent z-index reset
        log(type + ' drawFeature control activated');
    },
    deactivateControl: function (type) {
        if (type == '' || !this.isEnabled) {
            log('**CustomDrawFeature.deactivateControl: no control selected or controls are disabled');
            return;
        }
        this.drawFeatureControls[type].deactivate();
        log(type + ' drawFeature control deactivated');
        this.clearFeatures();
    },
    deactivateAllControls: function () {
        if (!this.isEnabled) {
            log('**CustomDrawFeature.deactivateAllControls: controls are disabled');
            return;
        }
        for (var i in this.drawFeatureControls)
            this.drawFeatureControls[i].deactivate();
        this.clearFeatures();
        this.drawVectorLayer.setZIndex(1000); //prevent z-index reset
    },
    associatedLayerRegistered: function () {
        return !(typeof this.associatedLayer == 'undefined');
    },
    registerAssociatedLayer: function (layer) {
        if (typeof this.selectControl == 'undefined') {
            this.associatedLayer = layer;
            this.selectControl = new OpenLayers.Control.SelectFeature(layer,
             {
                 clickout: false, toggle: false,
                 multiple: false, hover: false,
                 toggleKey: "ctrlKey", // ctrl key removes from selection
                 multipleKey: "shiftKey" // shift key adds to selection
             });
        } else {
            this.selectControl.setLayer([layer]);
        }
    },
    selectAssociatedFeatures: function (features) {
        if (this.selectControl != 'undefined') {
            for (var i in features) {
                this.selectControl.highlight(features[i]);
            }
        }
    },
    unselectAssociatedFeatures: function (features) {
        if (this.selectControl != 'undefined') {
            for (var i in features) {
                this.selectControl.unhighlight(features[i]);
            }
        }
    },
    //pop the top of the features stack
    popFeature: function () {
        var drawLayer = this.drawVectorLayer;
        //get top feature
        if (drawLayer.features.length > 0) {
            var features = drawLayer.features[drawLayer.features.length - 1];
            drawLayer.destroyFeatures(features);
        }
    },
    popPreviousFeatures: function () {
        var drawLayer = this.drawVectorLayer;
        //get everything but the last one
        if (drawLayer.features.length > 1) {
            var features = drawLayer.features.slice(0, drawLayer.features.length - 1);
            drawLayer.destroyFeatures(features);
        }
    },
    getFeatureWkt: function (features) {
        if (typeof features == 'undefined') {
            //use all features in the current draw layer if not specified
            features = this.drawVectorLayer.features;
            log('All features (' + features.length + ')');
        }

        var formatter = new OpenLayers.Format.WKT();
        var wkt = formatter.write(features);
        //log(wkt);
        return wkt;
    },
    getFeatureWktArray: function (features) {
        if (typeof features == 'undefined') {
            //use all features in the current draw layer if not specified
            features = this.drawVectorLayer.features;
            log('All features (' + features.length + ')');
        }
        var wkts = [];
        var formatter = new OpenLayers.Format.WKT();
        for (var i in features) {
            wkts.push(formatter.write(features[i]));
        }
        //log(wkt);
        return wkts;
    },
    getVectorLayer: function () {
        return this.drawVectorLayer;
    },
    //style used to render features
    drawingStyle: new OpenLayers.Style(null, {
        rules: [
            new OpenLayers.Rule({
                symbolizer: {
                    "Point": {
                        pointRadius: 4,
                        graphicName: "square",
                        fillColor: "white",
                        fillOpacity: 1,
                        strokeWidth: 1,
                        strokeOpacity: 1,
                        strokeColor: "#ED0C0C"
                    },
                    "Line": {
                        strokeWidth: 3,
                        strokeOpacity: 1,
                        strokeColor: "#ED0C0C",
                        strokeDashstyle: "dash"
                    },
                    "Polygon": {
                        strokeWidth: 2,
                        strokeOpacity: 1,
                        strokeColor: "#ED0C0C",
                        fillColor: "#21DB7E",
                        fillOpacity: 0.3
                    }
                }
            })
        ]
    })
}
, ESRGC.Component);