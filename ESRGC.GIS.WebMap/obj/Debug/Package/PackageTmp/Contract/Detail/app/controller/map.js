/*
Author: Tu Hoang
ESRGC 2012

Desktop browser

Controller
map.js
map controller 
control the map events
(implemented based on JQuery)

options: 
refs: object contains of references 
control: object of handlers

*/

ESRGC.Controller.Map = ESRGC.Class({
    name: 'Map',
    refs: {

    },
    control: {},
    init: function () {
        var scope = ESRGC.getApp();
        var options = window.options;
        ESRGC.updateStatusMessage('Initializing map...');
        //initialize map viewer using options in configuration js
        scope.appData.mapViewer = new ESRGC[options.mapViewerType](options.mapOptions);
    }
}, ESRGC.Controller.Base);