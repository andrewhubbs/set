describe("Set", function () {
  beforeEach(function () {
    $('#jasmine_content').html("<div id='scoreboard'><div id='score'><p>Score: <span></span></p></div><div id='time'><p>Time: <span></span></p></div><div id='controls'><a href='#' id='no_set'>No Set</a><a href='#' id='hint'>Show hint</a><a href='#' class='new_game'>New game</a></div></div><div id='game'></div><div id='game_over'> <div id='stats'> <p>Score: <span class='score'></span></p> <p>Time: <span class='time'></span></p><p>Your Best Time: <span class='best_time'></span></p><p>You win!</p><a href='#' class='new_game'>New Game</a></div></div>");
    set.cards = [];
    set.score = 0;
  });

  describe("onLoad", function () {
    it("should start a new game", function () {
      spyOn(set, "newGame");
      set.onLoad();
      expect(set.newGame).toHaveBeenCalled();
    });

    it("binds a state change handler to the game", function () {
      spyOn($.fn, "on");
      set.onLoad();
      expect($.fn.on).toHaveBeenCalledInTheContextOf($("#game")[0], ["cardStateChange.set", ".card", set.checkGameState]);
    });

    it("binds a game over listener to the game", function () {
      spyOn($.fn, "on");
      set.onLoad();
      expect($.fn.on).toHaveBeenCalledInTheContextOf($("#game")[0], ["gameOver.set", set.gameOver]);
    });

    it("binds a click handler to the no set button", function () {
      spyOn($.fn, "click");
      set.onLoad();
      expect($.fn.click).toHaveBeenCalledInTheContextOf($("#no_set")[0], [set.noSetClickHandler]);
    });

    it("binds a click handler to the hint button", function () {
      spyOn($.fn, "click");
      set.onLoad();
      expect($.fn.click).toHaveBeenCalledInTheContextOf($("#hint")[0], [set.showHint]);
    });

    it("binds a click handler to the new game button", function () {
      spyOn($.fn, "click");
      set.onLoad();
      expect($.fn.click).toHaveBeenCalledInTheContextOf($(".new_game")[0], [set.newGame]);
    });
  });

  describe("newGame", function () {
    it("should setup the card combinations", function () {
      spyOn(set, "setupCardCombinations");
      set.newGame();
      expect(set.setupCardCombinations).toHaveBeenCalled();
    });

    it("should deal the cards", function () {
      spyOn(set, "dealCards");
      set.newGame();
      expect(set.dealCards).toHaveBeenCalled();
    });

    it("should reset the score and cards", function () {
      new set.Card({color:"red", count:"one", shape:"oval", fill:"solid"});
      var card = set.cards[0];
      spyOn(card, "remove");
      spyOn(set, "setScore");
      set.score = 25;
      set.newGame();
      expect(set.score).toEqual(0);
      expect(card.remove).toHaveBeenCalled();
      expect(set.setScore).toHaveBeenCalledWith(0);
    });

    it("should set the timer interval", function () {
      set.timerIntervalID = undefined;
      set.newGame();
      expect(set.timerIntervalID).not.toBeUndefined();
    });

    it("should clear the game time", function () {
      set.timerIntervalID = 987;
      spyOn(window, "clearInterval");
      $("#time span").text(45);
      set.newGame();
      expect($("#time span").text()).toEqual("0");
      expect(window.clearInterval).toHaveBeenCalledWith(987);
    });

    it("should hide the game_over div", function () {
      spyOn($.fn, "hide");
      set.newGame();
      expect($.fn.hide).toHaveBeenCalledInTheContextOf($("#game_over")[0]);
    });
  });

  describe("gameOver", function () {
    it("should clear the timer interval", function () {
      set.timerIntervalID = 57;
      spyOn(window, "clearInterval");
      set.gameOver();
      expect(window.clearInterval).toHaveBeenCalledWith(57);
      expect(set.timerIntervalID).toBeUndefined();
    });

    it("should show the game_over div", function () {
      spyOn($.fn, "show");
      set.gameOver();
      expect($.fn.show).toHaveBeenCalledInTheContextOf($("#game_over")[0]);
    });

    it("should set the time span in the stats", function () {
      $("#time span").text("60");
      set.gameOver();
      expect($("#game_over .time").text()).toEqual("60");
    });

    it("should set the score span in the stats", function () {
      set.score = 20;
      set.gameOver();
      expect($("#game_over .score").text()).toEqual("20");
    });

    it("should update the bestTime where applicable", function () {
      set.bestTime = 0;
      $("#time span").text("60");
      set.gameOver();
      expect(set.bestTime).toEqual(60);
      expect($(".best_time").text()).toEqual("60");
      $("#time span").text("40");
      set.gameOver();
      expect(set.bestTime).toEqual(40);
      expect($(".best_time").text()).toEqual("40");
      $("#time span").text("50");
      set.gameOver();
      expect(set.bestTime).toEqual(40);
      expect($(".best_time").text()).toEqual("40");
    });
  });

  describe("setupCardCombinations", function () {
    it("should create 81 card combinations", function () {
      set.permutations = [];
      set.setupCardCombinations();
      expect(set.permutations.length).toEqual(81);
    });

    it("should wipe out any already existing combinations", function () {
      set.permutations = [
        {color:"blue", count:"five", shape:"square", fill:"filled"}
      ];
      set.setupCardCombinations();
      expect(set.permutations.length).toEqual(81);
    });
  });

  describe("dealCards", function () {
    it("should create 12 cards", function () {
      set.dealCards();
      expect(set.cards.length).toEqual(12);
    });

    it("should accept an optional dealExtraCards parameter", function () {
      set.dealCards(true);
      expect(set.cards.length).toEqual(15);
    });

    it("should remove 3 cards and add new ones if there are already 15", function () {
      set.dealCards(true);
      var last4Cards = set.cards.slice(11, 14);
      set.dealCards(true);
      expect(set.cards.length).toEqual(15);
      expect(set.cards[11]).toEqual(last4Cards[0]);
      expect(set.cards[12]).not.toEqual(last4Cards[1]);
      expect(set.cards[13]).not.toEqual(last4Cards[2]);
      expect(set.cards[14]).not.toEqual(last4Cards[3]);
    });

    it("should check the game state", function () {
      spyOn(set, "isGameOver");
      set.dealCards();
      expect(set.isGameOver).toHaveBeenCalled();
    });
  });

  describe("isSet", function () {
    var redOneOvalSolid, redOneOvalClear, redOneOvalLined, redTwoOvalClear,
      purpleTwoSquiggleSolid, purpleOneSquiggleSolid, purpleThreeSquiggleSolid,
      greenTwoDiamondSolid, greenOneDiamondSolid, greenThreeDiamondSolid, greenOneDiamondLined;
    beforeEach(function () {
      redOneOvalSolid = {properties:{color:"red", count:"one", shape:"oval", fill:"solid"}};
      redOneOvalClear = {properties:{color:"red", count:"one", shape:"oval", fill:"clear"}};
      redOneOvalLined = {properties:{color:"red", count:"one", shape:"oval", fill:"lined"}};
      redTwoOvalClear = {properties:{color:"red", count:"two", shape:"oval", fill:"clear"}};
      purpleTwoSquiggleSolid = {properties:{color:"purple", count:"two", shape:"squiggle", fill:"solid"}};
      purpleOneSquiggleSolid = {properties:{color:"purple", count:"one", shape:"squiggle", fill:"solid"}};
      purpleThreeSquiggleSolid = {properties:{color:"purple", count:"three", shape:"squiggle", fill:"solid"}};
      greenThreeDiamondSolid = {properties:{color:"green", count:"three", shape:"diamond", fill:"solid"}};
      greenTwoDiamondSolid = {properties:{color:"green", count:"two", shape:"diamond", fill:"solid"}};
      greenOneDiamondSolid = {properties:{color:"green", count:"one", shape:"diamond", fill:"solid"}};
      greenOneDiamondLined = {properties:{color:"green", count:"one", shape:"diamond", fill:"lined"}};
    });

    describe("valid sets", function () {
      it("matching 3 properties", function () {
        expect(set.isSet([redOneOvalClear, redOneOvalLined, redOneOvalSolid])).toBeTruthy();
        expect(set.isSet([purpleOneSquiggleSolid, purpleThreeSquiggleSolid, purpleTwoSquiggleSolid])).toBeTruthy();
        expect(set.isSet([greenOneDiamondSolid, greenThreeDiamondSolid, greenTwoDiamondSolid])).toBeTruthy();
      });

      it("matching 2 properties", function () {
        expect(set.isSet([greenOneDiamondSolid, purpleOneSquiggleSolid, redOneOvalSolid])).toBeTruthy();
      });

      it("matching 1 property", function () {
        expect(set.isSet([greenOneDiamondLined, purpleOneSquiggleSolid, redOneOvalClear])).toBeTruthy();
      });

      it("matching 0 properties", function () {
        expect(set.isSet([greenOneDiamondLined, purpleThreeSquiggleSolid, redTwoOvalClear])).toBeTruthy();
      });
    });

    it("invalid sets", function () {
      expect(set.isSet([redOneOvalClear, redOneOvalLined, purpleOneSquiggleSolid])).toBeFalsy();
      expect(set.isSet([greenOneDiamondLined, redOneOvalLined, purpleOneSquiggleSolid])).toBeFalsy();
      expect(set.isSet([greenOneDiamondLined, greenOneDiamondSolid, greenTwoDiamondSolid])).toBeFalsy();
      expect(set.isSet([redOneOvalSolid, redOneOvalLined, redTwoOvalClear])).toBeFalsy();
    });
  });

  describe("isSetPresent", function () {
    it("should call isSet on every group of three cards on the board", function () {
      set.newGame();
      spyOn(set, "isSet").andReturn(false);
      set.isSetPresent();
      expect(set.cards.length).toEqual(12);
      expect(set.isSet).toHaveBeenCalledWith([set.cards[0], set.cards[1], set.cards[2]]);
      expect(set.isSet).toHaveBeenCalledWith([set.cards[0], set.cards[2], set.cards[4]]);
      expect(set.isSet).toHaveBeenCalledWith([set.cards[0], set.cards[5], set.cards[6]]);
      expect(set.isSet).toHaveBeenCalledWith([set.cards[0], set.cards[10], set.cards[11]]);
      expect(set.isSet).toHaveBeenCalledWith([set.cards[3], set.cards[4], set.cards[8]]);
      expect(set.isSet).toHaveBeenCalledWith([set.cards[8], set.cards[10], set.cards[11]]);
    });

    it("should short circuit if it finds a set", function () {
      set.newGame();
      spyOn(set, "isSet").andCallFake(function (cards) {
        return cards[0] === set.cards[0] && cards[1] === set.cards[5] && cards[2] === set.cards[6]
      });

      set.isSetPresent();
      expect(set.isSet).toHaveBeenCalledWith([set.cards[0], set.cards[1], set.cards[2]]);
      expect(set.isSet).toHaveBeenCalledWith([set.cards[0], set.cards[2], set.cards[4]]);
      expect(set.isSet).toHaveBeenCalledWith([set.cards[0], set.cards[5], set.cards[6]]);
      expect(set.isSet).not.toHaveBeenCalledWith([set.cards[0], set.cards[10], set.cards[11]]);
      expect(set.isSet).not.toHaveBeenCalledWith([set.cards[3], set.cards[4], set.cards[8]]);
      expect(set.isSet).not.toHaveBeenCalledWith([set.cards[8], set.cards[10], set.cards[11]]);
    });

    it("should return true if there is a set", function () {
      set.newGame();
      spyOn(set, "isSet").andReturn(true);
      expect(set.isSetPresent()).toBeTruthy();
    });

    it("should return false if there is not a set", function () {
      set.newGame();
      spyOn(set, "isSet").andReturn(false);
      expect(set.isSetPresent()).toBeFalsy();
    });
  });

  describe("checkGameState", function () {
    var card1, card2, card3;
    beforeEach(function () {
      card1 = new set.Card({color:"red", count:"one", shape:"oval", fill:"solid"});
      card2 = new set.Card({color:"red", count:"one", shape:"oval", fill:"solid"});
      card3 = new set.Card({color:"red", count:"one", shape:"oval", fill:"solid"});
      spyOn(_, "select").andReturn([card1, card2, card3]);
    });

    describe("valid set", function () {
      beforeEach(function () {
        spyOn(set, "isSet").andReturn(true);
      });

      it("should increment the score", function () {
        spyOn(set, "incrementScore");
        set.checkGameState();
        expect(set.incrementScore).toHaveBeenCalled();
      });

      it("should deal more cards", function () {
        spyOn(_, "delay").andCallFake(function (func, wait) {
          func();
        });
        spyOn(set, "dealCards");
        set.checkGameState();
        expect(set.dealCards).toHaveBeenCalled();
      });

      it("should call remove on the active cards", function () {
        spyOn(card1, "remove");
        spyOn(card2, "remove");
        spyOn(card3, "remove");
        set.checkGameState();
        expect(card1.remove).toHaveBeenCalled();
        expect(card2.remove).toHaveBeenCalled();
        expect(card3.remove).toHaveBeenCalled();
      });
    });

    describe("invalid set", function () {
      beforeEach(function () {
        spyOn(set, "isSet").andReturn(false);
      });

      it("should decrement the score", function () {
        spyOn(set, "decrementScore");
        set.checkGameState();
        expect(set.decrementScore).toHaveBeenCalled();
      });

      it("should call deactivate on the active cards", function () {
        spyOn(card1, "deactivate");
        spyOn(card2, "deactivate");
        spyOn(card3, "deactivate");
        set.checkGameState();
        expect(card1.deactivate).toHaveBeenCalled();
        expect(card2.deactivate).toHaveBeenCalled();
        expect(card3.deactivate).toHaveBeenCalled();
      });
    });
  });

  describe("isGameOver", function () {
    it("should return false if there are cards still to be dealt", function () {
      set.permutations.push({color:"red", count:"one", shape:"oval", fill:"solid"});
      expect(set.isGameOver()).toBeFalsy();
    });

    it("should not check for a set if there are still cards to be dealt", function () {
      spyOn(set, "isSetPresent");
      set.permutations.push({color:"red", count:"one", shape:"oval", fill:"solid"});
      set.isGameOver();
      expect(set.isSetPresent).not.toHaveBeenCalled();
    });

    it("should return false if there is still a set present", function () {
      set.permutations = [];
      spyOn(set, "isSetPresent").andReturn(true);
      expect(set.isGameOver()).toBeFalsy();
    });

    it("should return true if there are no more cards and there are no more sets", function () {
      set.permutations = [];
      spyOn(set, "isSetPresent").andReturn(false);
      expect(set.isGameOver()).toBeTruthy();
    });

    it("should trigger a gameOver.set event if the game is over", function () {
      spyOn($.fn, "trigger");
      set.permutations = [];
      spyOn(set, "isSetPresent").andReturn(false);
      set.isGameOver();
      expect($.fn.trigger).toHaveBeenCalledInTheContextOf($("#game")[0], ["gameOver.set"]);
    });
  });

  describe("setScore", function () {
    it("should set the score to the given value", function () {
      $("#score span").text("5");
      set.setScore(10);
      expect($("#score span").text()).toEqual("10");
    });
  });

  describe("incrementScore", function () {
    it("should call setScore and set the score to be +1", function () {
      set.score = 3;
      spyOn(set, "setScore");
      set.incrementScore();
      expect(set.setScore).toHaveBeenCalledWith(4);
      expect(set.score).toEqual(4);
    });
  });

  describe("decrementScore", function () {
    it("should call setScore and set the score to be -1", function () {
      set.score = 3;
      spyOn(set, "setScore");
      set.decrementScore();
      expect(set.setScore).toHaveBeenCalledWith(2);
      expect(set.score).toEqual(2);
    });
  });

  describe("noSetClickHandler", function () {
    var event;
    beforeEach(function () {
      event = jQuery.Event("click");
    });

    it("should prevent default behavior", function () {
      set.noSetClickHandler.apply($("#no_set")[0], [event]);
      expect(event.isDefaultPrevented()).toBeTruthy();
    });

    it("should decrement the score if there is a set", function () {
      spyOn(set, "isSetPresent").andReturn(true);
      spyOn(set, "decrementScore");
      set.noSetClickHandler.apply($("#no_set")[0], [event]);
      expect(set.decrementScore).toHaveBeenCalled();
    });

    describe("when no set is present", function () {
      beforeEach(function () {
        spyOn(set, "isSetPresent").andReturn(false);
      });

      it("should increment the score", function () {
        spyOn(set, "incrementScore");
        set.noSetClickHandler.apply($("#no_set")[0], [event]);
        expect(set.incrementScore).toHaveBeenCalled();
      });

      it("should deal additional cards", function () {
        spyOn(set, "dealCards");
        set.noSetClickHandler.apply($("#no_set")[0], [event]);
        expect(set.dealCards).toHaveBeenCalledWith(true);
      });
    });
  });

  describe("showHint", function () {
    var event, redOneOvalSolid, redOneOvalClear, redOneOvalLined;
    beforeEach(function () {
      event = jQuery.Event("click");
      redOneOvalSolid = new set.Card({color:"red", count:"one", shape:"oval", fill:"solid"});
      redOneOvalClear = new set.Card({color:"red", count:"one", shape:"oval", fill:"clear"});
      redOneOvalLined = new set.Card({color:"red", count:"one", shape:"oval", fill:"lined"});
    });

    it("should activate one of the cards in a set", function () {
      set.showHint.apply($("#hint")[0], [event]);
      expect(redOneOvalSolid.active).toEqual(true);
    });

    it("should prevent default link behavior", function () {
      set.showHint.apply($("#hint")[0], [event]);
      expect(event.isDefaultPrevented()).toBeTruthy();
    });

    it("should deactivate any other cards", function () {
      set.cards[2].activate();
      set.showHint.apply($("#hint")[0], [event]);
      expect(set.cards[2].active).toEqual(false);
    });

    it("should show deal more cards if there is no sets", function () {
      spyOn(set, "isSet").andReturn(false);
      spyOn(set, "dealCards");
      set.showHint.apply($("#hint")[0], [event]);
      expect(set.dealCards).toHaveBeenCalledWith(true);
    });
  });

  describe("Card", function () {
    describe("initialization", function () {
      it("should register itself with the set game", function () {
        set.cards = [];
        var card = new set.Card({color:"red", count:"one", shape:"oval", fill:"solid"});
        expect(set.cards).toEqual([card]);
      });

      it("should insert a card div into the #game", function () {
        expect($("#game .card.red.one.oval.solid").length).toEqual(0);
        new set.Card({color:"red", count:"one", shape:"oval", fill:"solid"});
        expect($("#game .card.red.one.oval.solid").length).toEqual(1);
      });

      it("should bind a click handler", function () {
        spyOn($.fn, "click");
        new set.Card({color:"red", count:"one", shape:"oval", fill:"solid"});
        expect($.fn.click).toHaveBeenCalledInTheContextOf($("#game .card.red.one.oval.solid")[0], [jasmine.any(Function)]);
      });
    });

    describe("instance methods", function () {
      var card;
      beforeEach(function () {
        card = new set.Card({color:"red", count:"one", shape:"oval", fill:"solid"});
      });

      describe("clickHandler", function () {
        it("should call deactivate if already active", function () {
          card.active = true;
          spyOn(card, "deactivate");
          card.clickHandler();
          expect(card.deactivate).toHaveBeenCalled();
        });

        it("should call activate if not already active", function () {
          card.active = false;
          spyOn(card, "activate");
          card.clickHandler();
          expect(card.activate).toHaveBeenCalled();
        });
      });

      describe("activate", function () {
        it("should set the active property to true", function () {
          card.active = false;
          card.activate();
          expect(card.active).toBeTruthy();
        });

        it("should add the active class to the card element", function () {
          expect(card.$el).not.toHaveClass("active");
          card.activate();
          expect(card.$el).toHaveClass("active");
        });

        it("should trigger a cardStateChange.set event", function () {
          spyOn($.fn, "trigger");
          card.activate();
          expect($.fn.trigger).toHaveBeenCalledInTheContextOf(card.$el[0], ["cardStateChange.set"]);
        });
      });

      describe("deactivate", function () {
        var card;
        beforeEach(function () {
          card = new set.Card({color:"red", count:"one", shape:"oval", fill:"solid"});
        });

        it("should set the active property to false", function () {
          card.active = true;
          card.deactivate();
          expect(card.active).toBeFalsy();
        });

        it("should remove the active class to the card element", function () {
          card.$el.addClass("active");
          card.deactivate();
          expect(card.$el).not.toHaveClass("active");
        });
      });

      describe("remove", function () {
        it("should remove itself from the set card game", function () {
          expect(_.contains(set.cards, card)).toBeTruthy();
          card.remove();
          expect(_.contains(set.cards, card)).toBeFalsy();
        });

        it("remove the element from the dom", function () {
          spyOn($.fn, "fadeOut").andCallFake(function (time, func) {
            func();
          });
          spyOn($.fn, "remove");
          card.remove();
          expect($.fn.remove).toHaveBeenCalledInTheContextOf(card.$el[0]);
        });
      });
    });
  });
});