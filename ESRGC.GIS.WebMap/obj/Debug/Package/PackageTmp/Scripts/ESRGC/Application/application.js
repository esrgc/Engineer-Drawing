/* 
Author: Tu Hoang

application.js 
Base class for application
*/

ESRGC.Application = ESRGC.Class({
    initialize: function (options) {
        ESRGC.Component.prototype.initialize.call(this, arguments);
        //create app domain
        window.appName = this.name;
        window[this.name] = {
            name: this.name,
            appData: {},
            _views: [],
            _stores: [],
            _controllers: []
        };
        var scope = window[this.name];
        //create views
        for (var i in this.views) {
            var view = this.views[i];
            scope._views.push(new ESRGC.View[view]());
        }
        //create stores
        for (var i in this.stores) {
            var store = this.stores[i];
            scope._stores.push(new ESRGC.Store[store]());
        }
        //create controllers
        for (var i in this.controllers) {
            var controller = this.controllers[i];
            scope._controllers.push(new ESRGC.Controller[controller]());
        }
    }
}, ESRGC.Component);