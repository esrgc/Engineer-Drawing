/*
Author: Tu Hoang
ESRGC 2012

Desktop Browser

Controller
Contract.js
controller handles loading contract polygons

*/

ESRGC.Controller.Contract = ESRGC.Class({
    name: 'Contract',
    refs: {
        contractResult: '#contractResult',
        infoSection: '#contractAccordion',
        contractTabLink: '#navigationTab a[href="#contractTab"]',
        contractTab: '#contractContent', //contract tab containing contract details
        contractDiv: 'div .dataItem', //contract data divs
        drawingListPageNav: '.drawingPageIndex a',
        pageSizeSelector: '.pageSizeSelect',
        currentPageNumber: '#currentPageNumber', //hidden field contains current page number
        currentContractId: '#currentContractId', //hidden field contains contract id
        resultAccordionLink: '#accDataResult',
        contractSearchForm: 'form#contract-search', //contract search form on contract tab
        homeCntrSearchForm: 'form#home-contract-search', //contract search form on home tab
        dynamicContentDiv: '.resultContent#contract'
    },
    control: {
        contractDiv: {
            click: 'onContractDivClick'
        },
        drawingListPageNav: {
            click: 'onPagedListNavClick'
        },
        pageSizeSelector: {
            change: 'onPageSizeChange'
        },
        contractSearchForm: {
            submit: 'onContractSearchSubmit'
        },
        homeCntrSearchForm: {
            submit: 'onHomeCntrSearchSubmit'
        }
    },
    init: function () {
        var scope = this;
        var app = ESRGC.getApp();
        var mapViewer = ESRGC.getMapViewer();
        //wire info click event
        //mapViewer.on('onInfoToolClick', this.onInfoToolClick);

        var contractPolyStore = ESRGC.getStore('ContractPolygon');
        var contractStore = ESRGC.getStore('ContractByGeom');
        var contractByIdStore = ESRGC.getStore('Contract');
        //var contractByNumber = ESRGC.getStore('ContractByNumber');
        //wire store events
        if (contractPolyStore) {
            contractPolyStore.on('beforeLoad', this.onBeforeContractPolyLoad);
            contractPolyStore.on('load', this.onContractPolyLoad);
        }
        if (contractStore) {
            contractStore.on('beforeLoad', this.onBeforeContractStoreLoad);
            contractStore.on('load', this.onContractStoreLoad);
        }
        if (contractByIdStore) {
            contractByIdStore.on('beforeLoad', this.onBeforeContractIdLoad);
            contractByIdStore.on('load', this.onContractIdLoad);
        }
        //        if (contractByNumber) {
        //            contractByNumber.on('beforeLoad', this.onBeforeContractNumLoad);
        //            contractByNumber.on('load', this.onContractNumLoad);
        //        }

    },
    onPageSizeChange: function (event, object) {
        var scope = this;
        var pageSize = event.target.value;
        var pageNumber = scope.getCurrentPageNumber().val();
        log('changing page size..' + pageSize);
        var contractByIdStore = ESRGC.getStore('Contract');
        contractByIdStore.setParams({
            id: scope.getCurrentContractId().val(),
            pageSize: pageSize,
            pageNumber: pageNumber
        });
        contractByIdStore.loadContent(); //reload contract tab
    },
    onPagedListNavClick: function (event, object) {
        event.preventDefault();
        var contractByIdStore = ESRGC.getStore('Contract');
        var url = $(object).attr("href");
        log(url);
        contractByIdStore.loadContentUrl(url);
    },
    onContractDivClick: function (event, object) {
        // log(event);
        var scope = this;
        var contractByIdStore = ESRGC.getStore('Contract');
        var contractId = $(object).find('input[type="hidden"]').val();

        log('contract Id: ' + contractId);
        contractByIdStore.setParams({ id: contractId });
        contractByIdStore.loadContent();
        //show contract content tab
        scope.getContractTabLink().tab('show');
    },
    onContractSearchSubmit: function (event, object) {
        event.preventDefault(); //prevent submit and use ajax
        var scope = this;
        var contractByNumStore = ESRGC.getStore('Contract');
        var form = scope.getContractSearchForm();
        var searchData = scope.getFormData(form);
        //validate input
        if (searchData.contractNum == '') {
            form.find('.control-group').addClass('error');
            return;
        }
        log('searching for: ' + searchData.contractNum);
        //add current id to search data for error handling
        searchData.currentId = scope.getCurrentContractId().val();
        contractByNumStore.setParams(searchData);
        contractByNumStore.loadContent('post');
    },
    onHomeCntrSearchSubmit: function (event, object) {
        event.preventDefault(); //prevent submit and use ajax
        var scope = this;
        var contractByNumStore = ESRGC.getStore('Contract');
        var form = scope.getHomeCntrSearchForm();
        var searchData = scope.getFormData(form);
        //validate input
        if (searchData.contractNum == '') {
            form.find('.control-group').addClass('error');
            return;
        }
        else
            form.find('.control-group').removeClass('error');

        log('searching for: ' + searchData.contractNum);
        //add current id to search data for error handling
        contractByNumStore.setParams(searchData);
        contractByNumStore.loadContent('post');
        //show contract content tab if not currently shown
        scope.getContractTabLink().tab('show');
    },
    /*Store events*/
    //before contract search by number event
    onBeforeContractNumLoad: function (store) {
        var scope = ESRGC.getController('Contract');
        var searchForm = scope.getContractSearchForm();
        //insert ajax loader image
        var loadingHtml = ESRGC.AjaxLoader.getLoadingHtml('resources/images/ajax-loader-fb.gif');
        //insert using jequery
        searchForm.before(loadingHtml);
    },
    //after contract search by number event
    onContractNumLoad: function (store, data) {
        var scope = ESRGC.getController('Contract');
        //replace old content with new content
        scope.getDynamicContentDiv().replaceWith(data);
    },
    onBeforeContractIdLoad: function (store) {
        var scope = ESRGC.getController('Contract');
        var contractTab = scope.getContractTab();
        //insert ajax loader image
        var loadingHtml = ESRGC.AjaxLoader.getLoadingHtml('resources/images/ajax-loader-fb.gif');
        contractTab.html(loadingHtml);
    },
    onContractIdLoad: function (store, data) {
        var scope = ESRGC.getController('Contract');
        var contractTab = scope.getContractTab();
        contractTab.hide();
        contractTab.empty();
        contractTab.html(data);
        contractTab.fadeIn();
    },
    onBeforeContractPolyLoad: function (store) {
        ESRGC.AjaxLoader.onLoadStart();
        ESRGC.updateStatusMessage('Loading contract polygons');
        log('loading contract polygons');
    },
    onContractPolyLoad: function (store, data) {
        var mapViewer = ESRGC.getMapViewer();
        var scope = ESRGC.getController('Contract');
        var app = ESRGC.getApp();
        var mapViewer = ESRGC.getMapViewer();
        if (data.length == 0) {
            log('OnContractPolyLoad: no data returned.');
            return;
        }
        //        log('data for contract polygon');
        //        log(data);
        var vectorLayer = scope.getContractVectorLayer();
        //add data to layer
        mapViewer.addJsonDataToVectorLayer(vectorLayer, data);
        mapViewer.zoomToDataExtent(vectorLayer);
        mapViewer.zoomIn();
        ESRGC.AjaxLoader.onLoadEnd();
        ESRGC.updateStatusMessage('Ready');
    },
    onBeforeContractStoreLoad: function (store) {
        store.setParams(ESRGC.getApp().appData.currentSearchParams);
        ESRGC.AjaxLoader.onLoadStart();
        ESRGC.updateStatusMessage('Searching for contracts...');
    },
    onContractStoreLoad: function (store, data) {
        var scope = ESRGC.getController('Contract');
        //log(data);
        var html = '';
        var resultDivRef = scope.getRef('contractResult');
        $(resultDivRef).empty(); //clear current content
        var dataCount = data.length ? data.length : 0;
        //update data tab title
        var titleHtml =
                '<i class="icon-list"></i> Data <span class="badge badge-success">' + dataCount + '</span>';
        scope.getResultAccordionLink().html(titleHtml);
        if (data.length == 0) {
            html = '<span>No contract found at this location.</span>';
        }
        else {
            html = '';
            $.each(store.getData(), function (i, dataItem) {
                var type = '';
                if (dataItem.Sanitary.valueOf())
                    type = '(Sanitary)';
                else if (dataItem.Water.valueOf())
                    type = '(Water)';
                else if (dataItem.StormWater.valueOf())
                    type = '(Storm Water)';
                var divItem = [
                    '<div class="dataItem">',
                    '<input type="hidden" value="' + dataItem.ContractId + '">',
                    '<button class="btn btn-info contractBtn">',
                        '<span>No. ' + dataItem.ContractNum + '</span>',
                        '<span> ' + type + '</span>',
                        '<br/><span> Status: ' + dataItem.Status + '</span>',
                    '</button>\n',
                    '</div>'
                    ].join('');
                html += divItem;
            });
        }
        $(resultDivRef).append(html);

        ESRGC.AjaxLoader.onLoadEnd();
        ESRGC.updateStatusMessage(data.length + ' contract(s) found.')
    },
    onFeatureSelect: function (e) {
        var scope = this;
        var feature = e.feature;
        //log(feature);
        //generate report for info window
        //        var html = scope.generateReport(feature.attributes);
        //        $(scope.getRef('reportContent')).html(html);
        //        //open info window
        //        $(scope.getRef('infoWindow')).dialog('open');
        //        ESRGC.updateStatusMessage('Feature selected.');
    },
    onFeatureUnselect: function (e) {
        var controller = this;
        //        $(controller.getRef('infoWindow')).dialog('close');
        //        ESRGC.updateStatusMessage('Feature unselected.');
    },
    //create property search vector layer and store in app data if does not exist
    getContractVectorLayer: function () {
        var app = ESRGC.getApp();
        var mapViewer = ESRGC.getMapViewer();

        var contractVectorLayer = app.appData.contractVectorLayer;
        if (typeof contractVectorLayer == 'undefined') {
            contractVectorLayer = mapViewer.createDefaultVectorLayer({
                name: 'ContractPolygon',
                scope: this, //controller scope
                featureSelect: this.onFeatureSelect,
                featureUnselect: this.onFeatureUnselect,
                style: {
                    strokeWidth: 0,
                    strokeOpacity: 0.5,
                    strokeColor: "lime",
                    fillColor: "purple",
                    fillOpacity: .5
                },
                styleSelect: {
                    strokeWidth: 0,
                    strokeOpacity: .5,
                    strokeColor: "blue",
                    fillColor: "yellow",
                    fillOpacity: .5
                }
            });
            //store back to appData
            app.appData.contractVectorLayer = contractVectorLayer;
            //set visibility
            mapViewer.setLayerVisibility(contractVectorLayer, true);
            //mapViewer.setVectorLayers([contractVectorLayer]); //activate select control
        }
        return contractVectorLayer;
    }
}, ESRGC.Controller.Base);