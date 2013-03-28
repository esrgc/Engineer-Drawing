/*
Author: Tu Hoang
ESRGC 2012

Desktop browser

Openlayers API

mapControl.js
implement API map controls to be used in mapViewer

contains basic tools: measure control, zoombox, zoomExtent, 
and navigation control

options: 
none
*/

ESRGC.Map.Control = ESRGC.Class({
    initialize: function () {

    },
    measureRenderer: (OpenLayers.Util.getParameters(window.location.href).renderer) ?
                                [OpenLayers.Util.getParameters(window.location.href).renderer] :
                                OpenLayers.Layer.Vector.prototype.renderers,
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
    }),
    measureHandler: function (event) {
        var geometry = event.geometry;
        var order = event.order;
        var units = event.units + (order == 2 ? order : '');
        var measure = event.measure;

        //convert to feet or square feet
        switch (units) {
            case 'm':
                units = '(ft)';
                measure = measure * 3.280839895;
                break;
            case 'm2':
                units = '(square ft)';
                measure = measure * 10.7639104;
                break;
            case 'km':
                units = '(mi)';
                measure = measure * 0.6214;
                break;
            case 'km2':
                units = '(square mi)';
                measure = measure * 0.3861;
                break;
        }

        var measureTxt = measure.toFixed(3) + ' ' + units;
        log(measureTxt);
        ESRGC.updateStatusMessage(measureTxt);
    },
    getLineMeasure: function () {
        var renderer = this.measureRenderer;
        var style = this.drawingStyle;
        var listeners = {
            measure: this.measureHandler,
            measurepartial: this.measureHandler
        };

        return new OpenLayers.Control.Measure(
                        OpenLayers.Handler.Path, {
                            persist: false,
                            immediate: true,
                            handlerOptions: {
                                layerOptions: {
                                    renderers: renderer,
                                    styleMap: new OpenLayers.StyleMap({
                                        "default": style
                                    })
                                }
                            },
                            eventListeners: listeners
                        }
                    );
    },
    getAreaMeasure: function () {
        var renderer = this.measureRenderer;
        var style = this.drawingStyle;
        var listeners = {
            measure: this.measureHandler,
            measurepartial: this.measureHandler
        };

        return new OpenLayers.Control.Measure(
                        OpenLayers.Handler.Polygon, {
                            persist: false,
                            immediate: true,
                            handlerOptions: {
                                layerOptions: {
                                    renderers: renderer,
                                    styleMap: new OpenLayers.StyleMap({
                                        "default": style
                                    })
                                }
                            },
                            eventListeners: listeners
                        }
                    );
    },
    getZoomBox: function () { return new OpenLayers.Control.ZoomBox({ name: "ZoomBox", title: "Zoom box" }); },
    getZoomExtent: function () { return new OpenLayers.Control.ZoomToMaxExtent({ title: "Zoom to the max extent", name: "Max Extent" }); },
    getNavHistory: function () { return new OpenLayers.Control.NavigationHistory(); },
    getLayerSwitcher: function () { return new OpenLayers.Control.LayerSwitcher(); },
    getMousePosition: function () { return new OpenLayers.Control.MousePosition(); },
    getNavigation: function () {
        return new OpenLayers.Control.Navigation({
            dragPanOptions: {
                enableKinetic: true
            }
        });
    }
}, null);
ESRGC.Map.control = new ESRGC.Map.Control();