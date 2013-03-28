/*
Author: Tu Hoang
ESRGC 2012

Desktop browser

mdImapGeocoder.js
geocode addresses using MD iMap Geocoding engine
used to load data from server using AJAX
(implemented based on JQuery)

options:
url: url used to send request
params: {object} contains parameters for request
model: {string} model type that used to store data
dataRoot: {string} root of data structure to parse data -- to be implemented
required: Jquery
//http://mdimap.towson.edu/ArcGIS/rest/services/GeocodeServices/MD.State.MDStatewideLocator/GeocodeServer/findAddressCandidates?&outFields=&f=pjson

this class uses raw data therefore no model was specified
*/

ESRGC.Store.MdImapGeocoder = ESRGC.Class({
    name: 'MdImapGeocoder',
    //jsonp url
    url: 'http://mdimap.towson.edu/ArcGIS/rest/services/GeocodeServices/MD.State.MDStatewideLocator/GeocodeServer/findAddressCandidates',
    autoLoad: false,
    params: {
        street: '',
        zone: ''
    },
    dataRoot: 'candidates',//root of response data to parse from
    type: 'jsonp'
}, ESRGC.Store.Base);
