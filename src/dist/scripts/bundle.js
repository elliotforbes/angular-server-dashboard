if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports){
  module.exports = 'highcharts-ng';
}

(function () {
  'use strict';
  /*global angular: false, Highcharts: false */


  angular.module('highcharts-ng', [])
    .factory('highchartsNG', ['$q', '$window', highchartsNG])
    .directive('highchart', ['highchartsNG', '$timeout', highchart]);

  //IE8 support
  function indexOf(arr, find, i /*opt*/) {
    if (i === undefined) i = 0;
    if (i < 0) i += arr.length;
    if (i < 0) i = 0;
    for (var n = arr.length; i < n; i++)
      if (i in arr && arr[i] === find)
        return i;
    return -1;
  }

  function prependMethod(obj, method, func) {
    var original = obj[method];
    obj[method] = function () {
      var args = Array.prototype.slice.call(arguments);
      func.apply(this, args);
      if (original) {
        return original.apply(this, args);
      } else {
        return;
      }

    };
  }

  function deepExtend(destination, source) {
    //Slightly strange behaviour in edge cases (e.g. passing in non objects)
    //But does the job for current use cases.
    if (angular.isArray(source)) {
      destination = angular.isArray(destination) ? destination : [];
      for (var i = 0; i < source.length; i++) {
        destination[i] = deepExtend(destination[i] || {}, source[i]);
      }
    } else if (angular.isObject(source)) {
      destination = angular.isObject(destination) ? destination : {};
      for (var property in source) {
        destination[property] = deepExtend(destination[property] || {}, source[property]);
      }
    } else {
      destination = source;
    }
    return destination;
  }

  function highchartsNG($q, $window) {
    var highchartsProm = $q.when($window.Highcharts);

    function getHighchartsOnce() {
      return highchartsProm;
    }

    return {
      getHighcharts: getHighchartsOnce,
      ready: function ready(callback, thisArg) {
        getHighchartsOnce().then(function() {
          callback.call(thisArg);
        });
      }
    };
  }

  function highchart(highchartsNGUtils, $timeout) {

    // acceptable shared state
    var seriesId = 0;
    var ensureIds = function (series) {
      var changed = false;
      angular.forEach(series, function(s) {
        if (!angular.isDefined(s.id)) {
          s.id = 'series-' + seriesId++;
          changed = true;
        }
      });
      return changed;
    };

    // immutable
    var axisNames = [ 'xAxis', 'yAxis' ];
    var chartTypeMap = {
      'stock': 'StockChart',
      'map':   'Map',
      'chart': 'Chart'
    };

    var getMergedOptions = function (scope, element, config) {
      var mergedOptions = {};

      var defaultOptions = {
        chart: {
          events: {}
        },
        title: {},
        subtitle: {},
        series: [],
        credits: {},
        plotOptions: {},
        navigator: {enabled: false},
        xAxis: {
          events: {}
        },
        yAxis: {
          events: {}
        }
      };

      if (config.options) {
        mergedOptions = deepExtend(defaultOptions, config.options);
      } else {
        mergedOptions = defaultOptions;
      }
      mergedOptions.chart.renderTo = element[0];

      angular.forEach(axisNames, function(axisName) {
        if(angular.isDefined(config[axisName])) {
          mergedOptions[axisName] = deepExtend(mergedOptions[axisName] || {}, config[axisName]);

          if(angular.isDefined(config[axisName].currentMin) ||
              angular.isDefined(config[axisName].currentMax)) {

            prependMethod(mergedOptions.chart.events, 'selection', function(e){
              var thisChart = this;
              if (e[axisName]) {
                scope.$apply(function () {
                  scope.config[axisName].currentMin = e[axisName][0].min;
                  scope.config[axisName].currentMax = e[axisName][0].max;
                });
              } else {
                //handle reset button - zoom out to all
                scope.$apply(function () {
                  scope.config[axisName].currentMin = thisChart[axisName][0].dataMin;
                  scope.config[axisName].currentMax = thisChart[axisName][0].dataMax;
                });
              }
            });

            prependMethod(mergedOptions.chart.events, 'addSeries', function(e){
              scope.config[axisName].currentMin = this[axisName][0].min || scope.config[axisName].currentMin;
              scope.config[axisName].currentMax = this[axisName][0].max || scope.config[axisName].currentMax;
            });
            prependMethod(mergedOptions[axisName].events, 'setExtremes', function (e) {
              if (e.trigger && e.trigger !== 'zoom') { // zoom trigger is handled by selection event
                $timeout(function () {
                  scope.config[axisName].currentMin = e.min;
                  scope.config[axisName].currentMax = e.max;
                  scope.config[axisName].min = e.min; // set min and max to adjust scrollbar/navigator
                  scope.config[axisName].max = e.max;
                }, 0);
              }
            });
          }
        }
      });

      if(config.title) {
        mergedOptions.title = config.title;
      }
      if (config.subtitle) {
        mergedOptions.subtitle = config.subtitle;
      }
      if (config.credits) {
        mergedOptions.credits = config.credits;
      }
      if(config.size) {
        if (config.size.width) {
          mergedOptions.chart.width = config.size.width;
        }
        if (config.size.height) {
          mergedOptions.chart.height = config.size.height;
        }
      }
      return mergedOptions;
    };

    var updateZoom = function (axis, modelAxis) {
      var extremes = axis.getExtremes();
      if(modelAxis.currentMin !== extremes.dataMin || modelAxis.currentMax !== extremes.dataMax) {
        if (axis.setExtremes) {
          axis.setExtremes(modelAxis.currentMin, modelAxis.currentMax, false);
        } else {
          axis.detachedsetExtremes(modelAxis.currentMin, modelAxis.currentMax, false);
        }
      }
    };

    var processExtremes = function(chart, axis, axisName) {
      if(axis.currentMin || axis.currentMax) {
        chart[axisName][0].setExtremes(axis.currentMin, axis.currentMax, true);
      }
    };

    var chartOptionsWithoutEasyOptions = function (options) {
      return angular.extend(
        deepExtend({}, options),
        { data: null, visible: null }
      );
    };

    var getChartType = function(scope) {
      if (scope.config === undefined) return 'Chart';
      return chartTypeMap[('' + scope.config.chartType).toLowerCase()] ||
             (scope.config.useHighStocks ? 'StockChart' : 'Chart');
    };

    function linkWithHighcharts(Highcharts, scope, element, attrs) {
      // We keep some chart-specific variables here as a closure
      // instead of storing them on 'scope'.

      // prevSeriesOptions is maintained by processSeries
      var prevSeriesOptions = {};
      // chart is maintained by initChart
      var chart = false;

      var processSeries = function(series, seriesOld) {
        var i;
        var ids = [];

        if(series) {
          var setIds = ensureIds(series);
          if(setIds && !scope.disableDataWatch) {
            //If we have set some ids this will trigger another digest cycle.
            //In this scenario just return early and let the next cycle take care of changes
            return false;
          }

          //Find series to add or update
          angular.forEach(series, function(s, idx) {
            ids.push(s.id);
            var chartSeries = chart.get(s.id);
            if (chartSeries) {
              if (!angular.equals(prevSeriesOptions[s.id], chartOptionsWithoutEasyOptions(s))) {
                chartSeries.update(angular.copy(s), false);
              } else {
                if (s.visible !== undefined && chartSeries.visible !== s.visible) {
                  chartSeries.setVisible(s.visible, false);
                }
                
                // Make sure the current series index can be accessed in seriesOld
                if (idx < seriesOld.length) {
                  var sOld = seriesOld[idx];
                  var sCopy = angular.copy(sOld);
                  
                  // Get the latest data point from the new series
                  var ptNew = s.data[s.data.length - 1];
                  
                  // Check if the new and old series are identical with the latest data point added
                  // If so, call addPoint without shifting
                  sCopy.data.push(ptNew);
                  if (angular.equals(sCopy, s)) {
                    chartSeries.addPoint(ptNew, false);
                  }
                  
                  // Check if the data change was a push and shift operation
                  // If so, call addPoint WITH shifting
                  else {
                    sCopy.data.shift();
                    if (angular.equals(sCopy, s)) {
                      chartSeries.addPoint(ptNew, false, true);
                    }
                    else {
                      chartSeries.setData(angular.copy(s.data), false);
                    }
                  }
                }
                else {
                  chartSeries.setData(angular.copy(s.data), false);
                }
              }
            } else {
              chart.addSeries(angular.copy(s), false);
            }
            prevSeriesOptions[s.id] = chartOptionsWithoutEasyOptions(s);
          });

          //  Shows no data text if all series are empty
          if(scope.config.noData) {
            var chartContainsData = false;

            for(i = 0; i < series.length; i++) {
              if (series[i].data && series[i].data.length > 0) {
                chartContainsData = true;

                break;
              }
            }

            if (!chartContainsData) {
              chart.showLoading(scope.config.noData);
            } else {
              chart.hideLoading();
            }
          }
        }

        //Now remove any missing series
        for(i = chart.series.length - 1; i >= 0; i--) {
          var s = chart.series[i];
          if (s.options.id !== 'highcharts-navigator-series' && indexOf(ids, s.options.id) < 0) {
            s.remove(false);
          }
        }

        return true;
      };

      var initChart = function() {
        if (chart) chart.destroy();
        prevSeriesOptions = {};
        var config = scope.config || {};
        var mergedOptions = getMergedOptions(scope, element, config);
        var func = config.func || undefined;
        var chartType = getChartType(scope);

        chart = new Highcharts[chartType](mergedOptions, func);

        for (var i = 0; i < axisNames.length; i++) {
          if (config[axisNames[i]]) {
            processExtremes(chart, config[axisNames[i]], axisNames[i]);
          }
        }
        if(config.loading) {
          chart.showLoading();
        }
        config.getHighcharts = function() {
          return chart;
        };

      };
      initChart();


      if(scope.disableDataWatch){
        scope.$watchCollection('config.series', function (newSeries, oldSeries) {
          processSeries(newSeries);
          chart.redraw();
        });
      } else {
        scope.$watch('config.series', function (newSeries, oldSeries) {
          var needsRedraw = processSeries(newSeries, oldSeries);
          if(needsRedraw) {
            chart.redraw();
          }
        }, true);
      }

      scope.$watch('config.title', function (newTitle) {
        chart.setTitle(newTitle, true);
      }, true);

      scope.$watch('config.subtitle', function (newSubtitle) {
        chart.setTitle(true, newSubtitle);
      }, true);

      scope.$watch('config.loading', function (loading) {
        if(loading) {
          chart.showLoading(loading === true ? null : loading);
        } else {
          chart.hideLoading();
        }
      });
      scope.$watch('config.noData', function (noData) {
        if(scope.config && scope.config.loading) {
          chart.showLoading(noData);
        }
      }, true);

      scope.$watch('config.credits.enabled', function (enabled) {
        if (enabled) {
          chart.credits.show();
        } else if (chart.credits) {
          chart.credits.hide();
        }
      });

      scope.$watch(getChartType, function (chartType, oldChartType) {
        if (chartType === oldChartType) return;
        initChart();
      });

      angular.forEach(axisNames, function(axisName) {
        scope.$watch('config.' + axisName, function(newAxes) {
          if (!newAxes) {
            return;
          }

          if (angular.isArray(newAxes)) {

            for (var axisIndex = 0; axisIndex < newAxes.length; axisIndex++) {
              var axis = newAxes[axisIndex];

              if (axisIndex < chart[axisName].length) {
                chart[axisName][axisIndex].update(axis, false);
                updateZoom(chart[axisName][axisIndex], angular.copy(axis));
              }

            }

          } else {
            // update single axis
            chart[axisName][0].update(newAxes, false);
            updateZoom(chart[axisName][0], angular.copy(newAxes));
          }

          chart.redraw();
        }, true);
      });
      scope.$watch('config.options', function (newOptions, oldOptions, scope) {
        //do nothing when called on registration
        if (newOptions === oldOptions) return;
        initChart();
        processSeries(scope.config.series);
        chart.redraw();
      }, true);

      scope.$watch('config.size', function (newSize, oldSize) {
        if(newSize === oldSize) return;
        if(newSize) {
          chart.setSize(newSize.width || chart.chartWidth, newSize.height || chart.chartHeight);
        }
      }, true);

      scope.$on('highchartsng.reflow', function () {
        chart.reflow();
      });

      scope.$on('$destroy', function() {
        if (chart) {
          try{
            chart.destroy();
          }catch(ex){
            // fail silently as highcharts will throw exception if element doesn't exist
          }

          $timeout(function(){
            element.remove();
          }, 0);
        }
      });
    }

    function link(scope, element, attrs) {
      function highchartsCb(Highcharts) {
        linkWithHighcharts(Highcharts, scope, element, attrs);
      }
      highchartsNGUtils
        .getHighcharts()
        .then(highchartsCb);
    }

    return {
      restrict: 'EAC',
      replace: true,
      template: '<div></div>',
      scope: {
        config: '=',
        disableDataWatch: '='
      },
      link: link
    };
  }
}());

angular.module('root', [
        'ngRoute',
         'highcharts-ng'
    ]);

function routeProvider($routeProvider){
    $routeProvider
      .when('/', {
          template: '<dashboard></dashboard>'
      });
}
routeProvider.$inject = ['$routeProvider'];

angular.module('root')
  .config(routeProvider);

function StatsService() {
    var service = {};

    var connection = new WebSocket('ws://localhost:9000/stats');

    var messageQueue = [];

    connection.onopen = function(){  
        console.log("Socket has been opened!");  
    };

    connection.onmessage = function (e) {
        console.log("Server: " + e);
        this.messageQueue.push(e);
    };

    return service;
}

angular.module('root')
    .factory('StatsService', StatsService);
var topNav = {
    templateUrl: './app/common/top-nav/top-nav.html'
}

angular.module('root')
    .component('topNav', topNav);

var dashboard = {
    templateUrl: './app/components/dashboard/dashboard.html',
    controller: DashboardController,
    bindings: {
        stats: '<',
        memAlert: '<'
   }
}

angular.module('root')
    .component('dashboard', dashboard);

function DashboardController() {
    var ctrl = this;

    ctrl.$onInit = function() {
        ctrl.memAlert = false;
    }

}

angular.module('root')
    .controller('DashboardController', DashboardController);

var cpuUsage = {
    templateUrl: 'app/components/dashboard/cpu-widget/cpu-widget.html',
    controller: CpuWidgetController,
    bindings: {
        usage: '<',
        series: '<',
        labels: '<',
        data: '<',
        options: '<'
    }
}

angular.module('root')
    .component('cpuUsage', cpuUsage);
function CpuWidgetController(StatsService, $log, $timeout, $scope) {
    var ctrl = this;

    $scope.chartConfig = {
        options: {
            chart: {
                type: 'area'
            }
        },
        title: {
            text: 'CPU Usage - Last 60 Minutes'
        },
        series: [{
            name: 'Usage (%)',
            data: [10, 15, 12, 8, 7]
        }],
        title: {
            text: 'Hello'
        },

        loading: false
    }

}

CpuWidgetController.$inject = ['StatsService', '$log', '$timeout', '$scope'];

angular.module('root')
    .controller('CpuWidgetController', CpuWidgetController);
var diskUsage = {
    templateUrl: 'app/components/dashboard/disk-widget/disk-widget.html',
    controller: DiskWidgetController,
    bindings : {
        usage : '<',
        series: '<',
        labels: '<',
        data: '<',
        options: '<'
    }
}

angular.module('root')
    .component('diskUsage', diskUsage);
function DiskWidgetController(StatsService, $log, $timeout, $scope) {
    var ctrl = this;

    $scope.chartConfig = {
        options: {
            chart: {
                type: 'area'
            }
        },
        series: [
            {
                data: [29.9, 29.3, 31.0, 32]
            },
            {
                data: [3.4, 5.3, 5.8, 6.3]
            },
            {
                data: [5.8, 12.3, 16.4, 20.1]
            }
        ],
        xAxis: {
            categories: ['-4', '-3', '-2', '-1']
        },
        title: {
            text: 'Disk Usage - 4 Weeks'
        },

        loading: false
    }
}

DiskWidgetController.$inject = ['StatsService', '$log', '$timeout', '$scope'];

angular.module('root')
    .controller('DiskWidgetController', DiskWidgetController);
    
var memUsage = {
    templateUrl: 'app/components/dashboard/mem-widget/mem-widget.html',
    controller: MemWidgetController,
    bindings: {
        usage: '<',
        series: '<',
        labels: '<',
        data: '<',
        options: '<'
    }
}

angular.module('root')
    .component('memUsage', memUsage);

function MemWidgetController(StatsService, $log, $timeout, $scope) {
    var ctrl = this;

    $scope.chartConfig = {
        options: {
            chart: {
                type: 'area'
            }
        },

        title: {
            text: 'Memory Usage'
        },

        loading: false,

        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },

        series: [{
            data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
        }]
    };

}

MemWidgetController.$inject = ['StatsService', '$log', '$timeout', '$scope'];

angular.module('root')
    .controller('MemWidgetController', MemWidgetController);
    
var networkUsage = {
    templateUrl: 'app/components/dashboard/network-usage/network-usage.html',
    controller: NetworkUsageController,
    bindings: {
        usage: '<',
        series: '<',
        labels: '<',
        data: '<',
        options: '<'
    }
}

angular.module('root')
    .component('networkUsage', networkUsage);
    
function NetworkUsageController(StatsService, $log, $timeout, $scope) {
    var ctrl = this;

    $scope.chartConfig = {
        options: {
            chart: {
                type: 'area'
            }
        },

        title: {
            text: 'Network Usage - Last 60 Minutes'
        },
        yAxis: {
            title: {
                text: 'Throughput MBit/s'
            }
        },
        xAxis: {
            title: {
                text: 'Minutes'
            },
            categories: ['-55', '-50', '-45', '-40', '-35', '-30', 
                '-25', '-20', '-15', '-10', '-05', '0']
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: true
            }
        },
        series: [
            {   
                name: 'Inbound',
                data: [29.9, 71.5, 25.4, 43.2, 37.0, 33.0, 35.6, 48.5, 21.4, 19.1, 16.6, 54.4]
            },
            {
                name: 'Outbound',
                data: [19.3, 56.3, 23.1, 38.5, 32.9, 27.0, 30.6, 42.3, 17.4, 12.0, 9.1, 34.0]
            }
        ]
    };

    ctrl.poll = function() {
        $timeout(function() {
            ctrl.poll();
        }, 2000);
    }

    ctrl.$onInit = function() {
        ctrl.poll();
    };

}

NetworkUsageController.$inject = ['StatsService', '$log', '$timeout', '$scope'];

angular.module('root')
    .controller('NetworkUsageController', NetworkUsageController);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhpZ2hjaGFydHMtbmcuanMiLCJyb290Lm1vZHVsZS5qcyIsInJvb3Qucm91dGVzLmpzIiwic3RhdHMuc2VydmljZS5qcyIsImNvbW1vbi90b3AtbmF2L3RvcC1uYXYuY29tcG9uZW50LmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvZGFzaGJvYXJkLmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvZGFzaGJvYXJkL2Rhc2hib2FyZC5jb250cm9sbGVyLmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvY3B1LXdpZGdldC9jcHUtd2lkZ2V0LmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvZGFzaGJvYXJkL2NwdS13aWRnZXQvY3B1LXdpZGdldC5jb250cm9sbGVyLmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvZGlzay13aWRnZXQvZGlzay13aWRnZXQuY29tcG9uZW50LmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvZGlzay13aWRnZXQvZGlzay13aWRnZXQuY29udHJvbGxlci5qcyIsImNvbXBvbmVudHMvZGFzaGJvYXJkL21lbS13aWRnZXQvbWVtLXdpZGdldC5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9tZW0td2lkZ2V0L21lbS13aWRnZXQuY29udHJvbGxlci5qcyIsImNvbXBvbmVudHMvZGFzaGJvYXJkL25ldHdvcmstdXNhZ2UvbmV0d29yay11c2FnZS5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9uZXR3b3JrLXVzYWdlL25ldHdvcmstdXNhZ2UuY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6ZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMgPT09IGV4cG9ydHMpe1xuICBtb2R1bGUuZXhwb3J0cyA9ICdoaWdoY2hhcnRzLW5nJztcbn1cblxuKGZ1bmN0aW9uICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICAvKmdsb2JhbCBhbmd1bGFyOiBmYWxzZSwgSGlnaGNoYXJ0czogZmFsc2UgKi9cblxuXG4gIGFuZ3VsYXIubW9kdWxlKCdoaWdoY2hhcnRzLW5nJywgW10pXG4gICAgLmZhY3RvcnkoJ2hpZ2hjaGFydHNORycsIFsnJHEnLCAnJHdpbmRvdycsIGhpZ2hjaGFydHNOR10pXG4gICAgLmRpcmVjdGl2ZSgnaGlnaGNoYXJ0JywgWydoaWdoY2hhcnRzTkcnLCAnJHRpbWVvdXQnLCBoaWdoY2hhcnRdKTtcblxuICAvL0lFOCBzdXBwb3J0XG4gIGZ1bmN0aW9uIGluZGV4T2YoYXJyLCBmaW5kLCBpIC8qb3B0Ki8pIHtcbiAgICBpZiAoaSA9PT0gdW5kZWZpbmVkKSBpID0gMDtcbiAgICBpZiAoaSA8IDApIGkgKz0gYXJyLmxlbmd0aDtcbiAgICBpZiAoaSA8IDApIGkgPSAwO1xuICAgIGZvciAodmFyIG4gPSBhcnIubGVuZ3RoOyBpIDwgbjsgaSsrKVxuICAgICAgaWYgKGkgaW4gYXJyICYmIGFycltpXSA9PT0gZmluZClcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJlcGVuZE1ldGhvZChvYmosIG1ldGhvZCwgZnVuYykge1xuICAgIHZhciBvcmlnaW5hbCA9IG9ialttZXRob2RdO1xuICAgIG9ialttZXRob2RdID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIGlmIChvcmlnaW5hbCkge1xuICAgICAgICByZXR1cm4gb3JpZ2luYWwuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gZGVlcEV4dGVuZChkZXN0aW5hdGlvbiwgc291cmNlKSB7XG4gICAgLy9TbGlnaHRseSBzdHJhbmdlIGJlaGF2aW91ciBpbiBlZGdlIGNhc2VzIChlLmcuIHBhc3NpbmcgaW4gbm9uIG9iamVjdHMpXG4gICAgLy9CdXQgZG9lcyB0aGUgam9iIGZvciBjdXJyZW50IHVzZSBjYXNlcy5cbiAgICBpZiAoYW5ndWxhci5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIGRlc3RpbmF0aW9uID0gYW5ndWxhci5pc0FycmF5KGRlc3RpbmF0aW9uKSA/IGRlc3RpbmF0aW9uIDogW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvdXJjZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBkZXN0aW5hdGlvbltpXSA9IGRlZXBFeHRlbmQoZGVzdGluYXRpb25baV0gfHwge30sIHNvdXJjZVtpXSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChhbmd1bGFyLmlzT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIGRlc3RpbmF0aW9uID0gYW5ndWxhci5pc09iamVjdChkZXN0aW5hdGlvbikgPyBkZXN0aW5hdGlvbiA6IHt9O1xuICAgICAgZm9yICh2YXIgcHJvcGVydHkgaW4gc291cmNlKSB7XG4gICAgICAgIGRlc3RpbmF0aW9uW3Byb3BlcnR5XSA9IGRlZXBFeHRlbmQoZGVzdGluYXRpb25bcHJvcGVydHldIHx8IHt9LCBzb3VyY2VbcHJvcGVydHldKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZGVzdGluYXRpb24gPSBzb3VyY2U7XG4gICAgfVxuICAgIHJldHVybiBkZXN0aW5hdGlvbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhpZ2hjaGFydHNORygkcSwgJHdpbmRvdykge1xuICAgIHZhciBoaWdoY2hhcnRzUHJvbSA9ICRxLndoZW4oJHdpbmRvdy5IaWdoY2hhcnRzKTtcblxuICAgIGZ1bmN0aW9uIGdldEhpZ2hjaGFydHNPbmNlKCkge1xuICAgICAgcmV0dXJuIGhpZ2hjaGFydHNQcm9tO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBnZXRIaWdoY2hhcnRzOiBnZXRIaWdoY2hhcnRzT25jZSxcbiAgICAgIHJlYWR5OiBmdW5jdGlvbiByZWFkeShjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgICBnZXRIaWdoY2hhcnRzT25jZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhpZ2hjaGFydChoaWdoY2hhcnRzTkdVdGlscywgJHRpbWVvdXQpIHtcblxuICAgIC8vIGFjY2VwdGFibGUgc2hhcmVkIHN0YXRlXG4gICAgdmFyIHNlcmllc0lkID0gMDtcbiAgICB2YXIgZW5zdXJlSWRzID0gZnVuY3Rpb24gKHNlcmllcykge1xuICAgICAgdmFyIGNoYW5nZWQgPSBmYWxzZTtcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChzZXJpZXMsIGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgaWYgKCFhbmd1bGFyLmlzRGVmaW5lZChzLmlkKSkge1xuICAgICAgICAgIHMuaWQgPSAnc2VyaWVzLScgKyBzZXJpZXNJZCsrO1xuICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBjaGFuZ2VkO1xuICAgIH07XG5cbiAgICAvLyBpbW11dGFibGVcbiAgICB2YXIgYXhpc05hbWVzID0gWyAneEF4aXMnLCAneUF4aXMnIF07XG4gICAgdmFyIGNoYXJ0VHlwZU1hcCA9IHtcbiAgICAgICdzdG9jayc6ICdTdG9ja0NoYXJ0JyxcbiAgICAgICdtYXAnOiAgICdNYXAnLFxuICAgICAgJ2NoYXJ0JzogJ0NoYXJ0J1xuICAgIH07XG5cbiAgICB2YXIgZ2V0TWVyZ2VkT3B0aW9ucyA9IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgY29uZmlnKSB7XG4gICAgICB2YXIgbWVyZ2VkT3B0aW9ucyA9IHt9O1xuXG4gICAgICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICAgIGNoYXJ0OiB7XG4gICAgICAgICAgZXZlbnRzOiB7fVxuICAgICAgICB9LFxuICAgICAgICB0aXRsZToge30sXG4gICAgICAgIHN1YnRpdGxlOiB7fSxcbiAgICAgICAgc2VyaWVzOiBbXSxcbiAgICAgICAgY3JlZGl0czoge30sXG4gICAgICAgIHBsb3RPcHRpb25zOiB7fSxcbiAgICAgICAgbmF2aWdhdG9yOiB7ZW5hYmxlZDogZmFsc2V9LFxuICAgICAgICB4QXhpczoge1xuICAgICAgICAgIGV2ZW50czoge31cbiAgICAgICAgfSxcbiAgICAgICAgeUF4aXM6IHtcbiAgICAgICAgICBldmVudHM6IHt9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGlmIChjb25maWcub3B0aW9ucykge1xuICAgICAgICBtZXJnZWRPcHRpb25zID0gZGVlcEV4dGVuZChkZWZhdWx0T3B0aW9ucywgY29uZmlnLm9wdGlvbnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWVyZ2VkT3B0aW9ucyA9IGRlZmF1bHRPcHRpb25zO1xuICAgICAgfVxuICAgICAgbWVyZ2VkT3B0aW9ucy5jaGFydC5yZW5kZXJUbyA9IGVsZW1lbnRbMF07XG5cbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChheGlzTmFtZXMsIGZ1bmN0aW9uKGF4aXNOYW1lKSB7XG4gICAgICAgIGlmKGFuZ3VsYXIuaXNEZWZpbmVkKGNvbmZpZ1theGlzTmFtZV0pKSB7XG4gICAgICAgICAgbWVyZ2VkT3B0aW9uc1theGlzTmFtZV0gPSBkZWVwRXh0ZW5kKG1lcmdlZE9wdGlvbnNbYXhpc05hbWVdIHx8IHt9LCBjb25maWdbYXhpc05hbWVdKTtcblxuICAgICAgICAgIGlmKGFuZ3VsYXIuaXNEZWZpbmVkKGNvbmZpZ1theGlzTmFtZV0uY3VycmVudE1pbikgfHxcbiAgICAgICAgICAgICAgYW5ndWxhci5pc0RlZmluZWQoY29uZmlnW2F4aXNOYW1lXS5jdXJyZW50TWF4KSkge1xuXG4gICAgICAgICAgICBwcmVwZW5kTWV0aG9kKG1lcmdlZE9wdGlvbnMuY2hhcnQuZXZlbnRzLCAnc2VsZWN0aW9uJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgIHZhciB0aGlzQ2hhcnQgPSB0aGlzO1xuICAgICAgICAgICAgICBpZiAoZVtheGlzTmFtZV0pIHtcbiAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgc2NvcGUuY29uZmlnW2F4aXNOYW1lXS5jdXJyZW50TWluID0gZVtheGlzTmFtZV1bMF0ubWluO1xuICAgICAgICAgICAgICAgICAgc2NvcGUuY29uZmlnW2F4aXNOYW1lXS5jdXJyZW50TWF4ID0gZVtheGlzTmFtZV1bMF0ubWF4O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vaGFuZGxlIHJlc2V0IGJ1dHRvbiAtIHpvb20gb3V0IHRvIGFsbFxuICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICBzY29wZS5jb25maWdbYXhpc05hbWVdLmN1cnJlbnRNaW4gPSB0aGlzQ2hhcnRbYXhpc05hbWVdWzBdLmRhdGFNaW47XG4gICAgICAgICAgICAgICAgICBzY29wZS5jb25maWdbYXhpc05hbWVdLmN1cnJlbnRNYXggPSB0aGlzQ2hhcnRbYXhpc05hbWVdWzBdLmRhdGFNYXg7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBwcmVwZW5kTWV0aG9kKG1lcmdlZE9wdGlvbnMuY2hhcnQuZXZlbnRzLCAnYWRkU2VyaWVzJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgIHNjb3BlLmNvbmZpZ1theGlzTmFtZV0uY3VycmVudE1pbiA9IHRoaXNbYXhpc05hbWVdWzBdLm1pbiB8fCBzY29wZS5jb25maWdbYXhpc05hbWVdLmN1cnJlbnRNaW47XG4gICAgICAgICAgICAgIHNjb3BlLmNvbmZpZ1theGlzTmFtZV0uY3VycmVudE1heCA9IHRoaXNbYXhpc05hbWVdWzBdLm1heCB8fCBzY29wZS5jb25maWdbYXhpc05hbWVdLmN1cnJlbnRNYXg7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHByZXBlbmRNZXRob2QobWVyZ2VkT3B0aW9uc1theGlzTmFtZV0uZXZlbnRzLCAnc2V0RXh0cmVtZXMnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICBpZiAoZS50cmlnZ2VyICYmIGUudHJpZ2dlciAhPT0gJ3pvb20nKSB7IC8vIHpvb20gdHJpZ2dlciBpcyBoYW5kbGVkIGJ5IHNlbGVjdGlvbiBldmVudFxuICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgIHNjb3BlLmNvbmZpZ1theGlzTmFtZV0uY3VycmVudE1pbiA9IGUubWluO1xuICAgICAgICAgICAgICAgICAgc2NvcGUuY29uZmlnW2F4aXNOYW1lXS5jdXJyZW50TWF4ID0gZS5tYXg7XG4gICAgICAgICAgICAgICAgICBzY29wZS5jb25maWdbYXhpc05hbWVdLm1pbiA9IGUubWluOyAvLyBzZXQgbWluIGFuZCBtYXggdG8gYWRqdXN0IHNjcm9sbGJhci9uYXZpZ2F0b3JcbiAgICAgICAgICAgICAgICAgIHNjb3BlLmNvbmZpZ1theGlzTmFtZV0ubWF4ID0gZS5tYXg7XG4gICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmKGNvbmZpZy50aXRsZSkge1xuICAgICAgICBtZXJnZWRPcHRpb25zLnRpdGxlID0gY29uZmlnLnRpdGxlO1xuICAgICAgfVxuICAgICAgaWYgKGNvbmZpZy5zdWJ0aXRsZSkge1xuICAgICAgICBtZXJnZWRPcHRpb25zLnN1YnRpdGxlID0gY29uZmlnLnN1YnRpdGxlO1xuICAgICAgfVxuICAgICAgaWYgKGNvbmZpZy5jcmVkaXRzKSB7XG4gICAgICAgIG1lcmdlZE9wdGlvbnMuY3JlZGl0cyA9IGNvbmZpZy5jcmVkaXRzO1xuICAgICAgfVxuICAgICAgaWYoY29uZmlnLnNpemUpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5zaXplLndpZHRoKSB7XG4gICAgICAgICAgbWVyZ2VkT3B0aW9ucy5jaGFydC53aWR0aCA9IGNvbmZpZy5zaXplLndpZHRoO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb25maWcuc2l6ZS5oZWlnaHQpIHtcbiAgICAgICAgICBtZXJnZWRPcHRpb25zLmNoYXJ0LmhlaWdodCA9IGNvbmZpZy5zaXplLmhlaWdodDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG1lcmdlZE9wdGlvbnM7XG4gICAgfTtcblxuICAgIHZhciB1cGRhdGVab29tID0gZnVuY3Rpb24gKGF4aXMsIG1vZGVsQXhpcykge1xuICAgICAgdmFyIGV4dHJlbWVzID0gYXhpcy5nZXRFeHRyZW1lcygpO1xuICAgICAgaWYobW9kZWxBeGlzLmN1cnJlbnRNaW4gIT09IGV4dHJlbWVzLmRhdGFNaW4gfHwgbW9kZWxBeGlzLmN1cnJlbnRNYXggIT09IGV4dHJlbWVzLmRhdGFNYXgpIHtcbiAgICAgICAgaWYgKGF4aXMuc2V0RXh0cmVtZXMpIHtcbiAgICAgICAgICBheGlzLnNldEV4dHJlbWVzKG1vZGVsQXhpcy5jdXJyZW50TWluLCBtb2RlbEF4aXMuY3VycmVudE1heCwgZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGF4aXMuZGV0YWNoZWRzZXRFeHRyZW1lcyhtb2RlbEF4aXMuY3VycmVudE1pbiwgbW9kZWxBeGlzLmN1cnJlbnRNYXgsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgcHJvY2Vzc0V4dHJlbWVzID0gZnVuY3Rpb24oY2hhcnQsIGF4aXMsIGF4aXNOYW1lKSB7XG4gICAgICBpZihheGlzLmN1cnJlbnRNaW4gfHwgYXhpcy5jdXJyZW50TWF4KSB7XG4gICAgICAgIGNoYXJ0W2F4aXNOYW1lXVswXS5zZXRFeHRyZW1lcyhheGlzLmN1cnJlbnRNaW4sIGF4aXMuY3VycmVudE1heCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBjaGFydE9wdGlvbnNXaXRob3V0RWFzeU9wdGlvbnMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgcmV0dXJuIGFuZ3VsYXIuZXh0ZW5kKFxuICAgICAgICBkZWVwRXh0ZW5kKHt9LCBvcHRpb25zKSxcbiAgICAgICAgeyBkYXRhOiBudWxsLCB2aXNpYmxlOiBudWxsIH1cbiAgICAgICk7XG4gICAgfTtcblxuICAgIHZhciBnZXRDaGFydFR5cGUgPSBmdW5jdGlvbihzY29wZSkge1xuICAgICAgaWYgKHNjb3BlLmNvbmZpZyA9PT0gdW5kZWZpbmVkKSByZXR1cm4gJ0NoYXJ0JztcbiAgICAgIHJldHVybiBjaGFydFR5cGVNYXBbKCcnICsgc2NvcGUuY29uZmlnLmNoYXJ0VHlwZSkudG9Mb3dlckNhc2UoKV0gfHxcbiAgICAgICAgICAgICAoc2NvcGUuY29uZmlnLnVzZUhpZ2hTdG9ja3MgPyAnU3RvY2tDaGFydCcgOiAnQ2hhcnQnKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gbGlua1dpdGhIaWdoY2hhcnRzKEhpZ2hjaGFydHMsIHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgLy8gV2Uga2VlcCBzb21lIGNoYXJ0LXNwZWNpZmljIHZhcmlhYmxlcyBoZXJlIGFzIGEgY2xvc3VyZVxuICAgICAgLy8gaW5zdGVhZCBvZiBzdG9yaW5nIHRoZW0gb24gJ3Njb3BlJy5cblxuICAgICAgLy8gcHJldlNlcmllc09wdGlvbnMgaXMgbWFpbnRhaW5lZCBieSBwcm9jZXNzU2VyaWVzXG4gICAgICB2YXIgcHJldlNlcmllc09wdGlvbnMgPSB7fTtcbiAgICAgIC8vIGNoYXJ0IGlzIG1haW50YWluZWQgYnkgaW5pdENoYXJ0XG4gICAgICB2YXIgY2hhcnQgPSBmYWxzZTtcblxuICAgICAgdmFyIHByb2Nlc3NTZXJpZXMgPSBmdW5jdGlvbihzZXJpZXMsIHNlcmllc09sZCkge1xuICAgICAgICB2YXIgaTtcbiAgICAgICAgdmFyIGlkcyA9IFtdO1xuXG4gICAgICAgIGlmKHNlcmllcykge1xuICAgICAgICAgIHZhciBzZXRJZHMgPSBlbnN1cmVJZHMoc2VyaWVzKTtcbiAgICAgICAgICBpZihzZXRJZHMgJiYgIXNjb3BlLmRpc2FibGVEYXRhV2F0Y2gpIHtcbiAgICAgICAgICAgIC8vSWYgd2UgaGF2ZSBzZXQgc29tZSBpZHMgdGhpcyB3aWxsIHRyaWdnZXIgYW5vdGhlciBkaWdlc3QgY3ljbGUuXG4gICAgICAgICAgICAvL0luIHRoaXMgc2NlbmFyaW8ganVzdCByZXR1cm4gZWFybHkgYW5kIGxldCB0aGUgbmV4dCBjeWNsZSB0YWtlIGNhcmUgb2YgY2hhbmdlc1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vRmluZCBzZXJpZXMgdG8gYWRkIG9yIHVwZGF0ZVxuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChzZXJpZXMsIGZ1bmN0aW9uKHMsIGlkeCkge1xuICAgICAgICAgICAgaWRzLnB1c2gocy5pZCk7XG4gICAgICAgICAgICB2YXIgY2hhcnRTZXJpZXMgPSBjaGFydC5nZXQocy5pZCk7XG4gICAgICAgICAgICBpZiAoY2hhcnRTZXJpZXMpIHtcbiAgICAgICAgICAgICAgaWYgKCFhbmd1bGFyLmVxdWFscyhwcmV2U2VyaWVzT3B0aW9uc1tzLmlkXSwgY2hhcnRPcHRpb25zV2l0aG91dEVhc3lPcHRpb25zKHMpKSkge1xuICAgICAgICAgICAgICAgIGNoYXJ0U2VyaWVzLnVwZGF0ZShhbmd1bGFyLmNvcHkocyksIGZhbHNlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAocy52aXNpYmxlICE9PSB1bmRlZmluZWQgJiYgY2hhcnRTZXJpZXMudmlzaWJsZSAhPT0gcy52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgICBjaGFydFNlcmllcy5zZXRWaXNpYmxlKHMudmlzaWJsZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIGN1cnJlbnQgc2VyaWVzIGluZGV4IGNhbiBiZSBhY2Nlc3NlZCBpbiBzZXJpZXNPbGRcbiAgICAgICAgICAgICAgICBpZiAoaWR4IDwgc2VyaWVzT2xkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgdmFyIHNPbGQgPSBzZXJpZXNPbGRbaWR4XTtcbiAgICAgICAgICAgICAgICAgIHZhciBzQ29weSA9IGFuZ3VsYXIuY29weShzT2xkKTtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBsYXRlc3QgZGF0YSBwb2ludCBmcm9tIHRoZSBuZXcgc2VyaWVzXG4gICAgICAgICAgICAgICAgICB2YXIgcHROZXcgPSBzLmRhdGFbcy5kYXRhLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgbmV3IGFuZCBvbGQgc2VyaWVzIGFyZSBpZGVudGljYWwgd2l0aCB0aGUgbGF0ZXN0IGRhdGEgcG9pbnQgYWRkZWRcbiAgICAgICAgICAgICAgICAgIC8vIElmIHNvLCBjYWxsIGFkZFBvaW50IHdpdGhvdXQgc2hpZnRpbmdcbiAgICAgICAgICAgICAgICAgIHNDb3B5LmRhdGEucHVzaChwdE5ldyk7XG4gICAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHMoc0NvcHksIHMpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0U2VyaWVzLmFkZFBvaW50KHB0TmV3LCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBkYXRhIGNoYW5nZSB3YXMgYSBwdXNoIGFuZCBzaGlmdCBvcGVyYXRpb25cbiAgICAgICAgICAgICAgICAgIC8vIElmIHNvLCBjYWxsIGFkZFBvaW50IFdJVEggc2hpZnRpbmdcbiAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzQ29weS5kYXRhLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyhzQ29weSwgcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjaGFydFNlcmllcy5hZGRQb2ludChwdE5ldywgZmFsc2UsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0U2VyaWVzLnNldERhdGEoYW5ndWxhci5jb3B5KHMuZGF0YSksIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGNoYXJ0U2VyaWVzLnNldERhdGEoYW5ndWxhci5jb3B5KHMuZGF0YSksIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNoYXJ0LmFkZFNlcmllcyhhbmd1bGFyLmNvcHkocyksIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByZXZTZXJpZXNPcHRpb25zW3MuaWRdID0gY2hhcnRPcHRpb25zV2l0aG91dEVhc3lPcHRpb25zKHMpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gIFNob3dzIG5vIGRhdGEgdGV4dCBpZiBhbGwgc2VyaWVzIGFyZSBlbXB0eVxuICAgICAgICAgIGlmKHNjb3BlLmNvbmZpZy5ub0RhdGEpIHtcbiAgICAgICAgICAgIHZhciBjaGFydENvbnRhaW5zRGF0YSA9IGZhbHNlO1xuXG4gICAgICAgICAgICBmb3IoaSA9IDA7IGkgPCBzZXJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgaWYgKHNlcmllc1tpXS5kYXRhICYmIHNlcmllc1tpXS5kYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjaGFydENvbnRhaW5zRGF0YSA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWNoYXJ0Q29udGFpbnNEYXRhKSB7XG4gICAgICAgICAgICAgIGNoYXJ0LnNob3dMb2FkaW5nKHNjb3BlLmNvbmZpZy5ub0RhdGEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY2hhcnQuaGlkZUxvYWRpbmcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL05vdyByZW1vdmUgYW55IG1pc3Npbmcgc2VyaWVzXG4gICAgICAgIGZvcihpID0gY2hhcnQuc2VyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgdmFyIHMgPSBjaGFydC5zZXJpZXNbaV07XG4gICAgICAgICAgaWYgKHMub3B0aW9ucy5pZCAhPT0gJ2hpZ2hjaGFydHMtbmF2aWdhdG9yLXNlcmllcycgJiYgaW5kZXhPZihpZHMsIHMub3B0aW9ucy5pZCkgPCAwKSB7XG4gICAgICAgICAgICBzLnJlbW92ZShmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuXG4gICAgICB2YXIgaW5pdENoYXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChjaGFydCkgY2hhcnQuZGVzdHJveSgpO1xuICAgICAgICBwcmV2U2VyaWVzT3B0aW9ucyA9IHt9O1xuICAgICAgICB2YXIgY29uZmlnID0gc2NvcGUuY29uZmlnIHx8IHt9O1xuICAgICAgICB2YXIgbWVyZ2VkT3B0aW9ucyA9IGdldE1lcmdlZE9wdGlvbnMoc2NvcGUsIGVsZW1lbnQsIGNvbmZpZyk7XG4gICAgICAgIHZhciBmdW5jID0gY29uZmlnLmZ1bmMgfHwgdW5kZWZpbmVkO1xuICAgICAgICB2YXIgY2hhcnRUeXBlID0gZ2V0Q2hhcnRUeXBlKHNjb3BlKTtcblxuICAgICAgICBjaGFydCA9IG5ldyBIaWdoY2hhcnRzW2NoYXJ0VHlwZV0obWVyZ2VkT3B0aW9ucywgZnVuYyk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBheGlzTmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoY29uZmlnW2F4aXNOYW1lc1tpXV0pIHtcbiAgICAgICAgICAgIHByb2Nlc3NFeHRyZW1lcyhjaGFydCwgY29uZmlnW2F4aXNOYW1lc1tpXV0sIGF4aXNOYW1lc1tpXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKGNvbmZpZy5sb2FkaW5nKSB7XG4gICAgICAgICAgY2hhcnQuc2hvd0xvYWRpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25maWcuZ2V0SGlnaGNoYXJ0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBjaGFydDtcbiAgICAgICAgfTtcblxuICAgICAgfTtcbiAgICAgIGluaXRDaGFydCgpO1xuXG5cbiAgICAgIGlmKHNjb3BlLmRpc2FibGVEYXRhV2F0Y2gpe1xuICAgICAgICBzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKCdjb25maWcuc2VyaWVzJywgZnVuY3Rpb24gKG5ld1Nlcmllcywgb2xkU2VyaWVzKSB7XG4gICAgICAgICAgcHJvY2Vzc1NlcmllcyhuZXdTZXJpZXMpO1xuICAgICAgICAgIGNoYXJ0LnJlZHJhdygpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjb3BlLiR3YXRjaCgnY29uZmlnLnNlcmllcycsIGZ1bmN0aW9uIChuZXdTZXJpZXMsIG9sZFNlcmllcykge1xuICAgICAgICAgIHZhciBuZWVkc1JlZHJhdyA9IHByb2Nlc3NTZXJpZXMobmV3U2VyaWVzLCBvbGRTZXJpZXMpO1xuICAgICAgICAgIGlmKG5lZWRzUmVkcmF3KSB7XG4gICAgICAgICAgICBjaGFydC5yZWRyYXcoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuICAgICAgfVxuXG4gICAgICBzY29wZS4kd2F0Y2goJ2NvbmZpZy50aXRsZScsIGZ1bmN0aW9uIChuZXdUaXRsZSkge1xuICAgICAgICBjaGFydC5zZXRUaXRsZShuZXdUaXRsZSwgdHJ1ZSk7XG4gICAgICB9LCB0cnVlKTtcblxuICAgICAgc2NvcGUuJHdhdGNoKCdjb25maWcuc3VidGl0bGUnLCBmdW5jdGlvbiAobmV3U3VidGl0bGUpIHtcbiAgICAgICAgY2hhcnQuc2V0VGl0bGUodHJ1ZSwgbmV3U3VidGl0bGUpO1xuICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgIHNjb3BlLiR3YXRjaCgnY29uZmlnLmxvYWRpbmcnLCBmdW5jdGlvbiAobG9hZGluZykge1xuICAgICAgICBpZihsb2FkaW5nKSB7XG4gICAgICAgICAgY2hhcnQuc2hvd0xvYWRpbmcobG9hZGluZyA9PT0gdHJ1ZSA/IG51bGwgOiBsb2FkaW5nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjaGFydC5oaWRlTG9hZGluZygpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHNjb3BlLiR3YXRjaCgnY29uZmlnLm5vRGF0YScsIGZ1bmN0aW9uIChub0RhdGEpIHtcbiAgICAgICAgaWYoc2NvcGUuY29uZmlnICYmIHNjb3BlLmNvbmZpZy5sb2FkaW5nKSB7XG4gICAgICAgICAgY2hhcnQuc2hvd0xvYWRpbmcobm9EYXRhKTtcbiAgICAgICAgfVxuICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgIHNjb3BlLiR3YXRjaCgnY29uZmlnLmNyZWRpdHMuZW5hYmxlZCcsIGZ1bmN0aW9uIChlbmFibGVkKSB7XG4gICAgICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgICAgY2hhcnQuY3JlZGl0cy5zaG93KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoY2hhcnQuY3JlZGl0cykge1xuICAgICAgICAgIGNoYXJ0LmNyZWRpdHMuaGlkZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgc2NvcGUuJHdhdGNoKGdldENoYXJ0VHlwZSwgZnVuY3Rpb24gKGNoYXJ0VHlwZSwgb2xkQ2hhcnRUeXBlKSB7XG4gICAgICAgIGlmIChjaGFydFR5cGUgPT09IG9sZENoYXJ0VHlwZSkgcmV0dXJuO1xuICAgICAgICBpbml0Q2hhcnQoKTtcbiAgICAgIH0pO1xuXG4gICAgICBhbmd1bGFyLmZvckVhY2goYXhpc05hbWVzLCBmdW5jdGlvbihheGlzTmFtZSkge1xuICAgICAgICBzY29wZS4kd2F0Y2goJ2NvbmZpZy4nICsgYXhpc05hbWUsIGZ1bmN0aW9uKG5ld0F4ZXMpIHtcbiAgICAgICAgICBpZiAoIW5ld0F4ZXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoYW5ndWxhci5pc0FycmF5KG5ld0F4ZXMpKSB7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGF4aXNJbmRleCA9IDA7IGF4aXNJbmRleCA8IG5ld0F4ZXMubGVuZ3RoOyBheGlzSW5kZXgrKykge1xuICAgICAgICAgICAgICB2YXIgYXhpcyA9IG5ld0F4ZXNbYXhpc0luZGV4XTtcblxuICAgICAgICAgICAgICBpZiAoYXhpc0luZGV4IDwgY2hhcnRbYXhpc05hbWVdLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNoYXJ0W2F4aXNOYW1lXVtheGlzSW5kZXhdLnVwZGF0ZShheGlzLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgdXBkYXRlWm9vbShjaGFydFtheGlzTmFtZV1bYXhpc0luZGV4XSwgYW5ndWxhci5jb3B5KGF4aXMpKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gdXBkYXRlIHNpbmdsZSBheGlzXG4gICAgICAgICAgICBjaGFydFtheGlzTmFtZV1bMF0udXBkYXRlKG5ld0F4ZXMsIGZhbHNlKTtcbiAgICAgICAgICAgIHVwZGF0ZVpvb20oY2hhcnRbYXhpc05hbWVdWzBdLCBhbmd1bGFyLmNvcHkobmV3QXhlcykpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNoYXJ0LnJlZHJhdygpO1xuICAgICAgICB9LCB0cnVlKTtcbiAgICAgIH0pO1xuICAgICAgc2NvcGUuJHdhdGNoKCdjb25maWcub3B0aW9ucycsIGZ1bmN0aW9uIChuZXdPcHRpb25zLCBvbGRPcHRpb25zLCBzY29wZSkge1xuICAgICAgICAvL2RvIG5vdGhpbmcgd2hlbiBjYWxsZWQgb24gcmVnaXN0cmF0aW9uXG4gICAgICAgIGlmIChuZXdPcHRpb25zID09PSBvbGRPcHRpb25zKSByZXR1cm47XG4gICAgICAgIGluaXRDaGFydCgpO1xuICAgICAgICBwcm9jZXNzU2VyaWVzKHNjb3BlLmNvbmZpZy5zZXJpZXMpO1xuICAgICAgICBjaGFydC5yZWRyYXcoKTtcbiAgICAgIH0sIHRydWUpO1xuXG4gICAgICBzY29wZS4kd2F0Y2goJ2NvbmZpZy5zaXplJywgZnVuY3Rpb24gKG5ld1NpemUsIG9sZFNpemUpIHtcbiAgICAgICAgaWYobmV3U2l6ZSA9PT0gb2xkU2l6ZSkgcmV0dXJuO1xuICAgICAgICBpZihuZXdTaXplKSB7XG4gICAgICAgICAgY2hhcnQuc2V0U2l6ZShuZXdTaXplLndpZHRoIHx8IGNoYXJ0LmNoYXJ0V2lkdGgsIG5ld1NpemUuaGVpZ2h0IHx8IGNoYXJ0LmNoYXJ0SGVpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgIHNjb3BlLiRvbignaGlnaGNoYXJ0c25nLnJlZmxvdycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2hhcnQucmVmbG93KCk7XG4gICAgICB9KTtcblxuICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoY2hhcnQpIHtcbiAgICAgICAgICB0cnl7XG4gICAgICAgICAgICBjaGFydC5kZXN0cm95KCk7XG4gICAgICAgICAgfWNhdGNoKGV4KXtcbiAgICAgICAgICAgIC8vIGZhaWwgc2lsZW50bHkgYXMgaGlnaGNoYXJ0cyB3aWxsIHRocm93IGV4Y2VwdGlvbiBpZiBlbGVtZW50IGRvZXNuJ3QgZXhpc3RcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgZWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgIGZ1bmN0aW9uIGhpZ2hjaGFydHNDYihIaWdoY2hhcnRzKSB7XG4gICAgICAgIGxpbmtXaXRoSGlnaGNoYXJ0cyhIaWdoY2hhcnRzLCBzY29wZSwgZWxlbWVudCwgYXR0cnMpO1xuICAgICAgfVxuICAgICAgaGlnaGNoYXJ0c05HVXRpbHNcbiAgICAgICAgLmdldEhpZ2hjaGFydHMoKVxuICAgICAgICAudGhlbihoaWdoY2hhcnRzQ2IpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0VBQycsXG4gICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgdGVtcGxhdGU6ICc8ZGl2PjwvZGl2PicsXG4gICAgICBzY29wZToge1xuICAgICAgICBjb25maWc6ICc9JyxcbiAgICAgICAgZGlzYWJsZURhdGFXYXRjaDogJz0nXG4gICAgICB9LFxuICAgICAgbGluazogbGlua1xuICAgIH07XG4gIH1cbn0oKSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgncm9vdCcsIFtcbiAgICAgICAgJ25nUm91dGUnLFxuICAgICAgICAgJ2hpZ2hjaGFydHMtbmcnXG4gICAgXSk7XG4iLCJmdW5jdGlvbiByb3V0ZVByb3ZpZGVyKCRyb3V0ZVByb3ZpZGVyKXtcbiAgICAkcm91dGVQcm92aWRlclxuICAgICAgLndoZW4oJy8nLCB7XG4gICAgICAgICAgdGVtcGxhdGU6ICc8ZGFzaGJvYXJkPjwvZGFzaGJvYXJkPidcbiAgICAgIH0pO1xufVxucm91dGVQcm92aWRlci4kaW5qZWN0ID0gWyckcm91dGVQcm92aWRlciddO1xuXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXG4gIC5jb25maWcocm91dGVQcm92aWRlcik7XG4iLCJmdW5jdGlvbiBTdGF0c1NlcnZpY2UoKSB7XG4gICAgdmFyIHNlcnZpY2UgPSB7fTtcblxuICAgIHZhciBjb25uZWN0aW9uID0gbmV3IFdlYlNvY2tldCgnd3M6Ly9sb2NhbGhvc3Q6OTAwMC9zdGF0cycpO1xuXG4gICAgdmFyIG1lc3NhZ2VRdWV1ZSA9IFtdO1xuXG4gICAgY29ubmVjdGlvbi5vbm9wZW4gPSBmdW5jdGlvbigpeyAgXG4gICAgICAgIGNvbnNvbGUubG9nKFwiU29ja2V0IGhhcyBiZWVuIG9wZW5lZCFcIik7ICBcbiAgICB9O1xuXG4gICAgY29ubmVjdGlvbi5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlNlcnZlcjogXCIgKyBlKTtcbiAgICAgICAgdGhpcy5tZXNzYWdlUXVldWUucHVzaChlKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHNlcnZpY2U7XG59XG5cbmFuZ3VsYXIubW9kdWxlKCdyb290JylcbiAgICAuZmFjdG9yeSgnU3RhdHNTZXJ2aWNlJywgU3RhdHNTZXJ2aWNlKTsiLCJ2YXIgdG9wTmF2ID0ge1xuICAgIHRlbXBsYXRlVXJsOiAnLi9hcHAvY29tbW9uL3RvcC1uYXYvdG9wLW5hdi5odG1sJ1xufVxuXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXG4gICAgLmNvbXBvbmVudCgndG9wTmF2JywgdG9wTmF2KTtcbiIsInZhciBkYXNoYm9hcmQgPSB7XG4gICAgdGVtcGxhdGVVcmw6ICcuL2FwcC9jb21wb25lbnRzL2Rhc2hib2FyZC9kYXNoYm9hcmQuaHRtbCcsXG4gICAgY29udHJvbGxlcjogRGFzaGJvYXJkQ29udHJvbGxlcixcbiAgICBiaW5kaW5nczoge1xuICAgICAgICBzdGF0czogJzwnLFxuICAgICAgICBtZW1BbGVydDogJzwnXG4gICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCdyb290JylcbiAgICAuY29tcG9uZW50KCdkYXNoYm9hcmQnLCBkYXNoYm9hcmQpO1xuIiwiZnVuY3Rpb24gRGFzaGJvYXJkQ29udHJvbGxlcigpIHtcbiAgICB2YXIgY3RybCA9IHRoaXM7XG5cbiAgICBjdHJsLiRvbkluaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY3RybC5tZW1BbGVydCA9IGZhbHNlO1xuICAgIH1cblxufVxuXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXG4gICAgLmNvbnRyb2xsZXIoJ0Rhc2hib2FyZENvbnRyb2xsZXInLCBEYXNoYm9hcmRDb250cm9sbGVyKTtcbiIsInZhciBjcHVVc2FnZSA9IHtcbiAgICB0ZW1wbGF0ZVVybDogJ2FwcC9jb21wb25lbnRzL2Rhc2hib2FyZC9jcHUtd2lkZ2V0L2NwdS13aWRnZXQuaHRtbCcsXG4gICAgY29udHJvbGxlcjogQ3B1V2lkZ2V0Q29udHJvbGxlcixcbiAgICBiaW5kaW5nczoge1xuICAgICAgICB1c2FnZTogJzwnLFxuICAgICAgICBzZXJpZXM6ICc8JyxcbiAgICAgICAgbGFiZWxzOiAnPCcsXG4gICAgICAgIGRhdGE6ICc8JyxcbiAgICAgICAgb3B0aW9uczogJzwnXG4gICAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXG4gICAgLmNvbXBvbmVudCgnY3B1VXNhZ2UnLCBjcHVVc2FnZSk7IiwiZnVuY3Rpb24gQ3B1V2lkZ2V0Q29udHJvbGxlcihTdGF0c1NlcnZpY2UsICRsb2csICR0aW1lb3V0LCAkc2NvcGUpIHtcbiAgICB2YXIgY3RybCA9IHRoaXM7XG5cbiAgICAkc2NvcGUuY2hhcnRDb25maWcgPSB7XG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGNoYXJ0OiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2FyZWEnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICB0ZXh0OiAnQ1BVIFVzYWdlIC0gTGFzdCA2MCBNaW51dGVzJ1xuICAgICAgICB9LFxuICAgICAgICBzZXJpZXM6IFt7XG4gICAgICAgICAgICBuYW1lOiAnVXNhZ2UgKCUpJyxcbiAgICAgICAgICAgIGRhdGE6IFsxMCwgMTUsIDEyLCA4LCA3XVxuICAgICAgICB9XSxcbiAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICAgIHRleHQ6ICdIZWxsbydcbiAgICAgICAgfSxcblxuICAgICAgICBsb2FkaW5nOiBmYWxzZVxuICAgIH1cblxufVxuXG5DcHVXaWRnZXRDb250cm9sbGVyLiRpbmplY3QgPSBbJ1N0YXRzU2VydmljZScsICckbG9nJywgJyR0aW1lb3V0JywgJyRzY29wZSddO1xuXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXG4gICAgLmNvbnRyb2xsZXIoJ0NwdVdpZGdldENvbnRyb2xsZXInLCBDcHVXaWRnZXRDb250cm9sbGVyKTsiLCJ2YXIgZGlza1VzYWdlID0ge1xuICAgIHRlbXBsYXRlVXJsOiAnYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkL2Rpc2std2lkZ2V0L2Rpc2std2lkZ2V0Lmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6IERpc2tXaWRnZXRDb250cm9sbGVyLFxuICAgIGJpbmRpbmdzIDoge1xuICAgICAgICB1c2FnZSA6ICc8JyxcbiAgICAgICAgc2VyaWVzOiAnPCcsXG4gICAgICAgIGxhYmVsczogJzwnLFxuICAgICAgICBkYXRhOiAnPCcsXG4gICAgICAgIG9wdGlvbnM6ICc8J1xuICAgIH1cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxuICAgIC5jb21wb25lbnQoJ2Rpc2tVc2FnZScsIGRpc2tVc2FnZSk7IiwiZnVuY3Rpb24gRGlza1dpZGdldENvbnRyb2xsZXIoU3RhdHNTZXJ2aWNlLCAkbG9nLCAkdGltZW91dCwgJHNjb3BlKSB7XG4gICAgdmFyIGN0cmwgPSB0aGlzO1xuXG4gICAgJHNjb3BlLmNoYXJ0Q29uZmlnID0ge1xuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBjaGFydDoge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdhcmVhJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzZXJpZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBkYXRhOiBbMjkuOSwgMjkuMywgMzEuMCwgMzJdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGRhdGE6IFszLjQsIDUuMywgNS44LCA2LjNdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGRhdGE6IFs1LjgsIDEyLjMsIDE2LjQsIDIwLjFdXG4gICAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIHhBeGlzOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbJy00JywgJy0zJywgJy0yJywgJy0xJ11cbiAgICAgICAgfSxcbiAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICAgIHRleHQ6ICdEaXNrIFVzYWdlIC0gNCBXZWVrcydcbiAgICAgICAgfSxcblxuICAgICAgICBsb2FkaW5nOiBmYWxzZVxuICAgIH1cbn1cblxuRGlza1dpZGdldENvbnRyb2xsZXIuJGluamVjdCA9IFsnU3RhdHNTZXJ2aWNlJywgJyRsb2cnLCAnJHRpbWVvdXQnLCAnJHNjb3BlJ107XG5cbmFuZ3VsYXIubW9kdWxlKCdyb290JylcbiAgICAuY29udHJvbGxlcignRGlza1dpZGdldENvbnRyb2xsZXInLCBEaXNrV2lkZ2V0Q29udHJvbGxlcik7XG4gICAgIiwidmFyIG1lbVVzYWdlID0ge1xuICAgIHRlbXBsYXRlVXJsOiAnYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkL21lbS13aWRnZXQvbWVtLXdpZGdldC5odG1sJyxcbiAgICBjb250cm9sbGVyOiBNZW1XaWRnZXRDb250cm9sbGVyLFxuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHVzYWdlOiAnPCcsXG4gICAgICAgIHNlcmllczogJzwnLFxuICAgICAgICBsYWJlbHM6ICc8JyxcbiAgICAgICAgZGF0YTogJzwnLFxuICAgICAgICBvcHRpb25zOiAnPCdcbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCdyb290JylcbiAgICAuY29tcG9uZW50KCdtZW1Vc2FnZScsIG1lbVVzYWdlKTtcbiIsImZ1bmN0aW9uIE1lbVdpZGdldENvbnRyb2xsZXIoU3RhdHNTZXJ2aWNlLCAkbG9nLCAkdGltZW91dCwgJHNjb3BlKSB7XG4gICAgdmFyIGN0cmwgPSB0aGlzO1xuXG4gICAgJHNjb3BlLmNoYXJ0Q29uZmlnID0ge1xuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBjaGFydDoge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdhcmVhJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICB0ZXh0OiAnTWVtb3J5IFVzYWdlJ1xuICAgICAgICB9LFxuXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuXG4gICAgICAgIHhBeGlzOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgXG4gICAgICAgICAgICAgICAgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJ11cbiAgICAgICAgfSxcblxuICAgICAgICBzZXJpZXM6IFt7XG4gICAgICAgICAgICBkYXRhOiBbMjkuOSwgNzEuNSwgMTA2LjQsIDEyOS4yLCAxNDQuMCwgMTc2LjAsIDEzNS42LCAxNDguNSwgMjE2LjQsIDE5NC4xLCA5NS42LCA1NC40XVxuICAgICAgICB9XVxuICAgIH07XG5cbn1cblxuTWVtV2lkZ2V0Q29udHJvbGxlci4kaW5qZWN0ID0gWydTdGF0c1NlcnZpY2UnLCAnJGxvZycsICckdGltZW91dCcsICckc2NvcGUnXTtcblxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxuICAgIC5jb250cm9sbGVyKCdNZW1XaWRnZXRDb250cm9sbGVyJywgTWVtV2lkZ2V0Q29udHJvbGxlcik7XG4gICAgIiwidmFyIG5ldHdvcmtVc2FnZSA9IHtcbiAgICB0ZW1wbGF0ZVVybDogJ2FwcC9jb21wb25lbnRzL2Rhc2hib2FyZC9uZXR3b3JrLXVzYWdlL25ldHdvcmstdXNhZ2UuaHRtbCcsXG4gICAgY29udHJvbGxlcjogTmV0d29ya1VzYWdlQ29udHJvbGxlcixcbiAgICBiaW5kaW5nczoge1xuICAgICAgICB1c2FnZTogJzwnLFxuICAgICAgICBzZXJpZXM6ICc8JyxcbiAgICAgICAgbGFiZWxzOiAnPCcsXG4gICAgICAgIGRhdGE6ICc8JyxcbiAgICAgICAgb3B0aW9uczogJzwnXG4gICAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXG4gICAgLmNvbXBvbmVudCgnbmV0d29ya1VzYWdlJywgbmV0d29ya1VzYWdlKTtcbiAgICAiLCJmdW5jdGlvbiBOZXR3b3JrVXNhZ2VDb250cm9sbGVyKFN0YXRzU2VydmljZSwgJGxvZywgJHRpbWVvdXQsICRzY29wZSkge1xuICAgIHZhciBjdHJsID0gdGhpcztcblxuICAgICRzY29wZS5jaGFydENvbmZpZyA9IHtcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgY2hhcnQ6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnYXJlYSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgdGV4dDogJ05ldHdvcmsgVXNhZ2UgLSBMYXN0IDYwIE1pbnV0ZXMnXG4gICAgICAgIH0sXG4gICAgICAgIHlBeGlzOiB7XG4gICAgICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgICAgIHRleHQ6ICdUaHJvdWdocHV0IE1CaXQvcydcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgeEF4aXM6IHtcbiAgICAgICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICAgICAgdGV4dDogJ01pbnV0ZXMnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2F0ZWdvcmllczogWyctNTUnLCAnLTUwJywgJy00NScsICctNDAnLCAnLTM1JywgJy0zMCcsIFxuICAgICAgICAgICAgICAgICctMjUnLCAnLTIwJywgJy0xNScsICctMTAnLCAnLTA1JywgJzAnXVxuICAgICAgICB9LFxuICAgICAgICBwbG90T3B0aW9uczoge1xuICAgICAgICAgICAgbGluZToge1xuICAgICAgICAgICAgICAgIGRhdGFMYWJlbHM6IHtcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZW5hYmxlTW91c2VUcmFja2luZzogdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzZXJpZXM6IFtcbiAgICAgICAgICAgIHsgICBcbiAgICAgICAgICAgICAgICBuYW1lOiAnSW5ib3VuZCcsXG4gICAgICAgICAgICAgICAgZGF0YTogWzI5LjksIDcxLjUsIDI1LjQsIDQzLjIsIDM3LjAsIDMzLjAsIDM1LjYsIDQ4LjUsIDIxLjQsIDE5LjEsIDE2LjYsIDU0LjRdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdPdXRib3VuZCcsXG4gICAgICAgICAgICAgICAgZGF0YTogWzE5LjMsIDU2LjMsIDIzLjEsIDM4LjUsIDMyLjksIDI3LjAsIDMwLjYsIDQyLjMsIDE3LjQsIDEyLjAsIDkuMSwgMzQuMF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH07XG5cbiAgICBjdHJsLnBvbGwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjdHJsLnBvbGwoKTtcbiAgICAgICAgfSwgMjAwMCk7XG4gICAgfVxuXG4gICAgY3RybC4kb25Jbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGN0cmwucG9sbCgpO1xuICAgIH07XG5cbn1cblxuTmV0d29ya1VzYWdlQ29udHJvbGxlci4kaW5qZWN0ID0gWydTdGF0c1NlcnZpY2UnLCAnJGxvZycsICckdGltZW91dCcsICckc2NvcGUnXTtcblxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxuICAgIC5jb250cm9sbGVyKCdOZXR3b3JrVXNhZ2VDb250cm9sbGVyJywgTmV0d29ya1VzYWdlQ29udHJvbGxlcik7XG4iXX0=
