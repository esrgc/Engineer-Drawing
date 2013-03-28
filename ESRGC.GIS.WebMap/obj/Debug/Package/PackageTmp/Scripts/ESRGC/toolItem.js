/*
Author: Tu Hoang
ESRGC 2012

Desktop browser

toolItem.js
tool bar item used to populate toolbar

*/

ESRGC.ToolbarItem = ESRGC.Class({
    initialize: function (options) {
        ESRGC.Component.prototype.initialize.apply(this, arguments);
        //create item id
        this.id = this.name + 'ToolItem';
        this.uiClass = this.name + 'Item';
    },
    type: '',
    isActive: false,
    name: '',
    uiClass: '',
    activeUiClass: 'itemActive',
    imgIcon: '',
    events: null,
    controlObject: null,
    getHtml: function () {
        //        var htmlTemplate = [
        //            '<div id="' + this.id + '" class="toolItem ',
        //            this.uiClass + '" title="' + this.description + '"></div>'
        //        ].join(' ');
        var htmlTemplate = [
            '<a id="', this.id, '" class="btn btn-small" title="', this.description, '">',
                '<div class="toolItem ', this.uiClass, '"></div>',
            '</a>'
        ].join('');
        return htmlTemplate;
    },
    activate: function () {
        if (this.type == 'toggle') {
            if (!this.isActive) {
                this.isActive = true;
                //$('#' + this.id).addClass(this.activeUiClass); //add toolbar active css class
                $('#map').addClass(this.name); //add map cursor css class

                var msg = this.description;
                //ESRGC.updateStatusMessage(msg);
                log(msg);
            }
        }
        if (this.events) {
            if (typeof this.events.onActivate == 'function') {
                var toolbar = ESRGC.getApp().appData.toolbar; //context used to call callbacks 
                this.events.onActivate.call(toolbar, this);
            }
        }
    },
    deactivate: function () {
        if (this.type == 'toggle') {
            if (this.isActive) {
                this.isActive = false;
                $('#' + this.id).removeClass('active'); //remove active class on tool button
                $('#map').removeClass(this.name); //remove map cursor css class
                var msg = "Tool " + this.name + " deactivated";
                log(msg);
            }
        }
        if (this.events) {
            if (typeof this.events.onDeactivate == 'function') {
                var toolbar = ESRGC.getApp().appData.toolbar; //context used to call callbacks 
                this.events.onDeactivate.call(toolbar, this);
            }
        }
    },
    report: function () {
        ESRGC.updateStatusMessage(this.description);
    },
    onItemAdded: function () {

    }
}, ESRGC.Component);