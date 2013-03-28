/*
Author: Tu Hoang
ESRGC 2012

Desktop browser

controller.js
base controller 
(implemented based on JQuery)

options: 
refs: object contains of references 
control: array of handlers

required: Jquery
*/

ESRGC.Controller.Base = ESRGC.Class({
    initialize: function (options) {
        ESRGC.Component.prototype.initialize.apply(this, arguments);
        //create getter for refs
        //return jquery object for the referenced element
        for (var ref in this.refs) {
            var refName = ref.toString();
            var refName = refName.slice(0, 1).toUpperCase() + refName.slice(1, refName.length);
            var reference = this.refs[ref];

            this['get' + refName] = function (ref) {
                return function (context) {
                    if (typeof context != 'undefined')
                        return $(ref, context);
                    else
                        return $(ref);
                };
            } (reference);
        }
        //wire events using refs and control
        for (var ref in this.refs) {
            for (var controlRef in this.control) {
                if (ref == controlRef) {
                    var events = this.control[controlRef];
                    for (var event in events) {
                        //get event handler reference
                        var handler = this[events[event]];
                        $(this.refs[ref]).live(event, { scope: this, handler: handler }, function (event) {
                            var scope = event.data.scope; //controller scope 
                            var handler = event.data.handler; //event handler to be called in controller context
                            if (typeof handler == 'undefined')
                                log('no event handler found for ' + event.type + ' on  ' + event.target);
                            else if (typeof handler == 'function')
                                handler.call(scope, event, this);
                            //return false;//for any form events
                        });
                    }
                }
            }
        }

        if (typeof this.init == 'function')
            this.init();
        log('initialized controller: ' + this.name);
    },
    //Returns an object containing form data
    //form is either a string id of the form
    //or a jquery wrapper object of the form
    getFormData: function (form) {
        var fields;
        if (typeof form == 'string')
            fields = $(form).serializeArray();
        else
            fields = form.serializeArray();

        if (fields.length == 0)
            return;
        else {
            var formData = {};
            $.each(fields, function (i, field) {
                formData[field.name] = field.value;
            });
            return formData;
        }
    },
    getDataStore: function () {
        if (typeof this.dataStore != 'undefined')
            return ESRGC.getStore(this.dataStore);
        else
            return null;
    },
    getRef: function (name) {
        if (typeof this.refs[name] != 'undefined')
            return this.refs[name];
    },
    refs: {},
    control: {},
    CLASSNAME: 'ESRGC.Controller.Base'
}, ESRGC.Component);