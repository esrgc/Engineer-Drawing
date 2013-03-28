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
        contractId: '#contractId',
        addPolyBtn: 'button#addPolygon', //button that activates the drawing control
        removeLastFeaBtn: 'a#removeLast', //remove last feature added
        removeAllPrevFeaBtn: 'a#removeAllPrev', //link to remove previous polygon
        clearFeatureBtn: 'a#clearAll', //clear all polygons
        finishBtn: 'a#finish', //finish editing
        wktFields: 'input[name="wkts"]',
        contractForm: 'form[id="contractForm"]',
        toolbarBtnGroup: '.btn-toolbar .btn-group'
    },
    control: {
        addPolyBtn: {
            click: 'onAddPolyBtnClick'
        },
        removeLastFeaBtn: {
            click: 'onRemoveLastFeaBtnClick'
        },
        removeAllPrevFeaBtn: {
            click: 'onRemoveAllPrevFeaBtnClick'
        },
        clearFeatureBtn: {
            click: 'onClearFeatureBtnClick'
        },
        finishBtn: {
            click: 'onFinishBtnClick'
        }
    },
    init: function () {
        var scope = this;
    },
    //controller events
    onAddPolyBtnClick: function (event, object) {
        var scope = this;
        event.preventDefault();
        //disable this button
        $(object).addClass('disabled');
        log('onAddPolyBtnClick event');
        //turn off map tool bar selection
        var toolbar = ESRGC.getApp().appData.toolbar;
        if (typeof toolbar != 'undefined') {
            toolbar.deactivateAll();
        }
        //drawControls
        var drawControls = ESRGC.getMapViewer().drawFeatureControls;
        if (typeof drawControls != 'undefined') {
            drawControls.activateControl('polygon');
            drawControls.setEnabled(true);
        }
    },
    onRemoveLastFeaBtnClick: function (event, object) {
        var scope = this;
        event.preventDefault();
        log('onRemoveLastFeaBtnClick event');
        //drawControls
        var drawControls = ESRGC.getMapViewer().drawFeatureControls;
        if (typeof drawControls != 'undefined') {
            drawControls.popFeature();
            scope.saveFeatures();
        }
    },
    onRemoveAllPrevFeaBtnClick: function (event, object) {
        var scope = this;
        event.preventDefault();
        log('onRemoveAllPrevFeaBtnClick event');
        //drawControls
        var drawControls = ESRGC.getMapViewer().drawFeatureControls;
        if (typeof drawControls != 'undefined') {
            drawControls.popPreviousFeatures(); //clear previous features
            scope.saveFeatures();
        }
    },
    onClearFeatureBtnClick: function (event, object) {
        var scope = this;
        event.preventDefault();
        log('onClearFeatureBtnClick event');
        //drawControls
        var drawControls = ESRGC.getMapViewer().drawFeatureControls;
        if (typeof drawControls != 'undefined') {
            drawControls.clearFeatures(); //clear all features
            scope.saveFeatures();
        }
    },
    onFinishBtnClick: function (event, object) {
        var scope = this;
        event.preventDefault();
        log('onFinishBtnClick event');
        //enable add button
        scope.getAddPolyBtn().removeClass('disabled');
        //drawControls
        var drawControls = ESRGC.getMapViewer().drawFeatureControls;
        if (typeof drawControls != 'undefined') {
            drawControls.setEnabled(false, false); //keep graphics
            scope.saveFeatures();
        }
    },
    //Custom events used for map events
    //onFeatureAdded handler used to extract wkt from drawing control
    onFeatureAdded: function (event) {
        log('onFeature added event');
        var scope = ESRGC.getController('Contract');
        scope.saveFeatures();
    },
    //private helper
    //get wkt of the features and store in hidden field
    saveFeatures: function () {
        var scope = this;
        //drawControls
        var drawControls = ESRGC.getMapViewer().drawFeatureControls;
        if (typeof drawControls != 'undefined') {
            var wkts = drawControls.getFeatureWktArray();
            log(wkts);
            var contractForm = scope.getContractForm();
            //clear current hidden fields
            scope.getWktFields().remove();
            //store wkt to new hidden fields
            for (var i in wkts) {
                var input = $(document.createElement('input'));
                input.attr('type', 'hidden');
                input.attr('name', 'wkts');
                input.attr('value', wkts[i]);
                contractForm.append(input);
            }
        }
    }

}, ESRGC.Controller.Base);