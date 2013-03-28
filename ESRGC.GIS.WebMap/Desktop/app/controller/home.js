/*
Author: Tu Hoang
ESRGC 2012

Desktop browser

Controller
home.js
home controller 
control events on home page

options: 
refs: object contains of references 
control: object of handlers

*/

ESRGC.Controller.Home = ESRGC.Class({
    name: 'Home',
    refs: {
        mapButton: 'a[href="#gotoMap"]',
        mapTab: '#navigationTab a[href="#mapTab"]',
        contractButton: 'a[href="#gotoContract"]',
        contractTab: '#navigationTab a[href="#contractTab"]',
        drawingButton: 'a[href="#gotoDrawing"]',
        drawingTab: '#navigationTab a[href="#drawingTab"]',
        signInForm: 'form#signInForm',
        signInContainer: 'div#signInFrmContainer',
        signInFormInput: 'form#signInForm input',
        signOutButton: '#signOutBtn'
    },
    control: {
        mapButton: {
            click: 'onMapButtonClick'
        },
        contractButton: {
            click: 'onContractButtonClick'
        },
        drawingButton: {
            click: 'onDrawingButtonClick'
        },
        signInForm: {
            submit: 'onSignInFormSubmit'
        },
        signInFormInput: {
            change: 'onSignInFormInputChange'
        },
        signOutButton: {
            click: 'onSignOutBtnClick'
        }
    },
    init: function () {
        var accountStore = ESRGC.getStore('Account');
        if (typeof accountStore != 'undefined') {
            accountStore.on('load', this.onLoginStoreLoad);
        }
    },
    //store events
    onLoginStoreLoad: function (store, data) {
        log('login completed');
        var scope = ESRGC.getController('Home');
        var app = ESRGC.getApp();
        var signInContainer = scope.getSignInContainer();
        signInContainer.html(data);
        var inputs = scope.getSignInFormInput();
        //restore username if error occurs
        inputs.filter('#username').val(store.getParams().username);        
    },
    //controller events
    onMapButtonClick: function (event, object) {
        event.preventDefault();
        this.getMapTab().tab('show'); //open map tab
    },
    onContractButtonClick: function (event, object) {
        event.preventDefault();
        this.getContractTab().tab('show'); //open contract tab
    },
    onDrawingButtonClick: function (event, object) {
        log('drawing tab button clicked');
        event.preventDefault();
        this.getDrawingTab().tab('show'); //open drawing tab
    },
    onSignOutBtnClick: function (event, object) {
        event.preventDefault();
        var url = $(object).attr('href');
        log('signing out..' + url);
        var accountStore = ESRGC.getStore('Account');
        accountStore.loadContentUrl(url);
    },
    onSignInFormSubmit: function (event, object) {
        event.preventDefault();
        log('submitting signIn form');
        var scope = this; //controller scope
        var form = scope.getSignInForm();
        var loginInfo = scope.getFormData(form);
        //remove previous warning messages
        form.find('.control-group .controls span').remove();
        log('login data');
        log(loginInfo);
        //extract this block to helper function
        //used to validate all the fields and add validation message
        //required rule only
        for (var i in loginInfo) {
            var field = loginInfo[i];
            //validate empty fields
            if (field == '' && typeof field == 'string') {
                var group = form.find('.control-group.' + i);
                var warningLabel = $(document.createElement('span'));
                warningLabel.addClass('help-inline');
                warningLabel.text('Please enter ' + i);
                group.addClass('error');
                group.find('.controls').append(warningLabel);
                return;
            }
            else {
                var group = form.find('.control-group.' + i);
                group.removeClass('error');
                group.find('.controls span').remove();
            }
        }
        form.find('button[type="submit"]').button('loading');
        var accountStore = ESRGC.getStore('Account');
        accountStore.setParams(loginInfo);
        accountStore.loadContent('post');
    },
    onSignInFormInputChange: function (event, object) {
        log('input change event');
        var scope = this;
        var field = $(object).val();
        //validate empty fields
        if (field != '' && typeof field == 'string') {
            var group = $(object).parents('.control-group');
            group.removeClass('error');
            group.find('.controls span').remove();
        }
    }
}, ESRGC.Controller.Base);