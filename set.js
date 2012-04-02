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
  set.timerIntervalID = undefined;

  // Bind event handlers, start a new game.
  set.onLoad = function () {
    $("#game").on("cardStateChange.set", ".card", set.checkGameState);
    $("#game").on("gameOver.set", set.gameOver);
    $("#no_set").click(set.noSetClickHandler);
    set.newGame();
  };

  // Reset game function
  set.newGame = function () {
    _.each(set.cards, function (card) {card.remove();});
    set.score = 0;
    set.setScore(0);
    set.setupCardCombinations();
    set.dealCards();
    var time = 0;
    $("#time span").text(time);
    set.timerIntervalID = window.setInterval(function () {
      time += 1;
      $("#time span").text(time)
    }, 1000);
  };

  // Handle game over presentation
  set.gameOver = function () {
    window.clearInterval(set.timerIntervalID);
    set.timerIntervalID = undefined;
  };

  // Add cards to table
  set.dealCards = function (dealExtraCards) {
    while (set.cards.length < (dealExtraCards ? 15 : 12) && set.permutations.length > 0) {
      new set.Card(set.permutations.splice(Math.floor(Math.random() * set.permutations.length), 1)[0]);
    }
    set.isGameOver();
  };

  // Generate all card combinations
  set.setupCardCombinations = function () {
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

  // Check the active cards for a valid set
  set.checkGameState = function (event) {
    var activeCards = _.select(set.cards,
      function (card) {return card.active;});
    if (activeCards.length === 3) {
      if (set.isSet(activeCards)) {
        set.incrementScore();
        _.each(activeCards, function (card) {card.remove();});
        set.dealCards();
      } else {
        set.decrementScore();
        _.each(activeCards, function (card) {card.deactivate();});
      }
    }
  };

  // Returns true if the 3 cards given are a set, otherwise false
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

  // Returns true if the current board contains a set, otherwise false
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

  // Returns true an end game condition has been met, otherwise false
  set.isGameOver = function () {
    if (set.permutations.length <= 0 && !set.isSetPresent()) {
      $("#game").trigger("gameOver.set");
      return true;
    } else {
      return false;
    }
  };

  // Updates the score in the DOM to the given value
  set.setScore = function (newScore) {
    $("#score span").text(newScore);
  };

  // Increments the score by 1
  set.incrementScore = function () {
    set.score += 1;
    set.setScore(set.score);
  };

  // Decrements the score by 1
  set.decrementScore = function () {
    set.score -= 1;
    set.setScore(set.score);
  };


  set.noSetClickHandler = function (event) {
    if (set.isSetPresent()) {
      set.decrementScore()
    } else {
      set.incrementScore();
      set.dealCards(true);
    }
    event.preventDefault();
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
    "diamond" : '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 125 200" enable-background="new 0 0 125 200" xml:space="preserve"> <polygon points="62.5,24.745 107.755,100 62.5,175.255 17.245,100 "/> </svg>',
    "oval" : '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 125 200" enable-background="new 0 0 125 200" xml:space="preserve"> <path d="M70,110.694c0,17.949-14.551,32.5-32.5,32.5l0,0c-17.949,0-32.5-14.551-32.5-32.5V39.306c0-17.949,14.551-32.5,32.5-32.5 l0,0c17.949,0,32.5,14.551,32.5,32.5V110.694z"/> </svg>',
    "squiggle" : '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 125 200" enable-background="new 0 0 125 200" xml:space="preserve"> <path d="M56.802,104.45c-3.595-1.934-4.567-2.52-4.567-7.135c0-6.234,3.32-11.941,7.329-18.222l0.081-0.13 C64.498,71.052,70,62.085,70,49.805C70,31.131,57.53,14.24,38.232,6.773l-0.57-0.2C35.542,5.909,32.639,5,28.771,5 C15.918,5,6.227,14.111,6.227,26.194c0,12.742,9.194,17.625,12.972,19.526c2.946,1.705,3.261,1.959,3.261,4.949 c0,4.153-3.114,9.635-5.826,13.948l-0.189,0.316C11.345,73.923,5,85.108,5,99.332c0,20.425,12.791,37.41,33.382,44.325l0.19,0.062 c2.65,0.825,5.695,1.28,8.578,1.28c13.063,0,22.545-9.034,22.545-21.481C69.695,110.745,60.837,106.352,56.802,104.45z"/> </svg>'
  };

}(window.set = window.set || {}, jQuery));