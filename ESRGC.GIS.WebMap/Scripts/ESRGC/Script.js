/*helper functions*/
function getLayerConfigs(layerUrl, callback) {
    var cb = callback; //closure scope
    var jsonp_url = layerUrl + '?f=json&pretty=true&callback=?';
    $.getJSON(jsonp_url, cb);
}

function extend(Child, Parent) {
    var F = function () { };
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.parent = Parent.prototype;
}

function extend2(Child, Parent) {
    Child = Child || {};
    if (Parent) {
        for (var property in Parent) {
            var value = Parent[property];
            if (value !== undefined) {
                Child[property] = value;
            }
        }

        /**
        * IE doesn't include the toString property when iterating over an object's
        * properties with the for(property in object) syntax.  Explicitly check if
        * the Parent has its own toString property.
        */

        /*
        * FF/Windows < 2.0.0.13 reports "Illegal operation on WrappedNative
        * prototype object" when calling hawOwnProperty if the Parent object
        * is an instance of window.Event.
        */

        var sourceIsEvt = typeof window.Event == "function"
                          && Parent instanceof window.Event;

        if (!sourceIsEvt
           && Parent.hasOwnProperty && Parent.hasOwnProperty("toString")) {
            Child.toString = Parent.toString;
        }
    }
}
/*
Helper functions
*/
//console log
function log(msg) {
    if (!$.browser.msie)
        console.log(msg);
}
//add days to Date object
Date.prototype.addDays = function (days) {
    var dat = new Date(this.valueOf())
    dat.setDate(dat.getDate() + days);
    return dat;
};
//get date string from date object
Date.prototype.getDateString = function (deliminator) {
    var dateStr = (this.getMonth() + 1) + deliminator + this.getDate() + deliminator + (this.getFullYear() - 1);
    return dateStr;
};

//define basic app namespace that contains classes (prototypes) for app
var ESRGC = {
    Map: {},
    Controller: {},
    View: {},
    Model: {},
    Store: {},
    //create a class (constructor function) that inherits from a parent object
    //if parent object is null, the child object becomes the new class' prototype.
    //if initialize is defined in child object it overrides the one in parent object
    Class: function (child, parent) {
        var ch = child;
        var p = parent;
        var C = null;
        if (parent == null) {
            C = function () {
                if (typeof this.initialize != "undefined")
                    this.initialize.apply(this, arguments);
            };
            C.prototype = ch;
        }
        else {
            C = function () {
                var init = typeof this.initialize == "function" ? this.initialize : 'undefined';
                if (init !== undefined) {
                    init.apply(this, arguments);
                }
            };
            extend(C, p); //inherit prototype
            extend2(C.prototype, ch); //augment prototype
        }
        return C;
    },
    //map viewer prototype
    /*Map wrapper prototype functions*/
    //shared among apps -- to be moved into one isolated file
    BaseViewer: {},
    AjaxLoader: {
        onLoadStart: function () { $("#ajaxLoader").fadeIn(); },
        onLoadEnd: function () { $("#ajaxLoader").fadeOut(); },
        getLoadingHtml: function (url) {
            var loadingHtml = [
                '<div id="ajaxLoadingHtml" class="row-fluid">',
                    '<div style="width: 200px; margin:auto;">',
                        '<span><img src="'+ url +'" style="padding: 10px;" />',
                            '<strong>Loading! Please wait...</strong>',
                        '</span>',
                    '</div>',
                '</div>'
            ].join('');
            return loadingHtml;
        }
    },
    updateStatusMessage: function (msg) {
        $("#statusUI").text(msg);
    },
    getApp: function () {
        return window[window.appName];
    },
    getStore: function (name) {
        var stores = this.getApp()._stores;
        if (typeof stores != 'undefined')
            for (var i in stores) {
                var store = stores[i];
                if (store.name == name)
                    return store;
            }
    },
    getView: function (name) { },
    getController: function (name) {
        var controllers = this.getApp()._controllers;
        if (typeof controllers != 'undefined')
            for (var i in controllers) {
                var controller = controllers[i];
                if (controller.name == name)
                    return controller;
            }
    },
    getMapViewer: function () {
        return this.getApp().appData.mapViewer;
    }

};

