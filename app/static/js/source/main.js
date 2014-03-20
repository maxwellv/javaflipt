(function(){

  'use strict';

  $(document).ready(initialize);

  function initialize(){
    $(document).foundation();
    $('#grid').on('click', '.card', flipCard);
  }

  function flipCard(){
    var self = this;
    $(self).animate({'top': '-=50px', 'opacity': '0.0', 'display': 'none'}, 200, 'linear', function(){
      $(self).hide();
    });
  }

})();

