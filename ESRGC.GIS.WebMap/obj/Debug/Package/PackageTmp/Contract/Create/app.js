/*
Author: Tu Hoang
ESRGC 2012

app.js Contact create 

includes the map that allows contract polygon editing for creating new contract
*/

ESRGC.App = ESRGC.Class({
    name: "SbyContractCreate",
    controllers: ['Map', 'Contract'],
    views: [],
    stores: ['MdImapGeocoder'],
    initialize: function (options) {
        ESRGC.Application.prototype.initialize.call(this, arguments);
    }
}, ESRGC.Application);