/*
Author: Tu Hoang
ESRGC 2012

Desktop browser

View
main.js
Home view of the app

required Jquery and Jquery UI
*/

ESRGC.View.Home = ESRGC.Class({
    initialize: function () {
        $('#home-map-btn').tooltip();
        $('form#home-contract-search button[type="submit"]').tooltip();
    }
}, null);