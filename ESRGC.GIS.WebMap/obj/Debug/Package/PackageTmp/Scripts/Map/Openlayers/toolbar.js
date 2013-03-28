/*
Author: Tu hoang
ESRGC
Tool bar -- Implemented based on OpenLayers API
Allows selecting parcel and get its info
*/
/*
valid options
{mapviewer}
{div}: div tag that used to add panel 
{statusTagID}: elevemnt tag that used to display tool status
*/
ESRGC.Toolbar = function (mapViewer, options) {
    extend2(this, options); //copy all the parameters
    var statusTagID = this.statusTagID;
    var updateStatus = function (msg) { $("#" + statusTagID).text(msg); }; //for update tool bar message

    //reference to ol map object
    var map = mapViewer.map;

    var toolEventListeners = {
        activate: function (e) {
            $("#map").addClass(this.name, 0.2, false, null);
            var msg = "Tool " + this.name + " activated";
            log(msg);
            updateStatus(msg);
        },
        deactivate: function (e) {
            $("#map").removeClass(this.name, 0.2, false, null);
            var msg = "Tool " + this.name + " deactivated";
            log(msg);
        }
    };

    //create controls
    var zb = new OpenLayers.Control.ZoomBox({ name: "ZoomBox", title: "Zoom box", eventListeners: toolEventListeners });
    var pan = new OpenLayers.Control({
        name: "Pan",
        type: OpenLayers.Control.TYPE_TOOL,
        displayClass: "Pan",
        title: 'Pan',
        eventListeners: toolEventListeners
    });
    //        var drawFeature = new OpenLayers.Control.DrawFeature(vlayer, OpenLayers.Handler.Path,
    //                    { title: 'Draw a feature' });
    var zoomMaxExtent = new OpenLayers.Control.ZoomToMaxExtent({ title: "Zoom to the max extent", name: "Max Extent", eventListeners: toolEventListeners })
    var nav = new OpenLayers.Control.NavigationHistory();
    // parent control must be added to the map
    map.addControl(nav);

    /*Info tool*/
    // Create a style map for painting the features.
    var styles = new OpenLayers.StyleMap({
        "default": {
            graphicName: "${type}",
            pointRadius: 10,
            strokeColor: "fuchsia",
            strokeWidth: 2,
            fillColor: "lime",
            fillOpacity: 0.6
        },
        "select": {
            pointRadius: 20,
            fillOpacity: 1,
            rotation: 45
        }
    });

    //add a vector layer for tool bar operation
    var vlayer = new OpenLayers.Layer.Vector("Editable",
        { styleMap: styles, isBaseLayer: false, displayInLayerSwitcher: false });
    map.addLayer(vlayer);

    // Create a select feature control and add it to the map.
    //    var select = new OpenLayers.Control.SelectFeature(vlayer, {
    //        hover: true
    //    });
    //    map.addControl(select);
    //create control panel
    var panel = new OpenLayers.Control.Panel(
                    { div: document.getElementById(this.div), defaultControl: pan }
    );
    //add controls to panel
    panel.addControls([
            pan,
            zb,
    //drawFeature,
            zoomMaxExtent
        ]);
    panel.addControls([nav.next, nav.previous]);

    //add panel to map
    map.addControl(panel);

    //define info service
    if (typeof this.infoService == "undefined")
        log("No info service was found");
    else {
        var infoService = this.infoService;

        //define event handlers
        var infoToolListeners = {
            "activate": infoToolActivate,
            "deactivate": infoToolDeactivate
        };
        //info tool activate event handler
        function infoToolActivate(event) {
            $("#map").addClass(this.name, 0.2, false, null);
            var msg = "Tool " + this.name + " activated";
            log(msg);
            updateStatus(msg);
            vlayer.setVisibility(true);
            infoService.activate();
        }
        //info tool deactivate event handler
        function infoToolDeactivate(event) {
            $("#map").removeClass(this.name, .2, false, null);
            var msg = "Tool " + this.name + " deactivated";
            log(msg);
            updateStatus(msg);
            vlayer.setVisibility(false);
            infoService.deactivate();
        }
        //define a click control that handles info click
        var info = new OpenLayers.Control.Click({
            name: "Info",
            eventListeners: infoToolListeners,
            displayClass: "info",
            title: "Info tool",
            handlerOptions: { single: true, double: false },
            onClick: function (evt) {
                var lonlat = map.getLonLatFromPixel(evt.xy);
                infoService.getInfoAt(lonlat.lon, lonlat.lat);
            }
        });

        panel.addControl(info);
    }
}
