/*
Author: Tu Hoang
ESRGC 2012
Desktop browser

Model: 
Contract 
contract.js
model representing data for contract
*/

ESRGC.Model.Contract = ESRGC.Class({
    CLASSNAME: 'ESRGC.Model.Contract',
    fields: [
        { name: 'ContractId', type: 'int' },
        { name: 'ContractNum', type: 'string' },
        { name: 'StormWater', type: 'boolean' },
        { name: 'Sanitary', type: 'boolean' },
        { name: 'Water', type: 'boolean' },
        { name: 'Status', type: 'int' }
    ]
}, ESRGC.Model.Base);