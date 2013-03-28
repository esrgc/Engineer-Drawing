/*
Author: Tu Hoang
ESRGC 2012
Salisbury 

Desktop Browser

Store
drawingById.js
Store that handles the loading of engineering drawing by id

*/

ESRGC.Store.DrawingById = ESRGC.Class({
    name: 'DrawingById',
    model: 'Drawing',
    url: '../Drawing/Drawing'//e.i. /salisburycity/desktop/drawing/1
    
}, ESRGC.Store.Base);