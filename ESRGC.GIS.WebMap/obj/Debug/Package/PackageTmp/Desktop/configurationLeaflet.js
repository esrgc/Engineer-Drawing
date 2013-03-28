/*
Startup configuration
*/

var options = {
    statusTagID: "statusUI", //status update bar,
    mapViewerType: "CloudMadeMapViewer",
    mapOptions: {
        toolbarConfigs: {
            div: "toolBar",
            statusTagID: "statusUI" //status update bar,
        },
        layerConfigs: [
        //            {
        //                name: "CloudMade Base",
        //                type: "cloudmade",
        //                isPrimary: true
        //            }
            {
                name: "MD iMap",
                type: "wms",
                isPrimary: true,
                url: "http://mdimap-web-3/arcgis/services/ImageryBaseMapsEarthCover/MD.State.MDiMap_Gazetteer83M/MapServer/WMSServer",
                layers: ["MD iMap Data"]
            }
        ],
        center: {
            x: 38.34333,
            y: -75.60604,
            level: 10
        },
        initialExtent: { xmin: 38.33489, ymin: -75.59358, xmax: 38.35179, ymax: -75.61937 },
        restrictedExtent: {
            xmin: -99731.9967145754, ymin: -151818.939484132,
            xmax: 858631.540846309, ymax: 421122.423315173
        } //MD Extent

    }
};

