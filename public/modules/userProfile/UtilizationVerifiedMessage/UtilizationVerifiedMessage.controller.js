(function () {
  'use strict';


  angular.module('ResrcUtilApp.UserProfile')
    .controller('UtilizationVerifiedMessageController', UtilizationVerifiedMessageController);


  UtilizationVerifiedMessageController.$inject = [
    '$timeout'
  ];


  /**
   * This controller performs animates the drawing of the checkmark,
   * for the UtilizationVerifiedMessage directive.
   */
  function UtilizationVerifiedMessageController($timeout) {
    var animationSpeed;
    var canvas;

    activate();


    /**
     * Initializes the controller.
     */
    function activate() {
      var downLineCoordinates = {
        endX: 25,
        endY: 46,
        startX: 15,
        startY: 36
      };
      var upLineCoordinates = {
        endX: 48,
        endY: 22,
        startX: downLineCoordinates.endX,
        startY: downLineCoordinates.endY
      };

      var lineThicknessOffset;

      animationSpeed = 50;
      canvas = document.getElementsByTagName('canvas')[0].getContext('2d');

      // Setting up the canvas.
      canvas.lineWidth = 4;
      canvas.strokeStyle = '#04ab70';

      lineThicknessOffset = (canvas.lineWidth / 2);
      if (canvas.lineWidth % 2 > 0) {
        ++lineThicknessOffset;
      }

      $timeout(function () {
        drawLine(downLineCoordinates.startX,
          downLineCoordinates.startY,
          downLineCoordinates.endX,
          downLineCoordinates.endY,
          10);

        $timeout(function () {
          drawLine(upLineCoordinates.startX - lineThicknessOffset,
            upLineCoordinates.startY,
            upLineCoordinates.endX,
            upLineCoordinates.endY,
            20);
        }, 180);
      }, 500);
    }


    /**
     * Draws a line between two adjacent pixels.
     *
     * @param {Number} startX
     *    The x coordinate for the start of the line.
     * @param {Number} startY
     *    The y coordinate for the start of the line.
     * @param {Number} endX
     *    The x coordinate for the end of the line.
     * @param {Number} endY
     *    The y coordinate for the end of the line.
     */
    function animatePoint(startX, startY, endX, endY) {
      canvas.beginPath();
      canvas.moveTo(startX, startY);
      canvas.lineTo(endX, endY);
      canvas.stroke();
    }


    /**
     * Draws the line going down of the checkmark.
     *
     * @param {Number} startX
     *    The x coordinate for the start of the line.
     * @param {Number} startY
     *    The y coordinate for the start of the line.
     * @param {Number} endX
     *    The x coordinate for the end of the line.
     * @param {Number} endY
     *    The y coordinate for the end of the line.
     * @param {Number} increments
     *    The number of individual animations that occur when drawing this line.
     */
    function drawLine(startX, startY, endX, endY, increments) {
      var animatePointCallback;
      var iPoint;
      var currentX = startX;
      var currentY = startY;
      var incrementX = (endX - startX) / increments;
      var incrementY = (endY - startY) / increments;

      // Draw all but the final increment.
      for (iPoint = 0; iPoint < increments - 1; ++iPoint) {
        animatePointCallback = animatePoint.bind(null, currentX, currentY,
          currentX + incrementX, currentY + incrementY);
        $timeout(animatePointCallback, 1 + (iPoint * animationSpeed) / 3);
        currentX += incrementX;
        currentY += incrementY;
      }

      // Draw the final increment to ensure we don't get rounding errors for the end
      // coordinate.
      animatePointCallback = animatePoint.bind(null, currentX, currentY,
        endX, endY);
      $timeout(animatePointCallback, 1 + ((increments.length - 1) * animationSpeed) / 3);
    }
  }
}());
