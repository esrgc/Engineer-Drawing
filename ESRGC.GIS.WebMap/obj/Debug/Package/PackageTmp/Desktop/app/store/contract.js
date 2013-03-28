/*
Author: Tu Hoang
ESRGC 2012
Salisbury 

Desktop Browser

Store
contractById.js
Store that handles the loading of contracts and associated drawings detail by Id

*/

ESRGC.Store.Contract = ESRGC.Class({
    name: 'Contract',
    model: 'Contract', //ESRGC.Model.Contract
    url: '../Contract/Contract',
    params: {
    }
}, ESRGC.Store.Base);