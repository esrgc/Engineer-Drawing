/*
Startup configuration
*/

OpenLayers.ImgPath = "../../Scripts/Map/Openlayers/src/img/";
var options = {
    statusTagID: "statusUI", //status update bar,
    mapViewerType: "iMapViewer",
    mapOptions: {
        toolbarConfigs: {
            div: "toolBar",
            statusTagID: "statusUI" //status update bar,
        },
        layerConfigs: [

            {
                name: "Imagery",
                url: "http://mdimap.towson.edu/ArcGIS/rest/services/ImageryBaseMapsEarthCover/MD.State.CompositeImagery/MapServer",
                type: "arcTileMap",
                isBaseLayer: true,
                visibility: false,
                showInSwitcher: true,
                isPrimary: true,
                minZoomLevel: 0,
                maxZoomLevel: 11,
                animated: true,
                layerName: "MD iMap"
            },
            {
                name: "Street Map",
                url: "http://mdimap.towson.edu/ArcGIS/rest/services/ImageryBaseMapsEarthCover/MD.State.MDiMap_Gazetteer83M/MapServer",
                type: "arcTileMap",
                isBaseLayer: true,
                visibility: true,
                showInSwitcher: true,
                isPrimary: false,
                minZoomLevel: 0,
                maxZoomLevel: 11,
                animated: true,
                layerName: "MD iMap"
            },
            {
                name: "Hybrid",
                url: "http://mdimap.towson.edu/ArcGIS/rest/services/ImageryBaseMapsEarthCover/MD.State.MDiMap_Hybrid83M/MapServer",
                type: "arcTileMap",
                isBaseLayer: false,
                visibility: false,
                showInSwitcher: true,
                isPrimary: false,
                minZoomLevel: 0,
                maxZoomLevel: 11,
                animated: false,
                layerName: "MD iMap"
            }
          ],
        restrictedExtent: {
            xmin: -99731.9967145754, ymin: -151818.939484132,
            xmax: 858631.540846309, ymax: 421122.423315173
        }, //MD Extent
        initialExtent: {
            xmin: 485711.91781097, ymin: 59235.58638481, xmax: 559009.32030127, ymax: 96991.38381341
        },
        //callback used to do operation that requires the map to be already initialized
        onMapReady: function () {
            var scope = ESRGC.getApp();
            ESRGC.updateStatusMessage('Ready');
            //after initialized code goes here...
            //map ready call back to create tool bar
            scope.appData.toolbar = new ESRGC.Toolbar({
                mapViewer: scope.appData.mapViewer,
                items: [
                    'pan', 'zoomBox',
                    'areaMeasure',
                    'lineMeasure', 'zoomExtent',
                    'previousExtent', 'nextExtent'
                ],
                events: {//in toolbar context
                    onInfoActivated: function (event) {
                        log('info tool attached event: onActivated');
                        //enable drawing controls
                        var contractLayer = ESRGC.getApp().appData.contractVectorLayer;
                        var drawControls = this.mapViewer.drawFeatureControls;
                        //register associated vector layer
                        if (!drawControls.associatedLayerRegistered())
                            drawControls.registerAssociatedLayer(contractLayer);
                        drawControls.setEnabled(true);
                    },
                    onInfoDeactivated: function (event) {
                        log('info tool attached event: onDeactivated');
                        //disable draw controls
                        var drawControls = this.mapViewer.drawFeatureControls;
                        drawControls.setEnabled(false);
                    }
                }
            });

            //register event for drawtool
            var contractController = ESRGC.getController('Contract');
            if (typeof contractController != 'undefined') {
                var onFeatureAddedEventHandler = contractController.onFeatureAdded;
                if (typeof onFeatureAddedEventHandler == 'function') {
                    this.drawFeatureControls.on('onFeatureAdded', onFeatureAddedEventHandler);
                }
            }

            //reload polygon when redisplaying data or load current polygon
            var wkts = contractController.getWktFields();
            if (typeof wkts != 'undefined') {
                var data = [];
                wkts.each(function (i) {
                    data.push({ Wkt: $(this).val() });
                });
                var mapViewer = this;
                var vectorLayer = mapViewer.drawFeatureControls.getVectorLayer();
                if (typeof vectorLayer != 'undefined') {
                    //add data to vector layer
                    mapViewer.addJsonDataToVectorLayer(vectorLayer, data);
                    mapViewer.zoomToDataExtent(vectorLayer);
                }
            }
        }
    }
};

