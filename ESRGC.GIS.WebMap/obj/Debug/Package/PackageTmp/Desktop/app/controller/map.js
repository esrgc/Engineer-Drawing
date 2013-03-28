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
    /// <reference path="../../../Scripts/Map/Leaflet/src/images/marker-shadow.png" />

    markerImgPath: '../Scripts/Map/Leaflet/src/images/marker.png',
    refs: {
        mapTab: '#navigationTab a[href="#mapTab"]',
        locateAddrForm: '#locateAddressFrm',
        locateAddrButton: '#locateAddrBtn',
        addressInputLabel: '#addressInputLbl',
        addressInputContainer: '#addressInputCnt',
        zipInputLabel: '#zipInputLbl',
        zipInputContainer: '#zipInputCnt'
    },
    control: {
        mapTab: {
            shown: 'onMapTabShown'
        },
        locateAddrForm: {
            submit: 'onLocateAddressSubmit'
        }
    },
    init: function () {
        var geocodeStore = ESRGC.getStore('MdImapGeocoder');
        if (geocodeStore) {
            //geocodeStore.on('beforeLoad', function (store) {});
            geocodeStore.on('load', this.onLocateAddrLoad);
        }
    },
    onMapTabShown: function () {
        if (typeof ESRGC.getMapViewer() == 'undefined') {
            scope = ESRGC.getApp();
            var options = window.options;
            ESRGC.updateStatusMessage('Initializing map...');
            //initialize map viewer using options in configuration js
            scope.appData.mapViewer = new ESRGC[options.mapViewerType](options.mapOptions);
        }
    },
    onLocateAddressSubmit: function (event, object) {
        //prevent form to submit to server and use ajax 
        event.preventDefault();
        var scope = this;
        var data = scope.getFormData($(object));
        //validate data
        if (data.address == '') {
            //prompt error
            scope.getAddressInputContainer().addClass('error');
            scope.getAddressInputLabel().text('Invalid input. Please enter address');
            return;
        }
        else {
            scope.getAddressInputContainer().removeClass('error');
            scope.getAddressInputLabel().text('');
            data.address = data.address.replace('.', ' ');
        }
        if (data.zip == '') {
            scope.getZipInputContainer().addClass('error');
            scope.getZipInputLabel().text('Invalid input. Please enter zipcode');
            return;
        }
        else {
            scope.getZipInputContainer().removeClass('error');
            scope.getZipInputLabel().text('');
        }
        //get store and prepare parameters for address search using imap geocoder
        var geocodeStore = ESRGC.getStore('MdImapGeocoder');
        geocodeStore.setParams({
            street: data.address,
            zone: data.zip
        });
        //change button state
        scope.getLocateAddrButton().button('loading');
        //geocode
        geocodeStore.loadJson();
    },
    //store events
    onLocateAddrLoad: function (store, data) {
        var scope = ESRGC.getController('Map')
        //reset locate button state to normal
        scope.getLocateAddrButton().button('reset');
        //process address
        var acceptScore = 80;
        var location = null;
        for (var i in data) {
            var candidate = data[i];
            if (candidate.score >= acceptScore) {
                acceptScore = candidate.score;
                location = candidate.location;
            }
        }
        if (location != null) {
            var mapViewer = ESRGC.getMapViewer();
            mapViewer.zoomToPoint(location.x, location.y);
            ESRGC.updateStatusMessage('Address found. Zoomed to location.');
        }
        else {
            ESRGC.updateStatusMessage('Address not found.');
        }

        //handle marker
        //create marker layer
        var markerLayer = ESRGC.getApp().appData.markerLayer;
        //create marker layer if it doesn't exist
        if (typeof markerLayer == 'undefined') {
            markerLayer = mapViewer.createMarkerLayer('Address', {
                displayInLayerSwitcher: false
            });
            ESRGC.getApp().appData.markerLayer = markerLayer;
        }
        mapViewer.removeAllMarkers(markerLayer);
        mapViewer.addMarkerAtPoint(location, markerLayer, scope.markerImgPath)
    }

}, ESRGC.Controller.Base);