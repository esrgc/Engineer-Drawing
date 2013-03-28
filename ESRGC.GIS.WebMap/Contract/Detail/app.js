/*
Author: Tu Hoang
ESRGC 2012

app.js Contact detail

include controls for the map that shows contract area
*/

ESRGC.App = ESRGC.Class({
    name: "SbyContractDetail",
    controllers: ['Map', 'Contract'],
    views: [],
    stores: ['Contract'],
    initialize: function (options) {
        ESRGC.Application.prototype.initialize.call(this, arguments);
    }
}, ESRGC.Application);