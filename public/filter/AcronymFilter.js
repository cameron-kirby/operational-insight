/**
 * Created by Xunrong Li on 8/3/15.
 */
(function () {
  'use strict';

  angular
    .module('ResrcUtilApp')
    .filter('acronym', acronymFilter);

  function acronymFilter() {
    var MAX_ACRONYM_SIZE = 4;
    var MIN_ACRONYM_SIZE = 1;

    var first = function firstLetter(word) {
      return (word !== null ? word[0] : '');
    };

    return function doAcronym(input, minLength) {
      var words;
      var min = minLength;
      if (min === null) {
        min = 1;
      }
      words = input.split(/[^A-Za-z]+/);
      if (words.length === MIN_ACRONYM_SIZE || words.length > MAX_ACRONYM_SIZE) {
        words = words[0].slice(0, 1).split('');
      }
      return words.map(first).join('').toUpperCase();
    };
  }
}());
