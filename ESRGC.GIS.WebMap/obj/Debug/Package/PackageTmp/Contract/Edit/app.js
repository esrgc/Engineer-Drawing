/*
Author: Tu Hoang
ESRGC 2012

app.js Contact edit

include controls for the map that shows contract area
*/

ESRGC.App = ESRGC.Class({
    name: "SbyContractEdit",
    controllers: ['Map', 'Contract'],
    views: [],
    stores: ['MdImapGeocoder'],
    initialize: function (options) {
        ESRGC.Application.prototype.initialize.call(this, arguments);
    }
}, ESRGC.Application);