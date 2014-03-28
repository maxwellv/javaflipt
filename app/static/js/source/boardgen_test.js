/* jshint unused:false */
//This script is just for testing the board generating logic in the console.
'use strict';












function generateBoard(difficulty){
  var board = [];
  //difficulty will have .bombs, .minOnes, .extraOnes
  //for level 3, these values will be 8, 10, 3
  for (var a = 1;a <= difficulty.bombs;a++){//bombs are fixed for each difficulty
    board.push('bomb');
  }
  var totalOnes = difficulty.minOnes + Math.floor(Math.random() * difficulty.extraOnes);
  //var maxOnes = difficulty.minOnes + difficulty.extraOnes - 1;
  //maybe I was going to use that for some other calculation?
  for (var b = 1;b <= totalOnes;b++){
    board.push('one');
  }
  var remainder = 25 - board.length;//the number of spaces remaining for twos and threes
  var minRemainder = 25 - (difficulty.bombs + difficulty.minOnes + difficulty.extraOnes - 1);//the highest possible value for remainder, if all the extraOnes are generated
  var maxRemainder = 25 - (difficulty.bombs + difficulty.minOnes);//the lowest value, if none of the extraOnes are generated
  //TODO: COLLECT MORE DATA FROM VOLTORB FLIP
  var weight = (remainder - minRemainder + 1) / (maxRemainder - minRemainder + 1);
  weight = Math.max(0.2, Math.min(0.8, weight)); //clamped weight between 20% and 80% to keep things reasonable, may change later
  for (var x = 0;x < remainder;x++){
    if (Math.random() > weight){ //effectively, weight is the chance of getting a three instead of a two
      board.push('three');       //a weight closer to 1.0 means more threes
    } else {                     //so a board with a greater remainder will have more twos, and a lower remainder will have more threes
      board.push('two');
    }
  }
  board = _.shuffle(board);
  return board;
}

function renderBoard(board){
  var bombs, ones, twos, threes;
  bombs = ones = twos = threes = 0;
  console.log('Your freshly-generated board:');
  var line = '';
  for (var x in board){
    switch (board[x]){
      case 'bomb':
        line += 'B ';
        bombs++;
        break;
      case 'one':
        line += '1 ';
        ones++;
        break;
      case 'two':
        line += '2 ';
        twos++;
        break;
      case 'three':
        line += '3 ';
        threes++;
        break;
    }
    if (line.length === 10){
      console.log(line);
      line = '';
    }
  }
  console.log('Ones:', ones, 'Twos:', twos, 'Threes:', threes, 'Bombs:', bombs);
}
