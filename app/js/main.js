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
    host: (navigator.appVersion.indexOf('Linux') >= 0 ? '0.0.0.0' : 'localhost'),
    //host: '172.17.17.143',
    port: 1984,

    get uri(){
      var parser = document.createElement('a');
      parser.href = window.location;

      // parser.protocol; // => "http:"
      // parser.hostname; // => "example.com"
      // parser.port;     // => "3000"
      // parser.pathname; // => "/pathname/"
      // parser.search;   // => "?search=test"
      // parser.hash;     // => "#hash"
      // parser.host;     // => "example.com:3000"

        return 'ws://' + parser.hostname + ':' + this.port + '/websocket';
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


    showCitizen: function(data) {
      var name = data.name == null ? data.ip : data.name, site, i;

      $(".panel-4 span.name b").text(name);
      $(".panel-4 span.mac small").text(data.mac);
      $(".panel-4 .data li").remove();

      for(i = 0; i < data.pages.length; i++) {
        site = data.pages[i]
        $(".panel-4 .data").prepend("<li><span class='site'>"+site[0]+"</span><span class='time'>"+site[1]+"</span></li>");
      }

      $('.panel-4').removeClass('off-left off-right');
      setTimeout(function() {
        $('.panel-4').addClass('off-right');
      }, 7500);

    },

    showInfo: function(data) {
      var parts = data.message.split("\n"), html;
      if(parts.length < 2) {
        html = "<h1>" + parts.join("") + "</h1>"
      } else {
        html = "<h2>" + parts.join("</h2><h2>") + "</h2>"
      }

      $('.panel-2 .citizen-information').html(html);
      $('.panel-2').removeClass('off-left off-right');
      setTimeout(function() {
        $('.panel-2').addClass('off-right');
      }, 12000);
    },

    showAlert: function (data) {
      var name = data.name == null ? data.ip : data.name;

      $(".panel-3 span.deviant").text(name);
      $('.panel-3').removeClass('off-left off-right');
      setTimeout(function () {
        $('.panel-3').addClass('off-right');
      }, 7500);

    },

    showDelinquents: function (data) {
      var i, info, name;

      $('.panel-6').removeClass('off-left off-right');

      $('.panel-6 .data li').remove();

      for (i = 0; i < data.people.length; i++) {
        info = data.people[i]
        name = info[2] == null ? info[1] : info[2];
        $(".panel-6 .data").prepend("<li><span class='site'>" + name + "</span> accessed deviant <span>"+ info[0] +"</span><span class='time'>"+info[3]+"</span></li>");
      }

      if(data.people.length == 0) {
        $(".panel-6 .data").append("<li><span class='site'>No deviant information accesses so far.</span></li>")
      }


      setTimeout(function () {
        $('.panel-6').addClass('off-right');
      }, 10000);
    },

  _onmessage: function(event) {
        var msg = event.data ;
        this.log('event: ' + event);
        this.log('msg: ' + msg);
        var data = JSON.parse(msg);
        this.log(data);

        switch(data.type) {
          case "http":
            this.updateHttp(data);
            break;
          case "citizen":
            this.showCitizen(data);
            break;
          case "alert":
            this.showAlert(data);
            break;
          case "info":
            this.showInfo(data);
            break;
          case "delinquents":
            this.showDelinquents(data);
            break;
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
        setTimeout(function() {cocs.connect() }, 30000);
    },

    constructor: CocsBackground
};


var cocs = new CocsBackground();
cocs.connect();


$('.logo').click( function () {
    $('.panel-6').removeClass('off-left off-right');
});

$('.panel-6').click( function () {
    $('.panel-6').addClass('off-right');
});


