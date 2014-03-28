/*
 * This file is intended entirely for storing the various difficulty levels of this game.
 * No actual logic exists here, just the lookups for difficulties.
 * You may change them if you really wish.
 *
 * Difficulties are stored in the following format: .bombs, .minOnes, .extraOnes.
 * Bombs is the number of bombs on each board. As far as I can tell, this is static for each difficulty.
 * minOnes is the lowest number of cards with a value of 1.
 * extraOnes determines the maximum number of ones on the board.
 * For example, in level 1, the minimum observed number of ones is 14 and the maximum is 16.
 * In this case, level 1 has .minOnes === 14 and .extraOnes === 3.
 * extraOnes is one higher due to the way math.random works. I really should refactor this at some point.
 * If you are modifying or adding difficulties, their placement in the array is important. The game explicitly references them by position, going up one when the player wins and down by a certain amount if the player loses.
 *
 * This still needs more data from the original game. Right now I've only conclusively got levels 1-3.
 */


'use strict';

var difficulties = [
  {bombs: 6, minOnes: 14, extraOnes: 3}, //level 1, index 0
  {bombs: 7, minOnes: 12, extraOnes: 4}, //level 2, index 1
  {bombs: 8, minOnes: 12, extraOnes: 3}, //level 3, index 2
  {bombs: 10, minOnes: 7, extraOnes: 3}  //cutting it off at level 4 since I don't have further data
];

module.exports = difficulties;
