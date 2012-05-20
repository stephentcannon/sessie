(function($){
  $.fn.reset = function(fn) {
  return fn ? this.bind("reset", fn) : this.trigger("reset");
  };
})(jQuery);