/*
Author: Tu Hoang
ESRGC 2012
Salisbury 

Desktop Browser

Store
contractByGeom.js
Store that handles the loading of contracts by geometry

*/

ESRGC.Store.ContractByGeom = ESRGC.Class({
    name: 'ContractByGeom',
    model: 'Contract', //ESRGC.Model.Contract
    url: 'ContractByGeometry',
    params: {
    }
}, ESRGC.Store.Base);