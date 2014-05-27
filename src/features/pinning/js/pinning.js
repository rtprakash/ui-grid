(function () {
  'use strict';

  var module = angular.module('ui.grid.pinning', ['ui.grid']);

  module.directive('uiGrid', ['$log', 'GridRenderContainer', function ($log, GridRenderContainer) {
    return {
      priority: -1,
      require: 'uiGrid',
      scope: false,
      compile: function () {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {

            var pinColumnLeftAction = {
              title: 'Pin Left',
              action: function() {
                //alert(this.context.col.displayName);
                this.context.col.renderContainer = 'left';

                uiGridCtrl.refresh();
                // this.hideMenu();
              }
            };

            var pinColumnRightAction = {
              title: 'Pin Right',
              action: function() {
                //alert(this.context.col.displayName);
                this.context.col.renderContainer = 'right';
                
                uiGridCtrl.refresh();
                // this.hideMenu();
              }
            };

            function pinnableColumnBuilder(colDef, col, gridOptions) {
              col.enablePinning = (typeof(colDef.enablePinning) !== 'undefined' && colDef.enablePinning) ? colDef.enablePinning : gridOptions.enablePinning;

              col.menuItems.push(pinColumnLeftAction);
              col.menuItems.push(pinColumnRightAction);
            }

            // Register a column builder to add new menu items for pinning left and right
            uiGridCtrl.grid.registerColumnBuilder(pinnableColumnBuilder);

            uiGridCtrl.grid.renderContainers.left = new GridRenderContainer(uiGridCtrl.grid);
            uiGridCtrl.grid.renderContainers.right = new GridRenderContainer(uiGridCtrl.grid);
          }
        };
      }
    };
  }]);

  module.directive('uiGridBody', ['$log', '$compile', function ($log, $compile) {
    return {
      link: function ($scope, $elm, $attrs) {

        var left = angular.element('<div ui-grid-pinned-container="\'left\'"></div>');
        $elm.append(left);
        $compile(left)($scope);

        // var right = angular.element('<div ui-grid-pinned-container="\'right\'"></div>');
        // $compile(right)($scope);
        // $elm.append(right);
      }
    };
  }]);

  module.directive('uiGridPinnedContainer', ['$log', function ($log) {
    return {
      replace: true,
      template: '<div><div ui-grid-render-container="side" class="ui-grid-pinned-container left"></div></div>',
      scope: {
        side: '=uiGridPinnedContainer'
      },
      require: '^uiGrid',
      link: function ($scope, $elm, $attrs, uiGridCtrl) {
        $log.debug('ui-grid-pinned-container link');

        var grid = uiGridCtrl.grid;

        var myWidth = 0;

        function updateContainerDimensions() {
          $log.debug('update ' + $scope.side + ' dimensions');

          var ret = '';

          // Column containers
          if ($scope.side === 'left' || $scope.side === 'right') {
            var cols = grid.renderContainers[$scope.side].visibleColumnCache;
            var width = 0;
            for (var i in cols) {
              var col = cols[i];
              width += col.drawnWidth;
            }

            myWidth = width;

            // TODO(c0bra): Subtract sum of col widths from grid viewport width and update it

            ret += '.grid' + grid.id + ' .ui-grid-pinned-container.left { width: ' + myWidth + 'px; height: ' + grid.getViewportHeight() + 'px; } ';
          }

          return ret;
        }

         grid.registerViewportAdjuster(function (adjustment) {
          // Subtract our own width
          adjustment.width -= myWidth;

          return adjustment;
        });

        // Register style computation to adjust for columns in `side`'s render container
        grid.registerStyleComputation({
          priority: 15,
          func: updateContainerDimensions
        });
      }
    };
  }]);

  // module.directive('uiGridColumnMenu', ['$log', function ($log) {
  //   return {
  //     scope: false,
  //     priority: 10,
  //     require: 'uiGridColumnMenu',
  //     link: function ($scope, $elm, $attrs, colMenuCtrl) {
  //       $scope.$watch(function () { return colMenuCtrl.menuItems; }, function (n, o) {
  //         $log.debug('menu items', n);
  //       });
  //     }
  //   };
  // }]);

})();