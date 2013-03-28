/*
Author: Tu Hoang
ESRGC 2012

Desktop browser

Controller
drawing.js
drawing controller 
control events on drawing tab

options: 
refs: object contains of references 
control: object of handlers

*/

ESRGC.Controller.Drawing = ESRGC.Class({
    name: 'Drawing',
    PAPER_MARGIN: {
        top: 75, //.25 in
        bottom: 450, //1 in
        left: 75, //.25 in
        right: 75, //.25 in
        dpi: 300,
        //get margin in inches
        getMarginTop: function () { return this.top / this.dpi; },
        getMarginBottom: function () { return this.bottom / this.dpi; },
        getMarginLeft: function () { return this.left / this.dpi; },
        getMarginRight: function () { return this.right / this.dpi; }
    }, //in 300 dpi
    PORTRAIT_LETTER_SIZE: {
        width: 2550,
        height: 3300
    },
    LANDSCAPE_LETTER_SIZE: {
        width: 3300,
        height: 2550
    },
    ASPECT_RATIO: {
        //return ratio string e.g. '11:8.5'
        getLandscapeRatio: function () {
            var scope = ESRGC.getController('Drawing');
            var size = scope.getLandscapePaperSize();
            log(size);
            log('ratio: ' + size.width / size.height);
            return size.width.toString() + ':' + size.height.toString();
        },
        //return ratio string e.g. '8.5:11'
        getPortraitRatio: function () {
            var scope = ESRGC.getController('Drawing');
            var size = scope.getPortraitPaperSize();
            log(size);
            log('ratio: ' + size.width / size.height);
            return size.width.toString() + ':' + size.height.toString();
        }
    },
    refs: {
        drawingTabLink: '#navigationTab a[href="#drawingTab"]',
        openDrawingButtons: 'button[name="openDrawing"]',
        drawingContainer: '#drawingContainer',
        drwImageViewer: 'div .iviewer',
        drawingTab: '#drawingContent',
        ajaxLoader: '#ajaxLoadingHtml',
        imageUrl: '#imageUrl',
        editDrawingBtn: 'button[name="editDrawing"]',
        drawingImageElement: '.iviewer img',
        selectAreaButton: 'button[name="selectArea"]',
        orientationButtons: 'button[name="orientation"]',
        printButtons: 'button[name="printTool"]',
        selectModeButtons: 'button[name="selectMode"]',
        drwToolbarButtons: '#drawingToolbar a'
    },
    control: {
        openDrawingButtons: {
            click: 'onOpenDrawingBtnClick'
        },
        editDrawingBtn: {
            click: 'onEditDrwBtnClick'
        },
        drwImageViewer: {
            ivieweronfinishload: 'onIviewerFinishLoad',
            ivieweronafterzoom: 'onIviewerAfterZoom'
        },
        selectAreaButton: {
            click: 'onSelectBtnClick'
        },
        orientationButtons: {
            click: 'onOrientationBtnClick'
        },
        printButtons: {
            click: 'onPrintBtnClick'
        },
        selectModeButtons: {
            click: 'onSelectModeBtnClick'
        },
        drawingToolbar: {
            load: 'onDrawingToolbarLoad'
        }
    },
    init: function () {
        //load drawing store
        var drawingStore = ESRGC.getStore('DrawingById');
        if (drawingStore) {
            drawingStore.on('beforeLoad', this.onDrwBeforeLoad);
            drawingStore.on('load', this.onDrwStoreLoad);
        }
    },
    //Store events
    onDrwBeforeLoad: function (store) {
        var scope = ESRGC.getController('Drawing');
        var drawingTab = scope.getDrawingTab();
        //show loading image to indicate the page is loading
        var loadingHtml = ESRGC.AjaxLoader.getLoadingHtml('resources/images/ajax-loader-fb.gif');
        drawingTab.html(loadingHtml);
    },
    onDrwStoreLoad: function (store, data) {
        var scope = ESRGC.getController('Drawing');
        var drawingTab = scope.getDrawingTab();
        //populate loaded content
        drawingTab.hide();
        drawingTab.empty();
        drawingTab.html(data);
        drawingTab.fadeIn();

        //after content is loaded it's safe to get 
        //the element drawingContainer
        var drawingContainer = scope.getDrawingContainer();
        var loadingHtml = ESRGC.AjaxLoader.getLoadingHtml('resources/images/ajax-loader-fb.gif');
        //insert loader for drawing image to load
        drawingContainer.html(loadingHtml);
        //create and initialize viewer
        var drwViewer = $(document.createElement('div'));
        //add iviewer class for iviewer plug-in
        drwViewer.addClass('iviewer');
        drawingContainer.append(drwViewer); //add to container
        //create viewer
        drwViewer.iviewer({
            src: scope.getImageUrl().val(),
            zoom: 'fit',
            zoom_min: 10,
            zoom_max: 100
        });
    },
    //Controller events    
    onOpenDrawingBtnClick: function (event, object) {
        var scope = this;
        event.preventDefault(); //return false to prevent page reload
        var drawingId = object.value;
        //update visual queue. 
        //set disabled button to be normal
        scope.getOpenDrawingButtons().removeClass('disabled');
        scope.getOpenDrawingButtons().text('Open');
        //change button state to disabled to indicate the drawing is alreadyopened
        $(object).text('Opened');
        $(object).addClass('disabled');
        log('open Drawing click! id: ' + object.value);
        //store id in AppData
        ESRGC.getApp().appData.openedDrawingId = object.value;
        var drawingStore = ESRGC.getStore('DrawingById');
        drawingStore.setParams({ id: drawingId });
        //initiate loading content
        drawingStore.loadContent();
        scope.getDrawingTabLink().tab('show');
    },
    onIviewerFinishLoad: function (event, object) {
        var scope = this;
        var drawingContainer = scope.getDrawingContainer();
        //remove loading image
        drawingContainer.children().first().remove();

        //image area select
        var appData = ESRGC.getApp().appData;
        var areaSelectInstance = appData.imgAreaSelectInstance;
        if (typeof areaSelectInstance != 'undefined') {
            areaSelectInstance.setOptions({
                remove: true
            });
            areaSelectInstance.update();
        }
        var initialImageScale = scope.calculateImageScale();
        var portraitPaperSize = scope.getPortraitPaperSize();
        //initialize area select with initial settings
        areaSelectInstance = $('.iviewer img').imgAreaSelect({
            parent: scope.getDrwImageViewer(),
            fadeSpeed: 300,
            instance: true,
            disable: true,
            handles: true,
            persistent: true,
            aspectRatio: scope.ASPECT_RATIO.getPortraitRatio(), //portrait ratio
            maxWidth: portraitPaperSize.width * initialImageScale.scaleX,
            maxHeight: portraitPaperSize.height * initialImageScale.scaleY,
            minWidth: portraitPaperSize.width * initialImageScale.scaleX,
            minHeight: portraitPaperSize.height * initialImageScale.scaleY,
            onInit: function (img, selection) {
                log('ImageAreaSelect initialized');
                appData.imgAreaSelectInitialized = true;
            },
            onSelectEnd: function (img, selection) {
                scope.preparePrintData(selection);
            }
        });
        //store in appdata
        ESRGC.getApp().appData.imgAreaSelectInstance = areaSelectInstance;
        //enable select button
        scope.getSelectAreaButton().removeClass('disabled');
        delete appData.drawingSelectionData;
        log('Engineer drawing image loaded.');
    },
    onIviewerAfterZoom: function (event, object) {
        var scope = this;
        if (scope.getSelectAreaButton().hasClass('active')) {
            scope.updateSelectionMode();
            //set 1to1 selection if active
            scope.set1to1Selection();
        }
    },
    onSelectBtnClick: function (event, object) {
        if ($(object).hasClass('disabled'))
            return;
        var appData = ESRGC.getApp().appData;
        var scope = this;
        //check button state
        if ($(object).hasClass('active')) {
            log('Select area activated');
            appData.imgAreaSelectInstance.setOptions({
                disable: false
            });
            scope.getOrientationButtons().removeClass('disabled');
            scope.getSelectModeButtons().removeClass('disabled');
            //check select mode
            var selectMode = scope.getSelectModeButtons().filter('.active').val();
            if (selectMode == '1to1') {
                //zoom to fit the image (for visual purpose);
                //scope.getDrwImageViewer().iviewer('fit');
                scope.set1to1Selection();
            }
        }
        else {
            log('Select area deactivated');
            //hide selection on the print image
            if (typeof appData.imgAreaSelectInstance != 'undefined') {
                appData.imgAreaSelectInstance.cancelSelection();
                appData.imgAreaSelectInstance.setOptions({
                    disable: true
                });
                appData.imgAreaSelectInstance.update();
                scope.getPrintButtons().addClass('disabled');
                scope.getOrientationButtons().addClass('disabled');
                scope.getSelectModeButtons().addClass('disabled');
            }
        }
    },
    onOrientationBtnClick: function (event, object) {
        if ($(object).hasClass('disabled'))
            return;
        var appData = ESRGC.getApp().appData;
        var scope = this;
        //delete previous selection if 1:1 mode is active
        var mode = scope.getSelectModeButtons().filter('.active').val();
        if (mode == '1to1')
            delete appData.drawingSelectionData;
        var orientation = $(object).val();
        //don't update img area select if instance is not defined
        if (!appData.imgAreaSelectInitialized)
            return;
        //update aspect ratio
        if (orientation == 'portrait') {
            log('portrait orientation selected');
            appData.imgAreaSelectInstance.setOptions({
                aspectRatio: scope.ASPECT_RATIO.getPortraitRatio()
            });
            appData.imgAreaSelectInstance.update();
        }
        else {
            log('landscape orientation selected');
            appData.imgAreaSelectInstance.setOptions({
                aspectRatio: scope.ASPECT_RATIO.getLandscapeRatio()
            });
            appData.imgAreaSelectInstance.update();
        }
        //update selection mode
        scope.updateSelectionMode();
        //set selection if 1to1 mode is active
        scope.set1to1Selection();
    },
    onPrintBtnClick: function (event, object) {
        if ($(object).hasClass('disabled'))
            return;
        var scope = this; //this controller
        var printType = $(object).val();
        log('print format: ' + printType);
        //get print data
        var appData = ESRGC.getApp().appData;
        var printData = appData.drawingSelectionData;
        //add margin data
        printData.marginTop = scope.PAPER_MARGIN.getMarginTop();
        printData.marginBottom = scope.PAPER_MARGIN.getMarginBottom();
        printData.marginLeft = scope.PAPER_MARGIN.getMarginLeft();
        printData.marginRight = scope.PAPER_MARGIN.getMarginRight();
        //select mode
        printData.mode = scope.getSelectModeButtons().filter('.active').val();
        //check current selection
        var currentSelection = appData.imgAreaSelectInstance.getSelection();
        if (currentSelection.width == 0 && currentSelection.height == 0) {
            alert("Please select an area on the image!");
            return;
        }
        if (typeof printData == 'undefined') {
            return;
        }
        var printStore = ESRGC.getStore('PartialDrawing');
        switch (printType) {
            case 'pdf':
                printData.download = true;
                printData.format = 'pdf';
                printStore.setParams(printData);
                log(printData);
                //build request url
                var url = printStore.constructParams();
                log(url);
                window.location.href = url;
                break;
            case 'viewPdf':
                printData.download = false;
                printData.format = 'pdf';
                printStore.setParams(printData);
                log(printData);
                //build request url
                var url = printStore.constructParams();
                log(url);
                window.open(url);
                break;
            case 'print':
                //change button state
                var printButton = $(object);
                printButton.button('loading');
                //remove previous iframe if exists, created by jqprint
                $('iframe').remove();
                //set up print data
                printData.download = false;
                printData.format = 'png';
                printStore.setParams(printData);
                log(printData);
                //build request url
                var url = printStore.constructParams();
                log(url);
                //create container
                //                var printContainer = $(document.createElement('div'));
                //                printContainer.addClass('printContainer');
                //                //create print image
                //                var printImage = $(document.createElement('img'));
                //                //assign load call back to print
                //                printImage.on('load', function (event, object) {
                //                    log('event "onPrintImageLoad": image loaded. Waiting for printing...');
                //                    $(this).parent().jqprint({});
                //                    printButton.button('reset'); //reset print button to normal state
                //                });
                //                printContainer.append(printImage); //add to container
                //                printImage.attr('src', url); //set source to load image
                //                log(printContainer);
                break;
        }

    },
    onSelectModeBtnClick: function (event, object) {
        if ($(object).hasClass('disabled'))
            return;
        var scope = this;
        var buttonVal = $(object).val();
        log(buttonVal + ' mode selected');
        scope.updateSelectionMode();
        if (buttonVal == '1to1') {
            //delete previous selection if 1to1 is selected
            //only maintaining 1to1 selection data
            delete ESRGC.getApp().appData.drawingSelectionData;
            //zoom to fit the image (for visual purpose);
            scope.getDrwImageViewer().iviewer('fit');
        }
    },
    onEditDrwBtnClick: function (event, object) {
        alert('editing mode will be available');
    },
    //helper functions
    //calculate scaleX and scaleY based on the current state of the viewer
    //if size is passed in it will be considered the current displayed size
    calculateImageScale: function (size) {
        var scope = this;
        var imageViewer = scope.getDrwImageViewer(); //get jquery reference to the object
        var imgOrgWidth = imageViewer.iviewer('info', 'orig_width', true);
        var imgOrgHeight = imageViewer.iviewer('info', 'orig_height', true);
        var imgDisplayWidth = imageViewer.iviewer('info', 'display_width', true);
        var imgDisplayHeight = imageViewer.iviewer('info', 'display_height', true);
        var scales = null;
        if (typeof size == 'undefined') {
            scales = {
                scaleX: imgDisplayWidth / imgOrgWidth,
                scaleY: imgDisplayHeight / imgOrgHeight,
                centerX: imgDisplayWidth / 2,
                centerY: imgDisplayHeight / 2
            };
        }
        else {
            scales = {
                scaleX: size.width / imgOrgWidth,
                scaleY: size.height / imgOrgHeight,
                centerX: size.width / 2,
                centerY: size.height / 2
            };
        }
        return scales;
    },
    //update the selection mode based on current select and orientation settings
    updateSelectionMode: function () {
        var scope = this;
        var appData = ESRGC.getApp().appData;
        //recalculate max and min size for selection if mode is 1:1 scale
        var selectMode = scope.getSelectModeButtons().filter('.active').val();
        if (appData.imgAreaSelectInitialized) {
            var areaSelect = appData.imgAreaSelectInstance;
            if (selectMode == '1to1') {
                //update after zooming to make the gray area fit the image
                var initialImageScale = scope.calculateImageScale();
                var currentOrientation = scope.getOrientationButtons().filter('.active').val();
                if (currentOrientation == 'portrait') {
                    var portraitPaperSize = scope.getPortraitPaperSize();
                    areaSelect.setOptions({
                        maxWidth: portraitPaperSize.width * initialImageScale.scaleX,
                        maxHeight: portraitPaperSize.height * initialImageScale.scaleY,
                        minWidth: portraitPaperSize.width * initialImageScale.scaleX,
                        minHeight: portraitPaperSize.height * initialImageScale.scaleY,
                        persistent: true
                    });
                }
                else if (currentOrientation == 'landscape') {//landscape
                    var landscapePaperSize = scope.getLandscapePaperSize();
                    areaSelect.setOptions({
                        maxWidth: landscapePaperSize.width * initialImageScale.scaleX,
                        maxHeight: landscapePaperSize.height * initialImageScale.scaleY,
                        minWidth: landscapePaperSize.width * initialImageScale.scaleX,
                        minHeight: landscapePaperSize.height * initialImageScale.scaleY,
                        persistent: true
                    });
                }
            }
            else if (selectMode == 'fit') {//fit to page mode
                //free select mode
                areaSelect.setOptions({
                    minWidth: 0,
                    minHeight: 0,
                    maxWidth: null,
                    maxHeight: null,
                    persistent: false
                });
                log(areaSelect.getOptions());
            }
            areaSelect.cancelSelection();
        }
    },
    set1to1Selection: function () {
        var scope = this;
        var appData = ESRGC.getApp().appData;
        if (appData.imgAreaSelectInitialized) {
            //if selection is active
            if (scope.getSelectAreaButton().hasClass('active')) {
                var areaSelect = appData.imgAreaSelectInstance;
                var selectMode = scope.getSelectModeButtons().filter('.active').val();
                if (selectMode == '1to1') {
                    //set options
                    areaSelect.setOptions({
                        show: true
                    });
                    var previousSelection = appData.drawingSelectionData;
                    //update after zooming to make the gray area fit the image
                    var imageInfo = scope.calculateImageScale();

                    //check for previous selection
                    if (typeof previousSelection != 'undefined') {
                        var preImageInfo = scope.calculateImageScale({
                            width: previousSelection.scaledW,
                            height: previousSelection.scaledH
                        });

                        //calculate selection in original scale (real pixel size)
                        var orgSelX, orgSelY, orgSelW, orgSelH;
                        orgSelX = previousSelection.x / preImageInfo.scaleX;
                        orgSelY = previousSelection.y / preImageInfo.scaleY;
                        orgSelW = previousSelection.selW / preImageInfo.scaleX;
                        orgSelH = previousSelection.selH / preImageInfo.scaleY;

                        //calculate previous selection in the current scale
                        var x1 = orgSelX * imageInfo.scaleX;
                        var x2 = x1 + (orgSelW * imageInfo.scaleX)
                        var y1 = orgSelY * imageInfo.scaleY;
                        var y2 = y1 + (orgSelH * imageInfo.scaleY);

                        areaSelect.setSelection(x1, y1, x2, y2);
                    }
                    else {//new selection at the center
                        var selectionWidth, selectionHeight;
                        var currentOrientation = scope.getOrientationButtons().filter('.active').val();
                        //calculate width and heigh based on page orientation
                        if (currentOrientation == 'portrait') {
                            var portraitPaperSize = scope.getPortraitPaperSize();
                            selectionWidth = portraitPaperSize.width * imageInfo.scaleX;
                            selectionHeight = portraitPaperSize.height * imageInfo.scaleY;
                        }
                        else {
                            var landscapePaperSize = scope.getLandscapePaperSize();
                            selectionWidth = landscapePaperSize.width * imageInfo.scaleX;
                            selectionHeight = landscapePaperSize.height * imageInfo.scaleY;
                        }
                        areaSelect.setSelection(
                            imageInfo.centerX - selectionWidth / 2, //top left x1
                            imageInfo.centerY - selectionHeight / 2, //top left y1
                            imageInfo.centerX + selectionWidth / 2, //bottom right x2
                            imageInfo.centerY + selectionHeight / 2//bottom right y2
                        );
                    }
                    areaSelect.update();
                    scope.preparePrintData(areaSelect.getSelection());
                }
            }
        }
    },
    preparePrintData: function (selection) {
        var scope = this;
        var appData = ESRGC.getApp().appData;
        var imageViewer = scope.getDrwImageViewer(); //get jquery reference to the viewer object
        //get image displayed dimension
        var imgDisplayWidth = imageViewer.iviewer('info', 'display_width', true);
        var imgDisplayHeight = imageViewer.iviewer('info', 'display_height', true);
        appData.drawingSelectionData = {
            id: appData.openedDrawingId,
            x: selection.x1,
            y: selection.y1,
            selW: selection.width,
            selH: selection.height,
            scaledW: imgDisplayWidth,
            scaledH: imgDisplayHeight,
            orientation: scope.getOrientationButtons().filter('.active').val()
        };
        log(selection);
        log('w: ' + imgDisplayWidth + ', h: ' + imgDisplayHeight);
        //activate print buttons
        scope.getPrintButtons().removeClass('disabled');
    },
    getPortraitPaperSize: function () {
        return {
            width: this.PORTRAIT_LETTER_SIZE.width -
                (this.PAPER_MARGIN.left + this.PAPER_MARGIN.right), //- left right margins
            height: this.PORTRAIT_LETTER_SIZE.height -
                (this.PAPER_MARGIN.top + this.PAPER_MARGIN.bottom)//- top bottom margin
        };
    },
    getLandscapePaperSize: function () {
        return {
            width: this.LANDSCAPE_LETTER_SIZE.width -
                (this.PAPER_MARGIN.left + this.PAPER_MARGIN.right), //- left right margins, //- left right margins
            height: this.LANDSCAPE_LETTER_SIZE.height -
                (this.PAPER_MARGIN.top + this.PAPER_MARGIN.bottom)//- top bottom margin
        };
    }

}, ESRGC.Controller.Base);