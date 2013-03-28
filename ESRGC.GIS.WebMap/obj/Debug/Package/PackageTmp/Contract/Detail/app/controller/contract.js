/*
Author: Tu Hoang
ESRGC 2012

Project Salisbury City
contract.js
Handles the loading of contract polygon 
used in detail page and edit/add page map.
*/

ESRGC.Controller.Contract = ESRGC.Class({
    name: 'Contract',
    refs: {
        contractId: '#contractId'
    },
    control: {},
    init: function () {
        var scope = this;
        var contractStore = ESRGC.getStore('Contract');
        if (typeof contractStore != 'undefined') {
            contractStore.on('beforeLoad', scope.onBeforeContractPolyLoad);
            contractStore.on('load', scope.onContractPolyLoad);
        }
    },
    onBeforeContractPolyLoad: function (store) {
        var scope = ESRGC.getController('Contract');
        var contractId = scope.getContractId().val();
        if (typeof contractId === 'undefined') {
            ESRGC.updateStatusMessage('No contract Id found');
            log('No contract Id found in hidden field (contractId)');
            return;
        }
        ESRGC.AjaxLoader.onLoadStart();
        ESRGC.updateStatusMessage('Loading contract polygons');
        store.setParams({ Id: contractId });
        log('loading contract polygon. Id: ' + contractId);
    },
    onContractPolyLoad: function (store, data) {
        if (data.length == 0) {
            log('Contract store: no json data returned. ');
            ESRGC.updateStatusMessage('No area found for this contract');
            return;
        }
        var scope = this;
        var mapViewer = ESRGC.getMapViewer();
        var app = ESRGC.getApp();
        //handle the graphic
        var vectorLayer = app.appData.vectorLayer;
        if (typeof vectorLayer == 'undefined') {
            vectorLayer = mapViewer.createDefaultVectorLayer({
                name: 'ContractPolygon',
                scope: this, //controller scope
                featureSelect: this.onFeatureSelect,
                featureUnselect: this.onFeatureUnselect,
                style: {
                    strokeWidth: 0,
                    strokeOpacity: 0.5,
                    strokeColor: "lime",
                    fillColor: "purple",
                    fillOpacity: .5
                },
                styleSelect: {
                    strokeWidth: 0,
                    strokeOpacity: .5,
                    strokeColor: "blue",
                    fillColor: "yellow",
                    fillOpacity: .5
                }
            });
            //store back to appData
            app.appData.vectorLayer = vectorLayer;
            //set visibility
            mapViewer.setLayerVisibility(vectorLayer, true);
        }
        //add data to vector layer
        mapViewer.addJsonDataToVectorLayer(vectorLayer, data);
        mapViewer.zoomToDataExtent(vectorLayer);
        ESRGC.AjaxLoader.onLoadEnd();
        ESRGC.updateStatusMessage('Ready');
    }

}, ESRGC.Controller.Base);