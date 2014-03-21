/* jshint loopfunc:true */
(function(){

  'use strict';

  $(document).ready(initialize);

  function initialize(){
    $(document).foundation();
    $('#grid').on('click', '.card', flipCard);
    $('#flipAll').click(flipAll);
    $('#unflipAll').click(unflipAll);
    $('#flipRow').click(flipRow);
    $('#flipColumn').click(flipColumn);
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
  function flipMulti(cards){
    for (var x = 0;x < cards.length;x++){
      if ($(cards[x]).css('display') === 'block'){ //is it unflipped?
        flipCard(cards[x], false, function(){});
      }
    }
  }

  function unflipMulti(cards){
    for (var x = 0;x < cards.length;x++){
      if ($(cards[x]).css('display') === 'none'){ //is it flipped?
        flipCard(cards[x], true, function(){});
      }
    }
  }

  function flipAll(){
    var cards = $('.card');
    flipMulti(cards);
    event.preventDefault();
  }

  function unflipAll(){
    var cards = $('.card');
    unflipMulti(cards);
    event.preventDefault();
  }

  function flipRow(row){
    if (typeof row === 'object'){
      row = parseInt($('#row-to-flip').val());
    }
    if (row > 5 || row < 1){
      alert('Invalid row.'); //rows are one-indexed for the purpose of user input
    } else {
      row = row - 1;
      var cards = $('#row'+row).children().children();
      flipMulti(cards);
    }
  }

  function flipColumn(column){
    if (typeof column === 'object'){
      column = parseInt($('#column-to-flip').val());
    }
    if (column > 5 || column < 1){
      alert('Invalid column.');
    } else {
      column = column - 5; //5n -1, -2, -3, -4, etc.
      var cards = $('.space:nth-child(5n'+column+')').children();
      flipMulti(cards);
    }
  }


})();

