/*
Author: Tu Hoang
ESRGC 2012

Desktop browser

model.js
base model

options:
fields: {object} contains the fields for the model
*/

ESRGC.Model.Base = ESRGC.Class({
    CLASSNAME: 'ESRGC.Model.Base',
    initialize: function (options) {        
        ESRGC.Component.prototype.initialize.apply(this, arguments);
    },
    fields: {}

}, ESRGC.Component);