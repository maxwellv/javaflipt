/* jshint unused:false, loopfunc:true */
(function(){

  'use strict';

  $(document).ready(initialize);

  function initialize(){
    $(document).foundation();
    $('#start-new-game').click(startNewGame);
    $('#reveal-all').click(revealAll);
    $('#quit').click(quit);
    $('#grid').on('click', '.card', startCardFlip);
    showStatusText('Welcome to JavaFlipt! Click "Start new game" to begin.');
  }

  var gameInProgress = false;
  function startNewGame(){
    var url = makeURL();
    url += '/startNewGame';
    $.ajax({url:url, type:'POST', data:{}, success:function(snapshot){
      renderSnapshot(snapshot);
      if (snapshot.gameState.currentCoins === 0 && !snapshot.gameState.ended){
        showStatusText('New game started.');
      } else {
        showStatusText('Your previous game has been loaded.');
      }
      $('#start-new-game').css('display', 'none');
      $('#quit').css('display', 'inline-block');
    }});
    event.preventDefault();
  }

  function renderSnapshot(data){
    console.log(data);
    if (data.init){
      unflipAll();
      gameInProgress = true;
      $('#current-difficulty').text(data.gameState.difficulty + 1); //one-indexing the difficulty here and here only
    }
    var selectedSpace;
    for (var x = 0; x < 25;x++){
      selectedSpace = $('#' + x);
      if (data.gameState.currentBoard[x] === false){
        //do nothing, the card is already unflipped from the unflipAll call earlier
      } else {
        var selectedCard = selectedSpace.children();
        if (selectedCard.css('display') !== 'none'){
          selectedSpace.css('background-image', 'url(' + makeURL() + '/img/' + data.gameState.currentBoard[x] + '.png)');
          flipCard(selectedSpace.children(), false, function(){});
        }
      }
    }
    if (data.init){ //the markers are not going to change with each move the player makes
      for (var y in data.gameState.rowmarkers){
        var scoreToDisplay = data.gameState.rowmarkers[y][0];
        if (scoreToDisplay < 10){
          scoreToDisplay = '0' + scoreToDisplay;
        }
        $('#row'+y+'display').text(scoreToDisplay);
        $('#row'+y+'bombs').text(data.gameState.rowmarkers[y][1]);
      }
      for (var z in data.gameState.columnmarkers){
        var scoreToDisplay2 = data.gameState.columnmarkers[z][0];
        if (scoreToDisplay2 < 10){
          scoreToDisplay2 = '0' + scoreToDisplay2;
        }
        $('#column'+z+'display').text(scoreToDisplay2);
        $('#column'+z+'bombs').text(data.gameState.columnmarkers[z][1]);
      }
    }
    if (data.gameState.ended && data.revealAll !== true){
      if (data.gameState.currentCoins > 0){
        if (data.gameState.won){
          showStatusText('Congratulations! You have found all the 2 and 3 cards on this board, so the game is now over.');
        } else {
          showStatusText('You quit early. You still get your current coins added to your total.');
        }
      } else { //player hit a bomb
        showStatusText('Game over! You flipped a bomb, so no coins for you.');
      }
      gameInProgress = false;
      $('#quit').css('display', 'none');
      $('#reveal-all').css('display', 'inline-block');
    }
    $('#current-coins').text(data.gameState.currentCoins);
    $('#total-coins').text(data.gameState.totalCoins);
    if (data.after){
      //do something
    }
  }

  function startCardFlip(){
    if ($('.card:animated').length === 0){ //believe it or not, 0.2 seconds was still enough time to double-click on a card being flipped, so we need this check
      if (gameInProgress){
        var url = makeURL();
        url += '/flip/' + $(this).parent().attr('id');
        $.ajax({url:url, type:'POST', data:{}, success:renderSnapshot});
      } else {
        showStatusText('No game is in progress. Click "Start new game" to begin.');
      }
    }
    event.preventDefault();
  }

  function quit(){
    if (confirm('Are you sure you want to quit now? If you quit, the game will end and you will get to keep your current coins.')){
      var url = makeURL();
      url += '/quit';
      $.ajax({url:url, type:'POST', data:{}, success:renderSnapshot});
    }
    event.preventDefault();
  }

  function revealAll(){
    if (gameInProgress){
      //one layer of anti-cheat protection here
      showStatusText('You are a very tricky player! No cheating for you, though.');
    } else {
      var url = makeURL();
      url += '/revealAll';
      $.ajax({url:url, type:'POST', data:{}, success:function(snapshot){
        $('#start-new-game').css('display', 'inline-block');
        $('#reveal-all').css('display', 'none');
        snapshot.revealAll = true;
        renderSnapshot(snapshot);
      }
      });
    }
    event.preventDefault();
  }

  /*******************************************
   * UTILITIES AND ANIMATION JUNK BELOW HERE *
   *******************************************/

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

  function showStatusText(text){
    $('#log').append(text + '\n');
  }

  function makeURL(){
    var url = window.location.origin.replace(/[0-9]{4}/, '4000');
    return url;
  }
})();

