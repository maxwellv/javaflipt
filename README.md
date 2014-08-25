##JavaFlipt
[![Build Status](https://travis-ci.org/maxwellv/javaflipt.svg)](https://travis-ci.org/maxwellv/javaflipt)[![Coverage Status](https://coveralls.io/repos/maxwellv/javaflipt/badge.png?branch=master)](https://coveralls.io/r/maxwellv/javaflipt?branch=master)[![Dependency Status](https://gemnasium.com/maxwellv/javaflipt.svg)](https://gemnasium.com/maxwellv/javaflipt)
============
JavaFlipt is a browser-based logic puzzle game. Taking cues from both classic nonogram puzzles and Minesweeper, JavaFlipt has you flipping cards and avoiding bombs on a five-by-five board. Use the indicators for each row and column to deduce the locations of all the bonus cards, then flip them to score the most points and advance to the next level. But watch out! If you find a bomb, you will score nothing for that board and will have to start again.

JavaFlipt is a remake of [an old minigame](http://bulbapedia.bulbagarden.net/wiki/Voltorb_Flip) present in the international releases of _Pokémon HeartGold and SoulSilver_. Maxwell Vance, the author of JavaFlipt, created the remake as a final project for [Nashville Software School](http://nashvillesoftwareschool.com). JavaFlipt makes heavy use of Node.js, performing all the game logic server-side, then displaying each player's game via client-side jQuery. MongoDB is used to store the registered players and their games in progress.

If you would like to play it, [JavaFlipt is online and playable right now](http://www.javaflipt.com/). You may also log in as example_user@example.com, with the password "example".
