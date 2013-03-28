/* 
Author: Tu Hoang

app.js main app 
*/

ESRGC.App = ESRGC.Class({
    name: "SalisburyCity",
    controllers: [
        'Home',
        'Map',
        'Contract',
        'SearchFilter',
        'Drawing'
    ],
    views: ['Home'],
    stores: [
        'ContractPolygon',
        'ContractByGeom',
        'Contract',
        'DrawingById',
        'MdImapGeocoder',
        'PartialDrawing',
        'Account'
    ],
    initialize: function (options) {
        ESRGC.Application.prototype.initialize.call(this, arguments);
    }
}, ESRGC.Application);