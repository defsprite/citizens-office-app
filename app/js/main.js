/*global $:true, console:true*/
(function () {
  'use strict';
})();

function CocsBackground() {
  this.tick = 0;


}


CocsBackground.prototype = {

  extensions: ['s-iphone', 's-MacBook', 's-ipad', 's-ipod', 's-Nexus', 's-iBook', 's Computer', '-Samsung', '-Android', ' Phone', 'Smartphone', '.local' ],

  names: "Michael Christopher Matthew Joshua Daniel David James Robert John Joseph Andrew Ryan Brandon Jason Justin William Jonathan Brian Nicholas Anthony Eric Adam Kevin Steven Thomas Timothy Kyle Richard Jeffrey Jeremy Benjamin Mark Aaron Charles Jacob Stephen Patrick Sean Zachary Nathan Dustin Paul Tyler Scott Gregory Travis Kenneth Bryan Jose Alexander Jesse Cody Bradley Samuel Shawn Derek Chad Jared Edward Peter Marcus Jordan Corey Keith Juan Donald Joel Shane Phillip Brett Ronald George Antonio Raymond Carlos Douglas Nathaniel Ian Craig Alex Cory Gary Derrick Philip Luis Casey Erik Victor Brent Frank Evan Gabriel Adrian Wesley Vincent Jeffery Larry Curtis Todd Blake  Jessica Ashley Jennifer Amanda Sarah Stephanie Nicole Heather Elizabeth Megan Melissa Christina Rachel Laura Lauren Amber Brittany Danielle Kimberly Amy Crystal Michelle Tiffany Emily Rebecca Erin Jamie Kelly Samantha Sara Angela Katherine Andrea Erica Mary Lisa Lindsey Kristen Katie Lindsay Shannon Vanessa Courtney Christine Alicia Allison April Kathryn Kristin Jenna Tara Maria Krystal Anna Julie Holly Kristina Natalie Victoria Jacqueline Monica Cassandra Meghan Patricia Catherine Cynthia Stacy Kathleen Brandi Brandy Valerie Veronica Whitney Diana Chelsea Leslie Caitlin Leah Natasha Erika Latoya Dana Dominique Brittney Julia Candice Karen Melanie Stacey Margaret Sheena Alexandra Katrina Bethany Nichole Carrie Alison Kara Joanna Rachael".split(" "),

  sites: "google.co.uk google.co.uk google.com google.com facebook.com facebook.com youtube.com youtube.com bbc.co.uk bbc.co.uk ebay.co.uk ebay.co.uk amazon.co.uk amazon.co.uk yahoo.com yahoo.com wikipedia.org wikipedia.org linkedin.com linkedin.com live.com live.com twitter.com twitter.com dailymail.co.uk dailymail.co.uk paypal.com paypal.com wordpress.com wordpress.com amazon.com amazon.com tumblr.com tumblr.com rightmove.co.uk rightmove.co.uk telegraph.co.uk telegraph.co.uk imdb.com imdb.com bing.com bing.com pinterest.com pinterest.com gumtree.com gumtree.com hsbc.co.uk hsbc.co.uk theguardian.com theguardian.com microsoft.com microsoft.com microsoft.com apple.com apple.com googleusercontent.com instagram.com msn.com xhamster.com xhamster.com xhamster.com xhamster.com xhamster.com xhamster.com xhamster.com xhamster.com xhamster.com sky.com tripadvisor.co.uk flickr.com ask.com barclays.co.uk guardian.co.uk stackoverflow.co margos.co.uk tesco.com national-lottery.co.uk national-lottery.co.uk national-lottery.co.uk national-lottery.co.uk lloydstsb.co.uk bt.com wordpress.org imgur.com skysports.com xvideos.com xvideos.com xvideos.com xvideos.com xvideos.com xvideos.com xvideos.com xvideos.com ebay.com virginmedia.com fsf.org eff.org wikileaks.org labour.org.uk www.amnesty.org.uk debian.org defsprite.com markdurrant.com paywithtab.com pebblecode.com 3-beards.com".split(" "),

  deviant: "fsf.org eff.org wikileaks.org labour.org.uk amnesty.org.uk".split(" "),

  propoganda: ["safety > liberty", "If you have nothing to hide,\nyou have nothing to fear", "Ignorance is strength", "If you want to keep a secret,\nyou must also hide it\nfrom yourself"],

  tickLoop: function (ctx) {
    if (Math.random() * 40 < 2) {
      console.log("HTTP LINE");
      var data = this.createFakeHttpData(new Date());
      if(this.deviant.indexOf(data.host) > -1) { this.showAlert({name: data.name}) }
      this.updateHttp(data);
    }
  },

  alertLoop: function (ctx) {
    ctx.tick += 1;
    console.log("alertLoop: " + ctx.tick);
    switch (ctx.tick % 3) {
      case 0:
        this.showCitizen(this.createFakeCitizenData());
        console.log("Alert 0");
        break;
      case 1:
        this.showDelinquents(this.createFakeDelinquentData());
        console.log("Alert 1");
        break;
      case 2:
        this.showInfo({message: this.sample(this.propoganda)});
        console.log("Alert 2");
        break;
    }

  },

  createFakeHttpData: function (date) {
    return {
      name: this.sample(this.names) + this.sample(this.extensions),
      host: this.sample(this.sites),
      time: date.toLocaleTimeString().slice(0,5)
    }
  },

  createFakeCitizenData: function () {

    var pages = [],
      date = new Date(),
      mac = [], r;

    for(var i = 0; i<6; i++) {
      r = this.randomInt(256);
      mac.push((r < 16 ? '0' : '') +  r.toString(16));
    }

    for(i = 0; i < this.randomInt(20); i++) {
      date = new Date(date.getTime() - this.randomInt(5 * 60 * 1000));
      pages.unshift([this.sample(this.sites), date.toLocaleTimeString().slice(0,5)]);
    }

    return {
      name: this.sample(this.names) + this.sample(this.extensions),
      mac: mac.join(":").toUpperCase(),
      pages: pages
    }
  },

  createFakeDelinquentData: function () {

      var delinquents = [],
        date = new Date(),
        mac = [], i;

      for(i = 0; i < this.randomInt(20); i++) {
        date = new Date(date.getTime() - this.randomInt(30 * 60 * 1000));
        delinquents.unshift([this.sample(this.deviant), '', this.sample(this.names)+this.sample(this.extensions), date.toLocaleTimeString().slice(0,5)]);
      }

      return {
        people: delinquents
      }
    },

  sample: function(array) {
    return array[Math.floor(Math.random() * array.length)];
  },

  randomInt: function(n) {
    return Math.floor(Math.random() * n);
  },

  start: function () {
    var self = this;
    setInterval(function () {
      self.tickLoop(self)
    }, 100);
    setInterval(function () {
      self.alertLoop(self)
    }, 30000);
  },

  updateHttp: function (data) {
    var name = data.name == null ? data.ip : data.name
    $(".panel-1 .data").prepend("<li><span class='name'>" + name + "</span> accessed <span class='site'>" + data.host + " </span><span class='time'>" + data.time + "</span></li>");
    $(".panel-1 .data li:last-child").remove();
  },


  showCitizen: function (data) {
    var name = data.name == null ? data.ip : data.name, site, i;

    $(".panel-4 span.name b").text(name);
    $(".panel-4 span.mac small").text(data.mac);
    $(".panel-4 .data li").remove();

    for (i = 0; i < data.pages.length; i++) {
      site = data.pages[i]
      $(".panel-4 .data").prepend("<li><span class='site'>" + site[0] + "</span><span class='time'>" + site[1] + "</span></li>");
    }

    $('.panel-4').removeClass('off-left off-right');
    setTimeout(function () {
      $('.panel-4').addClass('off-right');
    }, 7500);

  },

  showInfo: function (data) {
    var parts = data.message.split("\n"), html;
    if (parts.length < 2) {
      html = "<h1>" + parts.join("") + "</h1>"
    } else {
      html = "<h2>" + parts.join("</h2><h2>") + "</h2>"
    }

    $('.panel-2 .citizen-information').html(html);
    $('.panel-2').removeClass('off-left off-right');
    setTimeout(function () {
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
      $(".panel-6 .data").prepend("<li><span class='site'>" + name + "</span> accessed deviant <span>" + info[0] + "</span><span class='time'>" + info[3] + "</span></li>");
    }

    if (data.people.length == 0) {
      $(".panel-6 .data").append("<li><span class='site'>No deviant information accesses so far.</span></li>")
    }

    setTimeout(function () {
      $('.panel-6').addClass('off-right');
    }, 10000);
  }

  //constructor: CocsBackground
};


var cocs = new CocsBackground();
cocs.start();


