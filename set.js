$(function () {
  set.onLoad();
});

(function (set, $, undefined) {
  set.COLORS = ["green", "red", "purple"];
  set.COUNTS = ["one", "two", "three"];
  set.SHAPES = ["diamond", "oval", "squiggle"];
  set.FILLS = ["solid", "clear", "lined"];
  set.permutations = [];

  set.cards = [];
  set.score = 0;

  //Bind event handlers, start a new game.
  set.onLoad = function () {
    $("#game").on("cardStateChange.set", ".card", set.checkGameState);
    $("#game").on("gameOver.set", set.gameOver);
    set.newGame();
  };

  // Reset game function
  set.newGame = function () {
    _.each(set.cards, function (card) {card.remove();});
    set.score = 0;
    set.setScore(0);
    set.setupCardPermutations();
    set.dealCards();
  };

  //Handle game over presentation
  set.gameOver = function () {

  };

  set.dealCards = function (dealExtraCards) {
    while (set.cards.length < (dealExtraCards ? 15 : 12) && set.permutations.length > 0) {
      new set.Card(set.permutations.splice(Math.floor(Math.random() * set.permutations.length), 1)[0]);
    }
    set.isGameOver();
  };

  set.setupCardPermutations = function () {
    set.permutations = [];
    _.each(set.COLORS, function (color) {
      _.each(set.COUNTS, function (count) {
        _.each(set.SHAPES, function (shape) {
          _.each(set.FILLS, function (fill) {
            set.permutations.push({color : color, count : count, shape : shape, fill : fill});
          });
        });
      });
    });
  };

  set.checkGameState = function (event) {
    var activeCards = _.select(set.cards,
      function (card) {return card.active;});
    if (activeCards.length === 3) {
      if (set.isSet(activeCards)) {
        set.score += 1;
        _.each(activeCards, function (card) {card.remove();});
        set.dealCards();
      } else {
        set.score -= 1;
        _.each(activeCards, function (card) {card.deactivate();});
      }
      set.setScore(set.score);
    }
  };

  set.isSet = function (cards) {
    // Returns true if the given cards are a set, otherwise false;
    var colorMatch = (cards[0].properties.color === cards[1].properties.color && cards[0].properties.color === cards[2].properties.color) ||
      (cards[0].properties.color !== cards[1].properties.color && cards[0].properties.color !== cards[2].properties.color && cards[1].properties.color !== cards[2].properties.color);
    var countMatch = (cards[0].properties.count === cards[1].properties.count && cards[0].properties.count === cards[2].properties.count) ||
      (cards[0].properties.count !== cards[1].properties.count && cards[0].properties.count !== cards[2].properties.count && cards[1].properties.count !== cards[2].properties.count);
    var shapeMatch = (cards[0].properties.shape === cards[1].properties.shape && cards[0].properties.shape === cards[2].properties.shape) ||
      (cards[0].properties.shape !== cards[1].properties.shape && cards[0].properties.shape !== cards[2].properties.shape && cards[1].properties.shape !== cards[2].properties.shape);
    var fillMatch = (cards[0].properties.fill === cards[1].properties.fill && cards[0].properties.fill === cards[2].properties.fill) ||
      (cards[0].properties.fill !== cards[1].properties.fill && cards[0].properties.fill !== cards[2].properties.fill && cards[1].properties.fill !== cards[2].properties.fill);
    return colorMatch && countMatch && shapeMatch && fillMatch;
  };

  set.isSetPresent = function () {
    var getCombinations = function (n, src, got, all) {
      if (n === 0) {
        if (got.length > 0) {
          all[all.length] = got;
        }
        return;
      }
      for (var j = 0; j < src.length; j++) {
        getCombinations(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
      }
      return;
    };
    var combinations = [];
    getCombinations(3, set.cards, [], combinations);
    return _.any(combinations, function (combo) {
      return set.isSet(combo);
    });
  };

  set.isGameOver = function () {
    if (set.permutations.length <= 0 && !set.isSetPresent()) {
      $("#game").trigger("gameOver.set");
      return true;
    } else {
      return false;
    }
  };

  set.setScore = function (newScore) {
    $("#score span").text(newScore);
  };

  set.Card = function (options) {
    var self = this;

    self.properties = options;

    self.init = function () {
      self.createCard();

      //Register self with card list
      set.cards.push(self);
    };

    self.createCard = function () {
      var $game = $("#game");
      if (self.properties.count === "one") {
        var content = set.shapeHTML[self.properties.shape];
      } else if (self.properties.count === "two") {
        var content = set.shapeHTML[self.properties.shape] + set.shapeHTML[self.properties.shape];
      } else {
        var content = set.shapeHTML[self.properties.shape] + set.shapeHTML[self.properties.shape] + set.shapeHTML[self.properties.shape];
      }
      self.$el = $('<div class="card ' + self.properties.color + ' ' + self.properties.count + ' ' + self.properties.shape + ' ' + self.properties.fill + '">' + content + '</div>');
      self.active = false;
      $game.append(self.$el);
      self.$el.click(self.clickHandler);
    };

    self.clickHandler = function () {
      if (self.active) {
        self.deactivate();
      } else {
        self.activate();
      }
    };

    self.activate = function () {
      self.active = true;
      self.$el.addClass("active");
      self.$el.trigger("cardStateChange.set");
    };

    self.deactivate = function () {
      self.$el.removeClass("active");
      self.active = false;
    };

    self.remove = function () {
      set.cards.splice(_.indexOf(set.cards, self), 1);
      self.$el.remove();
    };

    self.init();
  };

  set.shapeHTML = {
    "diamond": '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 75 150" enable-background="new 0 0 75 150" xml:space="preserve"> <g> <path d="M35.122,11.898c1.308-2.419,3.449-2.419,4.756,0l31.744,58.704c1.308,2.419,1.308,6.377,0,8.796l-31.744,58.703 c-1.308,2.419-3.448,2.419-4.756,0L3.378,79.398c-1.308-2.419-1.308-6.377,0-8.796L35.122,11.898z"/> </g> </svg>',
    "oval": '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 75 150" enable-background="new 0 0 75 150" xml:space="preserve"> <path d="M67.5,107.949c0,16.567-13.433,29.999-30,29.999l0,0c-16.568,0-30-13.432-30-29.999V42.052c0-16.569,13.432-30,30-30l0,0 c16.567,0,30,13.431,30,30V107.949z"/> </svg>',
    "squiggle": '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 75 150" enable-background="new 0 0 75 150" xml:space="preserve"> <path d="M56.802,102.347c-3.595-1.796-4.567-2.339-4.567-6.625c0-5.79,3.32-11.091,7.33-16.919l0.08-0.122 C64.498,71.334,70,63.008,70,51.606c0-17.342-12.471-33.025-31.768-39.958l-0.57-0.185C35.542,10.845,32.639,10,28.771,10 C15.918,10,6.227,18.461,6.227,29.68c0,11.833,9.194,16.367,12.972,18.132c2.946,1.583,3.261,1.82,3.261,4.596 c0,3.854-3.114,8.947-5.826,12.952l-0.189,0.292C11.345,74,5,84.386,5,97.593c0,18.967,12.791,34.738,33.382,41.159l0.19,0.058 c2.65,0.766,5.695,1.19,8.578,1.19c13.062,0,22.545-8.388,22.545-19.948C69.695,108.192,60.837,104.112,56.802,102.347z"/> </svg>'
  };

}(window.set = window.set || {}, jQuery));