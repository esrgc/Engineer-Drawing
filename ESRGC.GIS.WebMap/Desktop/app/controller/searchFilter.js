/*
Author: Tu Hoang
ESRGC 2012

Desktop Browser

Controller
searchFilter.js
controller handles search mode and filter

*/

ESRGC.Controller.SearchFilter = ESRGC.Class({
    name: 'SearchFilter',
    refs: {
        //        atLocationSearchRadio: '#atLocationMode',
        //        nearbySearchRadio: '#nearbyMode'
        searchModeRadio: 'button[name="searchMode"]',
        systemRadio: 'button[name="system"]'
    },
    control: {
        searchModeRadio: {
            click: 'onSearchModeChanged'
        },
        systemRadio: {
            click: 'onSystemChanged'
        }
    },
    init: function () {

    },
    onSearchModeChanged: function (event) {
        log(event.target.value);
        var type = event.target.value;
        var mapViewer = ESRGC.getMapViewer();
        var drawControls = mapViewer.drawFeatureControls;
        drawControls.deactivateAllControls();
        drawControls.activateControl(type);
        drawControls.clearFeatures();
    },
    onSystemChanged: function (event) {
        log(event.target.value);
        var type = event.target.value;
        var app = ESRGC.getApp();
        //store current system filter to app data
        app.appData.currentContractSystemFilter = type;
        //check for current search params
        var searchParams = app.appData.currentSearchParams;
        if (typeof searchParams == 'undefined')
            return;
        if (typeof searchParams.wkt != 'undefined') {
            //update system filter
            searchParams.system = type;
            //there is geometry for info tool refresh contracts
            var contractStore = ESRGC.getStore('ContractByGeom');
            contractStore.loadJson();
        }
    }
}, ESRGC.Controller.Base);