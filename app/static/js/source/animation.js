/* jshint loopfunc:true */
(function(){

  'use strict';

  $(document).ready(initialize);

  function initialize(){
    $(document).foundation();
    $('#grid').on('click', '.card', flipCard);
    $('#flipAll').click(flipAll);
    $('#unflipAll').click(unflipAll);
  }

  function flipCard(id, unflip, fn){
    var toFlip;
    toFlip = (id.currentTarget ? $(id.currentTarget) : $(id));
    //if currentTarget exists then it came from jQuery and the click handler
    var animation = {'top': '-=50px', 'opacity': '0.0'};
    if (unflip){
      toFlip.show(); //have to call show() here, otherwise the fading-in effect won't happen
      animation = {'top': '+=50px', 'opacity': '100.0'};
    }
    toFlip.animate(animation, 200, 'linear', function(){
      if (!unflip){
        toFlip.hide();
      }
      if (fn){
        fn();
      }
    });
  }

  function flipAll(){
    var cards = $('.card');
    for (var x = 0;x < cards.length;x++){
      if ($(cards[x]).css('display') === 'block'){ //is it unflipped?
        flipCard(cards[x], false, function(){});
      }
    }
    event.preventDefault();
  }

  function unflipAll(){
    var cards = $('.card');
    for (var x = 0;x < cards.length;x++){
      if ($(cards[x]).css('display') === 'none'){ //is it flipped?
        flipCard(cards[x], true, function(){});
      }
    }
    event.preventDefault();
  }

})();

