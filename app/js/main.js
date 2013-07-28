/*global $:true, console:true*/
(function () {
  'use strict';

})();

function CocsBackground() {
    this.socket = null;
    this.disconnectionReason = 'unexpected';
}

CocsBackground.prototype = {

    // localhost does not work on Linux b/c of http://code.google.com/p/chromium/issues/detail?id=36652,
    // 0.0.0.0 does not work on Windows
    //host: (navigator.appVersion.indexOf('Linux') >= 0 ? '0.0.0.0' : 'localhost'),
    host: '172.17.17.143',

    port: 1984,

    get uri(){
        return 'ws://' + this.host + ':' + this.port + '/websocket';
    },

    alert: function(message) {
        alert(message);
    },

    log: function(message) {
        if (window.console && console.log) {
            console.log('[COCS] ' + message);
        }
    },

    updateHttp: function(data) {
      var name = data.name == null ? data.ip : data.name
      $(".panel-1 .data").prepend("<li><span class='name'>" + name + "</span> accessed <span class='site'>"+ data.host +" </span><span class='time'>" + data.time + "</span></li>");
      $(".panel-1 .data li:last-child").remove();
    },


    updateCitizen: function(data) {
      var name = data.name == null ? data.ip : data.name, site, i;

      $(".panel-4 span.name b").text(name);
      $(".panel-4 span.mac small").text(data.mac);

      for(i = 0; i < data.pages.length; i++) {
        site = data.pages[i]
        $(".panel-4 .data").prepend("<li><span class='site'>"+site[0]+"</span><span class='time'>"+site[1]+"</span></li>");
      }

      $('.panel-4').removeClass('off-left off-right');
      setTimeout(function() {
        $('.panel-4').addClass('off-right');
      }, 5000);

    },

    _onmessage: function(event) {
        var msg = event.data ;
        this.log('event: ' + event);
        this.log('msg: ' + msg);
        var data = JSON.parse(msg);
        this.log(data);

        if(data.type == "http")  {
          this.updateHttp(data);
        }

        if(data.type == "citizen")  {
          this.updateCitizen(data);
        }

    },

    _onclose: function(e) {
        this.log('disconnected from ' + (e.target.URL || e.target.url));
        if (this.disconnectionReason == 'cannot-connect') {
            // this.alert('Cannot connect to server:\n' + this.uri);
        }
        this.onDisconnect();
    },

    _onopen: function(e) {
        this.log('connected to ' + (e.target.URL || e.target.url));
        this.disconnectionReason = 'broken';
    },

    _onerror: function(event) {
        console.warn('error: ', event);
    },

    connect: function() {
        var Socket = window.MozWebSocket || window.WebSocket;
        if (!Socket) {
            if (window.opera) {
                throw 'WebSocket is disabled. To turn it on, open \nopera:config#UserPrefs|EnableWebSockets and check in the checkbox.';
            } else if (navigator.userAgent.indexOf('Firefox/') != -1) {
                throw 'WebSocket is disabled.\nTo turn it on, open about:config and set network.websocket.override-security-block to true.\nhttps://developer.mozilla.org/en/WebSockets';
            }
        }

        if (this.socket) {
            throw 'WebSocket already opened';
        }

        var socket = this.socket = new Socket(this.uri);

        this.disconnectionReason = 'cannot-connect';

        var self = this;
        socket.onopen    = function(e) { return self._onopen(e); };
        socket.onmessage = function(e) { return self._onmessage(e); };
        socket.onclose   = function(e) { return self._onclose(e); };
        socket.onerror   = function(e) { return self._onerror(e); };
    },

    disconnect: function() {
        this.disconnectionReason = 'manual';
        if (this.socket) {
            this.socket.close();
        }
    },

    onDisconnect: function() {
        this.socket = null;
    },

    constructor: CocsBackground
};


var cocs = new CocsBackground();
cocs.connect();


$('.logo').click( function () {
    $('.panel-4').removeClass('off-left off-right');
});

$('.panel-4').click( function () {
    $('.panel-4').addClass('off-right');
});


