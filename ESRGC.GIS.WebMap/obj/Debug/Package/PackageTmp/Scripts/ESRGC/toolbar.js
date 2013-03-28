/*
Author: Tu Hoang
ESRGC 2012

Desktop browser

toolbar.js
tool bar code for map app

contains basic tools: zoom in, zoom out, zoombox, measure tool, info tool, 
zoom to fullextent, next and previous extent

options: 
items -- array of items to be added to toolbar
mapViewer -- mapViewer object to handle the tool
*/

ESRGC.Toolbar = new ESRGC.Class({
    initialize: function (options) {
        ESRGC.Component.prototype.initialize.apply(this, arguments);

        //get main panel
        var panel = $(this.toolbarId);
        //create container
        var container = [
            '<div class="toolbarItemsContainer btn-toolbar">',
                '<div id="toggleGroup" class="btn-group" data-toggle="buttons-radio"></div>',
                '<div id="actionGroup" class="btn-group"><div>',
            '</div>'
        ].join('');
        panel.html(container);
        var toggleGrpHtml = '', actionGrpHtml = '';
        //generate items html
        for (var i in this.items) {
            var item = this.items[i];
            if (typeof this.toolItems[item] != 'undefined') {
                var toolItem = this.toolItems[item];
                switch (toolItem.type) {
                    case 'toggle':
                        toggleGrpHtml += toolItem.getHtml();
                        break;
                    case 'action':
                        actionGrpHtml += toolItem.getHtml();
                        break;
                }
            }
        }
        //insert to tool bar container
        $('.toolbarItemsContainer #toggleGroup').html(toggleGrpHtml);
        $('.toolbarItemsContainer #actionGroup').html(actionGrpHtml);
        //$('.toolbarItemsContainer').append('<div class="clear"></div>');

        var scope = this; //toolbar scope
        //wire events using jquery
        $('#toolbar a').on('click', function (e, obj) {
            var id = $(this).attr('id');
            var eventType = e.type;
            //get tool item object                
            var currentToolItem = scope.getToolById(id);
            var isActive = currentToolItem.isActive;

            //deactivate all tools
            if (currentToolItem.type == 'toggle')
                scope.deactivateAll();
            if (currentToolItem.name == 'info') {
                //toggle the tool if it's an info tool
                if (isActive) {
                    currentToolItem.deactivate();
                    scope.getToolById('panToolItem').activate();
                }
                else
                    currentToolItem.activate();
            }
            else
                currentToolItem.activate();
        });


        //activate pan tool by default
        var pan = this.toolItems['pan'];
        pan.activate();

    },
    //default values
    toolbarId: '#toolbar',
    toolItems: {
        pan: new ESRGC.ToolbarItem({
            name: 'pan',
            description: 'Pan',
            type: 'toggle'
        }),
        zoomBox: new ESRGC.ToolbarItem({
            name: 'zoomBox',
            description: 'Zoom Box',
            type: 'toggle',
            events: {
                onActivate: function (e) {
                    this.mapViewer.activateControl(e.name);
                },
                onDeactivate: function (e) {
                    this.mapViewer.deactivateControl(e.name);
                }
            }
        }),
        info: new ESRGC.ToolbarItem({
            name: 'info',
            description: 'Info/Identify',
            type: 'toggle',
            events: {
                onActivate: function (e) {
                    this.mapViewer.activateControl(e.name);
                    if (typeof this.events.onInfoActivated != 'undefined') {
                        this.events.onInfoActivated.call(this, e);
                    }
                },
                onDeactivate: function (e) {
                    this.mapViewer.deactivateControl(e.name);
                    if (typeof this.events.onInfoDeactivated != 'undefined') {
                        this.events.onInfoDeactivated.call(this, e);
                    }
                }
            }
        }),
        zoomExtent: new ESRGC.ToolbarItem({
            name: 'zoomExtent',
            description: 'Zoom to full extent',
            type: 'action',
            events: {
                onActivate: function (e) {
                    this.mapViewer.zoomToFullExtent();
                    //this.deactivateAll();
                }
            }
        }),
        zoomOut: new ESRGC.ToolbarItem({
            name: 'zoomOut',
            description: 'Zoom Out',
            type: 'action',
            events: {
                onActivate: function (e) {
                    this.mapViewer.zoomOut();
                }
            }
        }),
        nextExtent: new ESRGC.ToolbarItem({
            name: 'nextExtent',
            description: 'Next extent',
            type: 'action',
            events: {
                onActivate: function (e) {
                    this.mapViewer.nextExtent();
                }
            }
        }),
        previousExtent: new ESRGC.ToolbarItem({
            name: 'previousExtent',
            description: 'Previous extent',
            type: 'action',
            events: {
                onActivate: function (e) {
                    this.mapViewer.previousExtent();
                }
            }
        }),
        lineMeasure: new ESRGC.ToolbarItem({
            name: 'lineMeasure',
            description: 'Line measure tool',
            type: 'toggle',
            events: {
                onActivate: function (e) {
                    this.mapViewer.activateControl(e.name);
                },
                onDeactivate: function (e) {
                    this.mapViewer.deactivateControl(e.name);
                }
            }
        }),
        areaMeasure: new ESRGC.ToolbarItem({
            name: 'areaMeasure',
            description: 'Polygon measure tool',
            type: 'toggle',
            events: {
                onActivate: function (e) {
                    this.mapViewer.activateControl(e.name);
                },
                onDeactivate: function (e) {
                    this.mapViewer.deactivateControl(e.name);
                }
            }
        })
    },
    getToolById: function (id) {
        for (var i in this.toolItems) {
            var tool = this.toolItems[i];
            if (tool.id == id)
                return tool;
        }
    },
    deactivateAll: function () {
        //remove all active classes first 
        for (var i in this.toolItems) {
            this.toolItems[i].deactivate();
        }
    },
    getActiveToolItem: function () {
        for (var i in this.toolItems) {
            if (this.toolItems[i].isActive)
                return this.toolItems[i];
        }
    },
    disableToolbar: function () { },
    enableToolbar: function () { }

}, ESRGC.Component);