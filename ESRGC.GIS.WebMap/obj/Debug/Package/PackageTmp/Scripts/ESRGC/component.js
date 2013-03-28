/*
Author: Tu Hoang
ESRGC 2012

Desktop browser

component.js
base component
*/

ESRGC.Component = ESRGC.Class({
    on: function (event, handler) {
        if (typeof this.events == 'undefined')
            this.events = {};
        this.events[event] = handler;
    },
    initialize: function (options) {
        extend2(this, options)//copy property options
        if (typeof this.events === 'undefined')
            this.events = {};
    }
}, null);