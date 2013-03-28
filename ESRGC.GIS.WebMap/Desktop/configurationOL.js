/*
Startup configuration
*/

OpenLayers.ImgPath = "../Scripts/Map/Openlayers/src/img/";
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
        //           ,{
        //                name: 'SalisburyCity',
        //                url: '../maps/ImsServices/wms.aspx',
        //                type: 'wms',
        //                component: 'Map',
        //                isBaseLayer: false,
        //                showInSwitcher: true,
        //                isPrimary: false,
        //                visibility: true,
        //                layers: ['SalisburyCity']
        //            }
          ],
        //        maxResolution: 0.298247894243184,
        //        minResolution: 610.811687419209,
        restrictedExtent: {
            xmin: -99731.9967145754, ymin: -151818.939484132,
            xmax: 858631.540846309, ymax: 421122.423315173
        }, //MD Extent
        initialExtent: {
            xmin: 485711.91781097, ymin: 59235.58638481, xmax: 559009.32030127, ymax: 96991.38381341
        },
        //for toolbar
        onMapReady: function () {
            var scope = ESRGC.getApp();
            //map ready call back to create tool bar
            scope.appData.toolbar = new ESRGC.Toolbar({
                mapViewer: scope.appData.mapViewer,
                items: [
                    'pan', 'zoomBox',
                    'info', 'areaMeasure',
                    'lineMeasure', 'zoomExtent',
                    'previousExtent', 'nextExtent'
                ],
                events: {
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
            //scope.appData.mapViewer.expandLayerSwitcher(); //open layer switcher 

            //load contract polygons
            //load polygon data
            var polygonStore = ESRGC.getStore('ContractPolygon');
            polygonStore.loadJson();
        },
        //call back for info tool using drawFeature control
        onInfoFeatureAdded: function (event) {
            log('customDrawFeature class: featureadded event object');
            log(event);
            //implement logic here
            var mapViewer = ESRGC.getMapViewer();
            var app = ESRGC.getApp();

            //select contract polygon step
            var contractLayer = app.appData.contractVectorLayer;
            this.popPreviousFeatures();
            if (typeof contractLayer == 'undefined') {
                log('Error occured. Contract vector layer is undefined');
                return;
            }
            var contractFeatures = contractLayer.features;
            var infoFeature = event.feature;
            var intersectedFeatures = [];
            //unselect previous features
            var previousSelectedFeatures = app.appData.intersectedFeatures;
            this.unselectAssociatedFeatures(previousSelectedFeatures);
            ESRGC.updateStatusMessage('Finding contracts...');
            ESRGC.AjaxLoader.onLoadStart();
            for (var i in contractFeatures) {
                var feature = contractFeatures[i];
                if (infoFeature.geometry.intersects(feature.geometry))
                    intersectedFeatures.push(feature);
            }
            //select new intersected features
            this.selectAssociatedFeatures(intersectedFeatures);
            app.appData.intersectedFeatures = intersectedFeatures;
            //get geom wkt
            var wkt = this.getFeatureWkt(infoFeature);
            var system = app.appData.currentContractSystemFilter;
            if(typeof system == 'undefined')
                system = 'all';//load all contract types
            ESRGC.updateStatusMessage('Selected: ' + intersectedFeatures.length + ' . Loading Contracts...');
            //load contract using contract store (initialized in Contract controller)
            var contractStore = ESRGC.getStore('ContractByGeom');
            app.appData.currentSearchParams = {
                wkt: wkt,
                system: system
            };
            contractStore.loadJson();
            ESRGC.AjaxLoader.onLoadEnd();

        }
    }
};

