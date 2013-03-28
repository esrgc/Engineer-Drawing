/*
Author: Tu hoang
ESRGC
Provides base (prototype) functions for mapviewer
Leaflet API
Mobile browser
*/

ESRGC.BaseViewer = ESRGC.Class({
    //constructor
    initialize: function () { },
    //utility function to update status message
    updateStatusMsg: ESRGC.updateStatusMessage,
    toolVectorLayers: [],
    //this function registers a vector layer with selectFeature control
    //valid option:
    //{layers}: a vector layer or array of vector layers
    setVectorLayers: function (layers) {

    },
    addVectorLayerToSelectControl: function (layer) {

    },
    //map functions
    getCurrentExtent: function () {

    },
    //set restricted extent
    setRestrictedExtent: function (extent) {
    },
    setMaxExtent: function (extent) {
    },
    setMinResolution: function (resolution) {
    },
    setMaxResolution: function (resolution) {
    },
    zoomToExtent: function (extent) {
        this.map.fitBounds(new L.LatLngBounds(new L.LatLng(extent.xmin, extent.ymin),
         new L.LatLng(extent.xmax, extent.ymax)));
    },
    zoomToFullExtent: function () {
    },
    //zoom to point with 2 zoom levels below max level
    zoomToPoint: function (x, y, level) {
        this.map.setView(new L.LatLng(y, x), this.map.getMaxZoom() - 2);
    },
    zoomIn: function () {
        this.map.zoomIn();
    },
    zoomOut: function () {
        this.map.zoomOut();
    },
    zoomToDataExtent: function (layer) {
    },
    panTo: function (x, y) {
        this.map.panTo(new L.LatLng(y, x));
    },
    locate: function () {
        this.map.locateAndSetView(this.map.getMaxZoom() - 2);
    },
    addLayerToMap: function (layer) {
    },
    addLayers: function (layers) {
    },
    addJsonDataToVectorLayer: function (layer, data) {
    },
    clearLayerFeatures: function (layer) {
    },
    removeLayerFromMap: function (layer) {
    },
    getLayerByName: function (name) {
    },
    switchWMSLayer: function (layers, layerName) {
    },
    //set layer visibility on/off 
    //{layer}: layer to set
    //{visibility}: boolean value
    setLayerVisibility: function (layer, visibility) {
    },
    refresh: function () {
    },
    /*
    Create service vector layer with provided options
    Valid options:
    {name}: vector layer name
    */
    createDefaultServiceLayer: function (options) {
    }
});