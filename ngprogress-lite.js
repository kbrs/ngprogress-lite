/*
 * ngProgressLite - small && slim angular progressbars
 * http://github.com/voronianski/ngprogress-lite
 * Dmitri Voronianski http://pixelhunter.me
 * (c) 2013 MIT License
 */

(function(window, angular, _) {
  'use strict';

  angular.module('ngProgressLite', []).provider('ngProgressLite', function() {

    this.$get = ['$document',
      function($document) {
        return function(_container, _settings) {
          var settings = {
            minimum: _.random(0.01, 0.09),
            speed: _.random(100, 300),
            ease: 'ease',
            trickleRate: _.random(0.05, 0.09),
            trickleSpeed: _.random(100, 300),
            // Temporarily disable shadow as we can no longer assume that the area above the progress bar will be clipped
            // template: '<div class="ngProgressLite"><div class="ngProgressLiteBar"><div class="ngProgressLiteBarShadow"></div></div></div>'
            template: '<div class="ngProgressLite"><div class="ngProgressLiteBar"></div></div>'
          };
          var container = _container || $document.find('body');
          var $progressBarEl, status, cleanForElement;

          var privateMethods = {
            render: function() {
              if (this.isRendered()) {
                return $progressBarEl;
              }

              container.addClass('ngProgressLite-on');
              $progressBarEl = angular.element(settings.template);
              container.append($progressBarEl);
              cleanForElement = false;

              return $progressBarEl;
            },

            remove: function() {
              container.removeClass('ngProgressLite-on');
              $progressBarEl.remove();
              cleanForElement = true;
            },

            isRendered: function() {
              return $progressBarEl && $progressBarEl.children().length > 0 && !cleanForElement;
            },

            trickle: function() {
              var remaining = 100 - (status * 100);
              var inc = settings.trickleRate * Math.pow(1 - Math.sqrt(remaining), 2);
              return publicMethods.inc(inc/100);
            },

            clamp: function(num, min, max) {
              if (num < min) {
                return min;
              }
              if (num > max) {
                return max;
              }
              return num;
            },

            toBarPercents: function(num) {
              return num * 100;
            },

            positioning: function(num, speed, ease) {
              return {
                'width': this.toBarPercents(num) + '%',
                'transition': 'all ' + speed + 'ms ' + ease
              };
            }
          };

          var publicMethods = {
            set: function(num) {
              var $progress = privateMethods.render();

              num = privateMethods.clamp(num, settings.minimum, 1);
              status = (num === 1 ? null : num);

              setTimeout(function() {
                $progress.children().eq(0).css(privateMethods.positioning(num, settings.speed, settings.ease));
              }, 100);

              if (num === 1) {
                setTimeout(function() {
                  $progress.css({
                    'transition': 'all ' + settings.speed + 'ms linear',
                    'opacity': 0
                  });
                  setTimeout(function() {
                    privateMethods.remove();
                  }, settings.speed);
                }, settings.speed);
              }

              return publicMethods;
            },

            get: function() {
              return status;
            },

            start: function() {
              if (!status) {
                publicMethods.set(0);
              }

              var worker = function() {
                setTimeout(function() {
                  if (!status) {
                    return;
                  }
                  privateMethods.trickle();
                  worker();
                }, settings.trickleSpeed);
              };

              worker();
              return publicMethods;
            },

            inc: function(amount) {
              var n = status;

              if (!n) {
                return publicMethods.start();
              }

              if (typeof amount !== 'number') {
                amount = (1 - n) * privateMethods.clamp(Math.random() * n, 0.1, 0.95);
              }

              n = privateMethods.clamp(n + amount, 0, 0.994);
              return publicMethods.set(n);
            },

            done: function() {
              if (status) {
                publicMethods.inc(0.3 + 0.5 * Math.random()).set(1);
              }
            }
          };

          return publicMethods;
        };
      }
    ];
  });

})(window, window.angular, _);