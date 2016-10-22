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
            data: [10, 15, 12, 8, 7]
        }],

        loading: false
    }   

    ctrl.poll = function() {
        $timeout(function(){
            $scope.chartConfig.series[0].data.shift();
            $scope.chartConfig.series[0].data.push(Math.floor(Math.random() * 20) + 1);
            ctrl.poll();
        }, 2000);
    }

    this.$onInit = function() {
        $log.log("hello");
        ctrl.poll();
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

    ctrl.poll = function() {
        $timeout(function(){
            $scope.chartConfig.series[0].data.shift();
            $scope.chartConfig.series[0].data.push(Math.floor(Math.random() * 20) + 1);

            $scope.chartConfig.series[1].data.shift();
            $scope.chartConfig.series[1].data.push(Math.floor(Math.random() * 20) + 1);

            $scope.chartConfig.series[2].data.shift();
            $scope.chartConfig.series[2].data.push(Math.floor(Math.random() * 20) + 1);
            ctrl.poll();
        }, 2000);
    }

    this.$onInit = function() {
        $log.log("hello");
        ctrl.poll();
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

    ctrl.poll = function() {
        $timeout(function(){
            $scope.chartConfig.series[0].data.shift();
            $scope.chartConfig.series[0].data.push(Math.floor(Math.random() * 20) + 100);
            ctrl.poll();
        }, 2000);
    }

    this.$onInit = function() {
        $log.log("hello");
        ctrl.poll();
    }

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
        $timeout(function(){
            $scope.chartConfig.series[0].data.shift();
            $scope.chartConfig.series[0].data.push(Math.floor(Math.random() * 20) + 1);
            $scope.chartConfig.series[1].data.shift();
            $scope.chartConfig.series[1].data.push(Math.floor(Math.random() * 20) + 1);
            ctrl.poll();
        }, 2000);
    }

    this.$onInit = function() {
        $log.log("hello");
        ctrl.poll();
    }

}

NetworkUsageController.$inject = ['StatsService', '$log', '$timeout', '$scope'];

angular.module('root')
    .controller('NetworkUsageController', NetworkUsageController);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhpZ2hjaGFydHMtbmcuanMiLCJyb290Lm1vZHVsZS5qcyIsInJvb3Qucm91dGVzLmpzIiwic3RhdHMuc2VydmljZS5qcyIsImNvbW1vbi90b3AtbmF2L3RvcC1uYXYuY29tcG9uZW50LmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvZGFzaGJvYXJkLmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvZGFzaGJvYXJkL2Rhc2hib2FyZC5jb250cm9sbGVyLmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvY3B1LXdpZGdldC9jcHUtd2lkZ2V0LmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvZGFzaGJvYXJkL2NwdS13aWRnZXQvY3B1LXdpZGdldC5jb250cm9sbGVyLmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvZGlzay13aWRnZXQvZGlzay13aWRnZXQuY29tcG9uZW50LmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvZGlzay13aWRnZXQvZGlzay13aWRnZXQuY29udHJvbGxlci5qcyIsImNvbXBvbmVudHMvZGFzaGJvYXJkL21lbS13aWRnZXQvbWVtLXdpZGdldC5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9tZW0td2lkZ2V0L21lbS13aWRnZXQuY29udHJvbGxlci5qcyIsImNvbXBvbmVudHMvZGFzaGJvYXJkL25ldHdvcmstdXNhZ2UvbmV0d29yay11c2FnZS5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9uZXR3b3JrLXVzYWdlL25ldHdvcmstdXNhZ2UuY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6ZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cyA9PT0gZXhwb3J0cyl7XG4gIG1vZHVsZS5leHBvcnRzID0gJ2hpZ2hjaGFydHMtbmcnO1xufVxuXG4oZnVuY3Rpb24gKCkge1xuICAndXNlIHN0cmljdCc7XG4gIC8qZ2xvYmFsIGFuZ3VsYXI6IGZhbHNlLCBIaWdoY2hhcnRzOiBmYWxzZSAqL1xuXG5cbiAgYW5ndWxhci5tb2R1bGUoJ2hpZ2hjaGFydHMtbmcnLCBbXSlcbiAgICAuZmFjdG9yeSgnaGlnaGNoYXJ0c05HJywgWyckcScsICckd2luZG93JywgaGlnaGNoYXJ0c05HXSlcbiAgICAuZGlyZWN0aXZlKCdoaWdoY2hhcnQnLCBbJ2hpZ2hjaGFydHNORycsICckdGltZW91dCcsIGhpZ2hjaGFydF0pO1xuXG4gIC8vSUU4IHN1cHBvcnRcbiAgZnVuY3Rpb24gaW5kZXhPZihhcnIsIGZpbmQsIGkgLypvcHQqLykge1xuICAgIGlmIChpID09PSB1bmRlZmluZWQpIGkgPSAwO1xuICAgIGlmIChpIDwgMCkgaSArPSBhcnIubGVuZ3RoO1xuICAgIGlmIChpIDwgMCkgaSA9IDA7XG4gICAgZm9yICh2YXIgbiA9IGFyci5sZW5ndGg7IGkgPCBuOyBpKyspXG4gICAgICBpZiAoaSBpbiBhcnIgJiYgYXJyW2ldID09PSBmaW5kKVxuICAgICAgICByZXR1cm4gaTtcbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICBmdW5jdGlvbiBwcmVwZW5kTWV0aG9kKG9iaiwgbWV0aG9kLCBmdW5jKSB7XG4gICAgdmFyIG9yaWdpbmFsID0gb2JqW21ldGhvZF07XG4gICAgb2JqW21ldGhvZF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgaWYgKG9yaWdpbmFsKSB7XG4gICAgICAgIHJldHVybiBvcmlnaW5hbC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBkZWVwRXh0ZW5kKGRlc3RpbmF0aW9uLCBzb3VyY2UpIHtcbiAgICAvL1NsaWdodGx5IHN0cmFuZ2UgYmVoYXZpb3VyIGluIGVkZ2UgY2FzZXMgKGUuZy4gcGFzc2luZyBpbiBub24gb2JqZWN0cylcbiAgICAvL0J1dCBkb2VzIHRoZSBqb2IgZm9yIGN1cnJlbnQgdXNlIGNhc2VzLlxuICAgIGlmIChhbmd1bGFyLmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgZGVzdGluYXRpb24gPSBhbmd1bGFyLmlzQXJyYXkoZGVzdGluYXRpb24pID8gZGVzdGluYXRpb24gOiBbXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc291cmNlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRlc3RpbmF0aW9uW2ldID0gZGVlcEV4dGVuZChkZXN0aW5hdGlvbltpXSB8fCB7fSwgc291cmNlW2ldKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGFuZ3VsYXIuaXNPYmplY3Qoc291cmNlKSkge1xuICAgICAgZGVzdGluYXRpb24gPSBhbmd1bGFyLmlzT2JqZWN0KGRlc3RpbmF0aW9uKSA/IGRlc3RpbmF0aW9uIDoge307XG4gICAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBzb3VyY2UpIHtcbiAgICAgICAgZGVzdGluYXRpb25bcHJvcGVydHldID0gZGVlcEV4dGVuZChkZXN0aW5hdGlvbltwcm9wZXJ0eV0gfHwge30sIHNvdXJjZVtwcm9wZXJ0eV0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBkZXN0aW5hdGlvbiA9IHNvdXJjZTtcbiAgICB9XG4gICAgcmV0dXJuIGRlc3RpbmF0aW9uO1xuICB9XG5cbiAgZnVuY3Rpb24gaGlnaGNoYXJ0c05HKCRxLCAkd2luZG93KSB7XG4gICAgdmFyIGhpZ2hjaGFydHNQcm9tID0gJHEud2hlbigkd2luZG93LkhpZ2hjaGFydHMpO1xuXG4gICAgZnVuY3Rpb24gZ2V0SGlnaGNoYXJ0c09uY2UoKSB7XG4gICAgICByZXR1cm4gaGlnaGNoYXJ0c1Byb207XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGdldEhpZ2hjaGFydHM6IGdldEhpZ2hjaGFydHNPbmNlLFxuICAgICAgcmVhZHk6IGZ1bmN0aW9uIHJlYWR5KGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICAgIGdldEhpZ2hjaGFydHNPbmNlKCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gaGlnaGNoYXJ0KGhpZ2hjaGFydHNOR1V0aWxzLCAkdGltZW91dCkge1xuXG4gICAgLy8gYWNjZXB0YWJsZSBzaGFyZWQgc3RhdGVcbiAgICB2YXIgc2VyaWVzSWQgPSAwO1xuICAgIHZhciBlbnN1cmVJZHMgPSBmdW5jdGlvbiAoc2VyaWVzKSB7XG4gICAgICB2YXIgY2hhbmdlZCA9IGZhbHNlO1xuICAgICAgYW5ndWxhci5mb3JFYWNoKHNlcmllcywgZnVuY3Rpb24ocykge1xuICAgICAgICBpZiAoIWFuZ3VsYXIuaXNEZWZpbmVkKHMuaWQpKSB7XG4gICAgICAgICAgcy5pZCA9ICdzZXJpZXMtJyArIHNlcmllc0lkKys7XG4gICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGNoYW5nZWQ7XG4gICAgfTtcblxuICAgIC8vIGltbXV0YWJsZVxuICAgIHZhciBheGlzTmFtZXMgPSBbICd4QXhpcycsICd5QXhpcycgXTtcbiAgICB2YXIgY2hhcnRUeXBlTWFwID0ge1xuICAgICAgJ3N0b2NrJzogJ1N0b2NrQ2hhcnQnLFxuICAgICAgJ21hcCc6ICAgJ01hcCcsXG4gICAgICAnY2hhcnQnOiAnQ2hhcnQnXG4gICAgfTtcblxuICAgIHZhciBnZXRNZXJnZWRPcHRpb25zID0gZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBjb25maWcpIHtcbiAgICAgIHZhciBtZXJnZWRPcHRpb25zID0ge307XG5cbiAgICAgIHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgICAgY2hhcnQ6IHtcbiAgICAgICAgICBldmVudHM6IHt9XG4gICAgICAgIH0sXG4gICAgICAgIHRpdGxlOiB7fSxcbiAgICAgICAgc3VidGl0bGU6IHt9LFxuICAgICAgICBzZXJpZXM6IFtdLFxuICAgICAgICBjcmVkaXRzOiB7fSxcbiAgICAgICAgcGxvdE9wdGlvbnM6IHt9LFxuICAgICAgICBuYXZpZ2F0b3I6IHtlbmFibGVkOiBmYWxzZX0sXG4gICAgICAgIHhBeGlzOiB7XG4gICAgICAgICAgZXZlbnRzOiB7fVxuICAgICAgICB9LFxuICAgICAgICB5QXhpczoge1xuICAgICAgICAgIGV2ZW50czoge31cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgaWYgKGNvbmZpZy5vcHRpb25zKSB7XG4gICAgICAgIG1lcmdlZE9wdGlvbnMgPSBkZWVwRXh0ZW5kKGRlZmF1bHRPcHRpb25zLCBjb25maWcub3B0aW9ucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtZXJnZWRPcHRpb25zID0gZGVmYXVsdE9wdGlvbnM7XG4gICAgICB9XG4gICAgICBtZXJnZWRPcHRpb25zLmNoYXJ0LnJlbmRlclRvID0gZWxlbWVudFswXTtcblxuICAgICAgYW5ndWxhci5mb3JFYWNoKGF4aXNOYW1lcywgZnVuY3Rpb24oYXhpc05hbWUpIHtcbiAgICAgICAgaWYoYW5ndWxhci5pc0RlZmluZWQoY29uZmlnW2F4aXNOYW1lXSkpIHtcbiAgICAgICAgICBtZXJnZWRPcHRpb25zW2F4aXNOYW1lXSA9IGRlZXBFeHRlbmQobWVyZ2VkT3B0aW9uc1theGlzTmFtZV0gfHwge30sIGNvbmZpZ1theGlzTmFtZV0pO1xuXG4gICAgICAgICAgaWYoYW5ndWxhci5pc0RlZmluZWQoY29uZmlnW2F4aXNOYW1lXS5jdXJyZW50TWluKSB8fFxuICAgICAgICAgICAgICBhbmd1bGFyLmlzRGVmaW5lZChjb25maWdbYXhpc05hbWVdLmN1cnJlbnRNYXgpKSB7XG5cbiAgICAgICAgICAgIHByZXBlbmRNZXRob2QobWVyZ2VkT3B0aW9ucy5jaGFydC5ldmVudHMsICdzZWxlY3Rpb24nLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgdmFyIHRoaXNDaGFydCA9IHRoaXM7XG4gICAgICAgICAgICAgIGlmIChlW2F4aXNOYW1lXSkge1xuICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICBzY29wZS5jb25maWdbYXhpc05hbWVdLmN1cnJlbnRNaW4gPSBlW2F4aXNOYW1lXVswXS5taW47XG4gICAgICAgICAgICAgICAgICBzY29wZS5jb25maWdbYXhpc05hbWVdLmN1cnJlbnRNYXggPSBlW2F4aXNOYW1lXVswXS5tYXg7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy9oYW5kbGUgcmVzZXQgYnV0dG9uIC0gem9vbSBvdXQgdG8gYWxsXG4gICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgIHNjb3BlLmNvbmZpZ1theGlzTmFtZV0uY3VycmVudE1pbiA9IHRoaXNDaGFydFtheGlzTmFtZV1bMF0uZGF0YU1pbjtcbiAgICAgICAgICAgICAgICAgIHNjb3BlLmNvbmZpZ1theGlzTmFtZV0uY3VycmVudE1heCA9IHRoaXNDaGFydFtheGlzTmFtZV1bMF0uZGF0YU1heDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHByZXBlbmRNZXRob2QobWVyZ2VkT3B0aW9ucy5jaGFydC5ldmVudHMsICdhZGRTZXJpZXMnLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgc2NvcGUuY29uZmlnW2F4aXNOYW1lXS5jdXJyZW50TWluID0gdGhpc1theGlzTmFtZV1bMF0ubWluIHx8IHNjb3BlLmNvbmZpZ1theGlzTmFtZV0uY3VycmVudE1pbjtcbiAgICAgICAgICAgICAgc2NvcGUuY29uZmlnW2F4aXNOYW1lXS5jdXJyZW50TWF4ID0gdGhpc1theGlzTmFtZV1bMF0ubWF4IHx8IHNjb3BlLmNvbmZpZ1theGlzTmFtZV0uY3VycmVudE1heDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcHJlcGVuZE1ldGhvZChtZXJnZWRPcHRpb25zW2F4aXNOYW1lXS5ldmVudHMsICdzZXRFeHRyZW1lcycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgIGlmIChlLnRyaWdnZXIgJiYgZS50cmlnZ2VyICE9PSAnem9vbScpIHsgLy8gem9vbSB0cmlnZ2VyIGlzIGhhbmRsZWQgYnkgc2VsZWN0aW9uIGV2ZW50XG4gICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgc2NvcGUuY29uZmlnW2F4aXNOYW1lXS5jdXJyZW50TWluID0gZS5taW47XG4gICAgICAgICAgICAgICAgICBzY29wZS5jb25maWdbYXhpc05hbWVdLmN1cnJlbnRNYXggPSBlLm1heDtcbiAgICAgICAgICAgICAgICAgIHNjb3BlLmNvbmZpZ1theGlzTmFtZV0ubWluID0gZS5taW47IC8vIHNldCBtaW4gYW5kIG1heCB0byBhZGp1c3Qgc2Nyb2xsYmFyL25hdmlnYXRvclxuICAgICAgICAgICAgICAgICAgc2NvcGUuY29uZmlnW2F4aXNOYW1lXS5tYXggPSBlLm1heDtcbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYoY29uZmlnLnRpdGxlKSB7XG4gICAgICAgIG1lcmdlZE9wdGlvbnMudGl0bGUgPSBjb25maWcudGl0bGU7XG4gICAgICB9XG4gICAgICBpZiAoY29uZmlnLnN1YnRpdGxlKSB7XG4gICAgICAgIG1lcmdlZE9wdGlvbnMuc3VidGl0bGUgPSBjb25maWcuc3VidGl0bGU7XG4gICAgICB9XG4gICAgICBpZiAoY29uZmlnLmNyZWRpdHMpIHtcbiAgICAgICAgbWVyZ2VkT3B0aW9ucy5jcmVkaXRzID0gY29uZmlnLmNyZWRpdHM7XG4gICAgICB9XG4gICAgICBpZihjb25maWcuc2l6ZSkge1xuICAgICAgICBpZiAoY29uZmlnLnNpemUud2lkdGgpIHtcbiAgICAgICAgICBtZXJnZWRPcHRpb25zLmNoYXJ0LndpZHRoID0gY29uZmlnLnNpemUud2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbmZpZy5zaXplLmhlaWdodCkge1xuICAgICAgICAgIG1lcmdlZE9wdGlvbnMuY2hhcnQuaGVpZ2h0ID0gY29uZmlnLnNpemUuaGVpZ2h0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbWVyZ2VkT3B0aW9ucztcbiAgICB9O1xuXG4gICAgdmFyIHVwZGF0ZVpvb20gPSBmdW5jdGlvbiAoYXhpcywgbW9kZWxBeGlzKSB7XG4gICAgICB2YXIgZXh0cmVtZXMgPSBheGlzLmdldEV4dHJlbWVzKCk7XG4gICAgICBpZihtb2RlbEF4aXMuY3VycmVudE1pbiAhPT0gZXh0cmVtZXMuZGF0YU1pbiB8fCBtb2RlbEF4aXMuY3VycmVudE1heCAhPT0gZXh0cmVtZXMuZGF0YU1heCkge1xuICAgICAgICBpZiAoYXhpcy5zZXRFeHRyZW1lcykge1xuICAgICAgICAgIGF4aXMuc2V0RXh0cmVtZXMobW9kZWxBeGlzLmN1cnJlbnRNaW4sIG1vZGVsQXhpcy5jdXJyZW50TWF4LCBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXhpcy5kZXRhY2hlZHNldEV4dHJlbWVzKG1vZGVsQXhpcy5jdXJyZW50TWluLCBtb2RlbEF4aXMuY3VycmVudE1heCwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBwcm9jZXNzRXh0cmVtZXMgPSBmdW5jdGlvbihjaGFydCwgYXhpcywgYXhpc05hbWUpIHtcbiAgICAgIGlmKGF4aXMuY3VycmVudE1pbiB8fCBheGlzLmN1cnJlbnRNYXgpIHtcbiAgICAgICAgY2hhcnRbYXhpc05hbWVdWzBdLnNldEV4dHJlbWVzKGF4aXMuY3VycmVudE1pbiwgYXhpcy5jdXJyZW50TWF4LCB0cnVlKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGNoYXJ0T3B0aW9uc1dpdGhvdXRFYXN5T3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICByZXR1cm4gYW5ndWxhci5leHRlbmQoXG4gICAgICAgIGRlZXBFeHRlbmQoe30sIG9wdGlvbnMpLFxuICAgICAgICB7IGRhdGE6IG51bGwsIHZpc2libGU6IG51bGwgfVxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgdmFyIGdldENoYXJ0VHlwZSA9IGZ1bmN0aW9uKHNjb3BlKSB7XG4gICAgICBpZiAoc2NvcGUuY29uZmlnID09PSB1bmRlZmluZWQpIHJldHVybiAnQ2hhcnQnO1xuICAgICAgcmV0dXJuIGNoYXJ0VHlwZU1hcFsoJycgKyBzY29wZS5jb25maWcuY2hhcnRUeXBlKS50b0xvd2VyQ2FzZSgpXSB8fFxuICAgICAgICAgICAgIChzY29wZS5jb25maWcudXNlSGlnaFN0b2NrcyA/ICdTdG9ja0NoYXJ0JyA6ICdDaGFydCcpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBsaW5rV2l0aEhpZ2hjaGFydHMoSGlnaGNoYXJ0cywgc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAvLyBXZSBrZWVwIHNvbWUgY2hhcnQtc3BlY2lmaWMgdmFyaWFibGVzIGhlcmUgYXMgYSBjbG9zdXJlXG4gICAgICAvLyBpbnN0ZWFkIG9mIHN0b3JpbmcgdGhlbSBvbiAnc2NvcGUnLlxuXG4gICAgICAvLyBwcmV2U2VyaWVzT3B0aW9ucyBpcyBtYWludGFpbmVkIGJ5IHByb2Nlc3NTZXJpZXNcbiAgICAgIHZhciBwcmV2U2VyaWVzT3B0aW9ucyA9IHt9O1xuICAgICAgLy8gY2hhcnQgaXMgbWFpbnRhaW5lZCBieSBpbml0Q2hhcnRcbiAgICAgIHZhciBjaGFydCA9IGZhbHNlO1xuXG4gICAgICB2YXIgcHJvY2Vzc1NlcmllcyA9IGZ1bmN0aW9uKHNlcmllcywgc2VyaWVzT2xkKSB7XG4gICAgICAgIHZhciBpO1xuICAgICAgICB2YXIgaWRzID0gW107XG5cbiAgICAgICAgaWYoc2VyaWVzKSB7XG4gICAgICAgICAgdmFyIHNldElkcyA9IGVuc3VyZUlkcyhzZXJpZXMpO1xuICAgICAgICAgIGlmKHNldElkcyAmJiAhc2NvcGUuZGlzYWJsZURhdGFXYXRjaCkge1xuICAgICAgICAgICAgLy9JZiB3ZSBoYXZlIHNldCBzb21lIGlkcyB0aGlzIHdpbGwgdHJpZ2dlciBhbm90aGVyIGRpZ2VzdCBjeWNsZS5cbiAgICAgICAgICAgIC8vSW4gdGhpcyBzY2VuYXJpbyBqdXN0IHJldHVybiBlYXJseSBhbmQgbGV0IHRoZSBuZXh0IGN5Y2xlIHRha2UgY2FyZSBvZiBjaGFuZ2VzXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy9GaW5kIHNlcmllcyB0byBhZGQgb3IgdXBkYXRlXG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHNlcmllcywgZnVuY3Rpb24ocywgaWR4KSB7XG4gICAgICAgICAgICBpZHMucHVzaChzLmlkKTtcbiAgICAgICAgICAgIHZhciBjaGFydFNlcmllcyA9IGNoYXJ0LmdldChzLmlkKTtcbiAgICAgICAgICAgIGlmIChjaGFydFNlcmllcykge1xuICAgICAgICAgICAgICBpZiAoIWFuZ3VsYXIuZXF1YWxzKHByZXZTZXJpZXNPcHRpb25zW3MuaWRdLCBjaGFydE9wdGlvbnNXaXRob3V0RWFzeU9wdGlvbnMocykpKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRTZXJpZXMudXBkYXRlKGFuZ3VsYXIuY29weShzKSwgZmFsc2UpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChzLnZpc2libGUgIT09IHVuZGVmaW5lZCAmJiBjaGFydFNlcmllcy52aXNpYmxlICE9PSBzLnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICAgIGNoYXJ0U2VyaWVzLnNldFZpc2libGUocy52aXNpYmxlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgY3VycmVudCBzZXJpZXMgaW5kZXggY2FuIGJlIGFjY2Vzc2VkIGluIHNlcmllc09sZFxuICAgICAgICAgICAgICAgIGlmIChpZHggPCBzZXJpZXNPbGQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgc09sZCA9IHNlcmllc09sZFtpZHhdO1xuICAgICAgICAgICAgICAgICAgdmFyIHNDb3B5ID0gYW5ndWxhci5jb3B5KHNPbGQpO1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIGxhdGVzdCBkYXRhIHBvaW50IGZyb20gdGhlIG5ldyBzZXJpZXNcbiAgICAgICAgICAgICAgICAgIHZhciBwdE5ldyA9IHMuZGF0YVtzLmRhdGEubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBuZXcgYW5kIG9sZCBzZXJpZXMgYXJlIGlkZW50aWNhbCB3aXRoIHRoZSBsYXRlc3QgZGF0YSBwb2ludCBhZGRlZFxuICAgICAgICAgICAgICAgICAgLy8gSWYgc28sIGNhbGwgYWRkUG9pbnQgd2l0aG91dCBzaGlmdGluZ1xuICAgICAgICAgICAgICAgICAgc0NvcHkuZGF0YS5wdXNoKHB0TmV3KTtcbiAgICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyhzQ29weSwgcykpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hhcnRTZXJpZXMuYWRkUG9pbnQocHROZXcsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIGRhdGEgY2hhbmdlIHdhcyBhIHB1c2ggYW5kIHNoaWZ0IG9wZXJhdGlvblxuICAgICAgICAgICAgICAgICAgLy8gSWYgc28sIGNhbGwgYWRkUG9pbnQgV0lUSCBzaGlmdGluZ1xuICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNDb3B5LmRhdGEuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuZXF1YWxzKHNDb3B5LCBzKSkge1xuICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0U2VyaWVzLmFkZFBvaW50KHB0TmV3LCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgY2hhcnRTZXJpZXMuc2V0RGF0YShhbmd1bGFyLmNvcHkocy5kYXRhKSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgY2hhcnRTZXJpZXMuc2V0RGF0YShhbmd1bGFyLmNvcHkocy5kYXRhKSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY2hhcnQuYWRkU2VyaWVzKGFuZ3VsYXIuY29weShzKSwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJldlNlcmllc09wdGlvbnNbcy5pZF0gPSBjaGFydE9wdGlvbnNXaXRob3V0RWFzeU9wdGlvbnMocyk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyAgU2hvd3Mgbm8gZGF0YSB0ZXh0IGlmIGFsbCBzZXJpZXMgYXJlIGVtcHR5XG4gICAgICAgICAgaWYoc2NvcGUuY29uZmlnLm5vRGF0YSkge1xuICAgICAgICAgICAgdmFyIGNoYXJ0Q29udGFpbnNEYXRhID0gZmFsc2U7XG5cbiAgICAgICAgICAgIGZvcihpID0gMDsgaSA8IHNlcmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICBpZiAoc2VyaWVzW2ldLmRhdGEgJiYgc2VyaWVzW2ldLmRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGNoYXJ0Q29udGFpbnNEYXRhID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghY2hhcnRDb250YWluc0RhdGEpIHtcbiAgICAgICAgICAgICAgY2hhcnQuc2hvd0xvYWRpbmcoc2NvcGUuY29uZmlnLm5vRGF0YSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjaGFydC5oaWRlTG9hZGluZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vTm93IHJlbW92ZSBhbnkgbWlzc2luZyBzZXJpZXNcbiAgICAgICAgZm9yKGkgPSBjaGFydC5zZXJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICB2YXIgcyA9IGNoYXJ0LnNlcmllc1tpXTtcbiAgICAgICAgICBpZiAocy5vcHRpb25zLmlkICE9PSAnaGlnaGNoYXJ0cy1uYXZpZ2F0b3Itc2VyaWVzJyAmJiBpbmRleE9mKGlkcywgcy5vcHRpb25zLmlkKSA8IDApIHtcbiAgICAgICAgICAgIHMucmVtb3ZlKGZhbHNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG5cbiAgICAgIHZhciBpbml0Q2hhcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGNoYXJ0KSBjaGFydC5kZXN0cm95KCk7XG4gICAgICAgIHByZXZTZXJpZXNPcHRpb25zID0ge307XG4gICAgICAgIHZhciBjb25maWcgPSBzY29wZS5jb25maWcgfHwge307XG4gICAgICAgIHZhciBtZXJnZWRPcHRpb25zID0gZ2V0TWVyZ2VkT3B0aW9ucyhzY29wZSwgZWxlbWVudCwgY29uZmlnKTtcbiAgICAgICAgdmFyIGZ1bmMgPSBjb25maWcuZnVuYyB8fCB1bmRlZmluZWQ7XG4gICAgICAgIHZhciBjaGFydFR5cGUgPSBnZXRDaGFydFR5cGUoc2NvcGUpO1xuXG4gICAgICAgIGNoYXJ0ID0gbmV3IEhpZ2hjaGFydHNbY2hhcnRUeXBlXShtZXJnZWRPcHRpb25zLCBmdW5jKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGF4aXNOYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChjb25maWdbYXhpc05hbWVzW2ldXSkge1xuICAgICAgICAgICAgcHJvY2Vzc0V4dHJlbWVzKGNoYXJ0LCBjb25maWdbYXhpc05hbWVzW2ldXSwgYXhpc05hbWVzW2ldKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYoY29uZmlnLmxvYWRpbmcpIHtcbiAgICAgICAgICBjaGFydC5zaG93TG9hZGluZygpO1xuICAgICAgICB9XG4gICAgICAgIGNvbmZpZy5nZXRIaWdoY2hhcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGNoYXJ0O1xuICAgICAgICB9O1xuXG4gICAgICB9O1xuICAgICAgaW5pdENoYXJ0KCk7XG5cblxuICAgICAgaWYoc2NvcGUuZGlzYWJsZURhdGFXYXRjaCl7XG4gICAgICAgIHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oJ2NvbmZpZy5zZXJpZXMnLCBmdW5jdGlvbiAobmV3U2VyaWVzLCBvbGRTZXJpZXMpIHtcbiAgICAgICAgICBwcm9jZXNzU2VyaWVzKG5ld1Nlcmllcyk7XG4gICAgICAgICAgY2hhcnQucmVkcmF3KCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2NvcGUuJHdhdGNoKCdjb25maWcuc2VyaWVzJywgZnVuY3Rpb24gKG5ld1Nlcmllcywgb2xkU2VyaWVzKSB7XG4gICAgICAgICAgdmFyIG5lZWRzUmVkcmF3ID0gcHJvY2Vzc1NlcmllcyhuZXdTZXJpZXMsIG9sZFNlcmllcyk7XG4gICAgICAgICAgaWYobmVlZHNSZWRyYXcpIHtcbiAgICAgICAgICAgIGNoYXJ0LnJlZHJhdygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICB9XG5cbiAgICAgIHNjb3BlLiR3YXRjaCgnY29uZmlnLnRpdGxlJywgZnVuY3Rpb24gKG5ld1RpdGxlKSB7XG4gICAgICAgIGNoYXJ0LnNldFRpdGxlKG5ld1RpdGxlLCB0cnVlKTtcbiAgICAgIH0sIHRydWUpO1xuXG4gICAgICBzY29wZS4kd2F0Y2goJ2NvbmZpZy5zdWJ0aXRsZScsIGZ1bmN0aW9uIChuZXdTdWJ0aXRsZSkge1xuICAgICAgICBjaGFydC5zZXRUaXRsZSh0cnVlLCBuZXdTdWJ0aXRsZSk7XG4gICAgICB9LCB0cnVlKTtcblxuICAgICAgc2NvcGUuJHdhdGNoKCdjb25maWcubG9hZGluZycsIGZ1bmN0aW9uIChsb2FkaW5nKSB7XG4gICAgICAgIGlmKGxvYWRpbmcpIHtcbiAgICAgICAgICBjaGFydC5zaG93TG9hZGluZyhsb2FkaW5nID09PSB0cnVlID8gbnVsbCA6IGxvYWRpbmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNoYXJ0LmhpZGVMb2FkaW5nKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgc2NvcGUuJHdhdGNoKCdjb25maWcubm9EYXRhJywgZnVuY3Rpb24gKG5vRGF0YSkge1xuICAgICAgICBpZihzY29wZS5jb25maWcgJiYgc2NvcGUuY29uZmlnLmxvYWRpbmcpIHtcbiAgICAgICAgICBjaGFydC5zaG93TG9hZGluZyhub0RhdGEpO1xuICAgICAgICB9XG4gICAgICB9LCB0cnVlKTtcblxuICAgICAgc2NvcGUuJHdhdGNoKCdjb25maWcuY3JlZGl0cy5lbmFibGVkJywgZnVuY3Rpb24gKGVuYWJsZWQpIHtcbiAgICAgICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgICBjaGFydC5jcmVkaXRzLnNob3coKTtcbiAgICAgICAgfSBlbHNlIGlmIChjaGFydC5jcmVkaXRzKSB7XG4gICAgICAgICAgY2hhcnQuY3JlZGl0cy5oaWRlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBzY29wZS4kd2F0Y2goZ2V0Q2hhcnRUeXBlLCBmdW5jdGlvbiAoY2hhcnRUeXBlLCBvbGRDaGFydFR5cGUpIHtcbiAgICAgICAgaWYgKGNoYXJ0VHlwZSA9PT0gb2xkQ2hhcnRUeXBlKSByZXR1cm47XG4gICAgICAgIGluaXRDaGFydCgpO1xuICAgICAgfSk7XG5cbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChheGlzTmFtZXMsIGZ1bmN0aW9uKGF4aXNOYW1lKSB7XG4gICAgICAgIHNjb3BlLiR3YXRjaCgnY29uZmlnLicgKyBheGlzTmFtZSwgZnVuY3Rpb24obmV3QXhlcykge1xuICAgICAgICAgIGlmICghbmV3QXhlcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzQXJyYXkobmV3QXhlcykpIHtcblxuICAgICAgICAgICAgZm9yICh2YXIgYXhpc0luZGV4ID0gMDsgYXhpc0luZGV4IDwgbmV3QXhlcy5sZW5ndGg7IGF4aXNJbmRleCsrKSB7XG4gICAgICAgICAgICAgIHZhciBheGlzID0gbmV3QXhlc1theGlzSW5kZXhdO1xuXG4gICAgICAgICAgICAgIGlmIChheGlzSW5kZXggPCBjaGFydFtheGlzTmFtZV0ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY2hhcnRbYXhpc05hbWVdW2F4aXNJbmRleF0udXBkYXRlKGF4aXMsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB1cGRhdGVab29tKGNoYXJ0W2F4aXNOYW1lXVtheGlzSW5kZXhdLCBhbmd1bGFyLmNvcHkoYXhpcykpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB1cGRhdGUgc2luZ2xlIGF4aXNcbiAgICAgICAgICAgIGNoYXJ0W2F4aXNOYW1lXVswXS51cGRhdGUobmV3QXhlcywgZmFsc2UpO1xuICAgICAgICAgICAgdXBkYXRlWm9vbShjaGFydFtheGlzTmFtZV1bMF0sIGFuZ3VsYXIuY29weShuZXdBeGVzKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY2hhcnQucmVkcmF3KCk7XG4gICAgICAgIH0sIHRydWUpO1xuICAgICAgfSk7XG4gICAgICBzY29wZS4kd2F0Y2goJ2NvbmZpZy5vcHRpb25zJywgZnVuY3Rpb24gKG5ld09wdGlvbnMsIG9sZE9wdGlvbnMsIHNjb3BlKSB7XG4gICAgICAgIC8vZG8gbm90aGluZyB3aGVuIGNhbGxlZCBvbiByZWdpc3RyYXRpb25cbiAgICAgICAgaWYgKG5ld09wdGlvbnMgPT09IG9sZE9wdGlvbnMpIHJldHVybjtcbiAgICAgICAgaW5pdENoYXJ0KCk7XG4gICAgICAgIHByb2Nlc3NTZXJpZXMoc2NvcGUuY29uZmlnLnNlcmllcyk7XG4gICAgICAgIGNoYXJ0LnJlZHJhdygpO1xuICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgIHNjb3BlLiR3YXRjaCgnY29uZmlnLnNpemUnLCBmdW5jdGlvbiAobmV3U2l6ZSwgb2xkU2l6ZSkge1xuICAgICAgICBpZihuZXdTaXplID09PSBvbGRTaXplKSByZXR1cm47XG4gICAgICAgIGlmKG5ld1NpemUpIHtcbiAgICAgICAgICBjaGFydC5zZXRTaXplKG5ld1NpemUud2lkdGggfHwgY2hhcnQuY2hhcnRXaWR0aCwgbmV3U2l6ZS5oZWlnaHQgfHwgY2hhcnQuY2hhcnRIZWlnaHQpO1xuICAgICAgICB9XG4gICAgICB9LCB0cnVlKTtcblxuICAgICAgc2NvcGUuJG9uKCdoaWdoY2hhcnRzbmcucmVmbG93JywgZnVuY3Rpb24gKCkge1xuICAgICAgICBjaGFydC5yZWZsb3coKTtcbiAgICAgIH0pO1xuXG4gICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChjaGFydCkge1xuICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgIGNoYXJ0LmRlc3Ryb3koKTtcbiAgICAgICAgICB9Y2F0Y2goZXgpe1xuICAgICAgICAgICAgLy8gZmFpbCBzaWxlbnRseSBhcyBoaWdoY2hhcnRzIHdpbGwgdGhyb3cgZXhjZXB0aW9uIGlmIGVsZW1lbnQgZG9lc24ndCBleGlzdFxuICAgICAgICAgIH1cblxuICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgZnVuY3Rpb24gaGlnaGNoYXJ0c0NiKEhpZ2hjaGFydHMpIHtcbiAgICAgICAgbGlua1dpdGhIaWdoY2hhcnRzKEhpZ2hjaGFydHMsIHNjb3BlLCBlbGVtZW50LCBhdHRycyk7XG4gICAgICB9XG4gICAgICBoaWdoY2hhcnRzTkdVdGlsc1xuICAgICAgICAuZ2V0SGlnaGNoYXJ0cygpXG4gICAgICAgIC50aGVuKGhpZ2hjaGFydHNDYik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRUFDJyxcbiAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICB0ZW1wbGF0ZTogJzxkaXY+PC9kaXY+JyxcbiAgICAgIHNjb3BlOiB7XG4gICAgICAgIGNvbmZpZzogJz0nLFxuICAgICAgICBkaXNhYmxlRGF0YVdhdGNoOiAnPSdcbiAgICAgIH0sXG4gICAgICBsaW5rOiBsaW5rXG4gICAgfTtcbiAgfVxufSgpKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdyb290JywgW1xuICAgICAgICAnbmdSb3V0ZScsXG4gICAgICAgICAnaGlnaGNoYXJ0cy1uZydcbiAgICBdKTtcbiIsImZ1bmN0aW9uIHJvdXRlUHJvdmlkZXIoJHJvdXRlUHJvdmlkZXIpe1xuICAgICRyb3V0ZVByb3ZpZGVyXG4gICAgICAud2hlbignLycsIHtcbiAgICAgICAgICB0ZW1wbGF0ZTogJzxkYXNoYm9hcmQ+PC9kYXNoYm9hcmQ+J1xuICAgICAgfSk7XG59XG5yb3V0ZVByb3ZpZGVyLiRpbmplY3QgPSBbJyRyb3V0ZVByb3ZpZGVyJ107XG5cbmFuZ3VsYXIubW9kdWxlKCdyb290JylcbiAgLmNvbmZpZyhyb3V0ZVByb3ZpZGVyKTtcbiIsImZ1bmN0aW9uIFN0YXRzU2VydmljZSgpIHtcbiAgICB2YXIgc2VydmljZSA9IHt9O1xuXG4gICAgdmFyIGNvbm5lY3Rpb24gPSBuZXcgV2ViU29ja2V0KCd3czovL2xvY2FsaG9zdDo5MDAwL3N0YXRzJyk7XG5cbiAgICB2YXIgbWVzc2FnZVF1ZXVlID0gW107XG5cbiAgICBjb25uZWN0aW9uLm9ub3BlbiA9IGZ1bmN0aW9uKCl7ICBcbiAgICAgICAgY29uc29sZS5sb2coXCJTb2NrZXQgaGFzIGJlZW4gb3BlbmVkIVwiKTsgIFxuICAgIH07XG5cbiAgICBjb25uZWN0aW9uLm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiU2VydmVyOiBcIiArIGUpO1xuICAgICAgICB0aGlzLm1lc3NhZ2VRdWV1ZS5wdXNoKGUpO1xuICAgIH07XG5cbiAgICByZXR1cm4gc2VydmljZTtcbn1cblxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxuICAgIC5mYWN0b3J5KCdTdGF0c1NlcnZpY2UnLCBTdGF0c1NlcnZpY2UpOyIsInZhciB0b3BOYXYgPSB7XG4gICAgdGVtcGxhdGVVcmw6ICcuL2FwcC9jb21tb24vdG9wLW5hdi90b3AtbmF2Lmh0bWwnXG59XG5cbmFuZ3VsYXIubW9kdWxlKCdyb290JylcbiAgICAuY29tcG9uZW50KCd0b3BOYXYnLCB0b3BOYXYpO1xuIiwidmFyIGRhc2hib2FyZCA9IHtcbiAgICB0ZW1wbGF0ZVVybDogJy4vYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkL2Rhc2hib2FyZC5odG1sJyxcbiAgICBjb250cm9sbGVyOiBEYXNoYm9hcmRDb250cm9sbGVyLFxuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHN0YXRzOiAnPCcsXG4gICAgICAgIG1lbUFsZXJ0OiAnPCdcbiAgIH1cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxuICAgIC5jb21wb25lbnQoJ2Rhc2hib2FyZCcsIGRhc2hib2FyZCk7XG4iLCJmdW5jdGlvbiBEYXNoYm9hcmRDb250cm9sbGVyKCkge1xuICAgIHZhciBjdHJsID0gdGhpcztcblxuICAgIGN0cmwuJG9uSW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjdHJsLm1lbUFsZXJ0ID0gZmFsc2U7XG4gICAgfVxuXG59XG5cbmFuZ3VsYXIubW9kdWxlKCdyb290JylcbiAgICAuY29udHJvbGxlcignRGFzaGJvYXJkQ29udHJvbGxlcicsIERhc2hib2FyZENvbnRyb2xsZXIpO1xuIiwidmFyIGNwdVVzYWdlID0ge1xuICAgIHRlbXBsYXRlVXJsOiAnYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkL2NwdS13aWRnZXQvY3B1LXdpZGdldC5odG1sJyxcbiAgICBjb250cm9sbGVyOiBDcHVXaWRnZXRDb250cm9sbGVyLFxuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHVzYWdlOiAnPCcsXG4gICAgICAgIHNlcmllczogJzwnLFxuICAgICAgICBsYWJlbHM6ICc8JyxcbiAgICAgICAgZGF0YTogJzwnLFxuICAgICAgICBvcHRpb25zOiAnPCdcbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCdyb290JylcbiAgICAuY29tcG9uZW50KCdjcHVVc2FnZScsIGNwdVVzYWdlKTsiLCJmdW5jdGlvbiBDcHVXaWRnZXRDb250cm9sbGVyKFN0YXRzU2VydmljZSwgJGxvZywgJHRpbWVvdXQsICRzY29wZSkge1xuICAgIHZhciBjdHJsID0gdGhpcztcblxuICAgICRzY29wZS5jaGFydENvbmZpZyA9IHtcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgY2hhcnQ6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnYXJlYSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICAgIHRleHQ6ICdDUFUgVXNhZ2UgLSBMYXN0IDYwIE1pbnV0ZXMnXG4gICAgICAgIH0sXG4gICAgICAgIHNlcmllczogW3tcbiAgICAgICAgICAgIGRhdGE6IFsxMCwgMTUsIDEyLCA4LCA3XVxuICAgICAgICB9XSxcblxuICAgICAgICBsb2FkaW5nOiBmYWxzZVxuICAgIH0gICBcblxuICAgIGN0cmwucG9sbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkdGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgJHNjb3BlLmNoYXJ0Q29uZmlnLnNlcmllc1swXS5kYXRhLnNoaWZ0KCk7XG4gICAgICAgICAgICAkc2NvcGUuY2hhcnRDb25maWcuc2VyaWVzWzBdLmRhdGEucHVzaChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyMCkgKyAxKTtcbiAgICAgICAgICAgIGN0cmwucG9sbCgpO1xuICAgICAgICB9LCAyMDAwKTtcbiAgICB9XG5cbiAgICB0aGlzLiRvbkluaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgJGxvZy5sb2coXCJoZWxsb1wiKTtcbiAgICAgICAgY3RybC5wb2xsKCk7XG4gICAgfVxuXG59XG5cbkNwdVdpZGdldENvbnRyb2xsZXIuJGluamVjdCA9IFsnU3RhdHNTZXJ2aWNlJywgJyRsb2cnLCAnJHRpbWVvdXQnLCAnJHNjb3BlJ107XG5cbmFuZ3VsYXIubW9kdWxlKCdyb290JylcbiAgICAuY29udHJvbGxlcignQ3B1V2lkZ2V0Q29udHJvbGxlcicsIENwdVdpZGdldENvbnRyb2xsZXIpOyIsInZhciBkaXNrVXNhZ2UgPSB7XG4gICAgdGVtcGxhdGVVcmw6ICdhcHAvY29tcG9uZW50cy9kYXNoYm9hcmQvZGlzay13aWRnZXQvZGlzay13aWRnZXQuaHRtbCcsXG4gICAgY29udHJvbGxlcjogRGlza1dpZGdldENvbnRyb2xsZXIsXG4gICAgYmluZGluZ3MgOiB7XG4gICAgICAgIHVzYWdlIDogJzwnLFxuICAgICAgICBzZXJpZXM6ICc8JyxcbiAgICAgICAgbGFiZWxzOiAnPCcsXG4gICAgICAgIGRhdGE6ICc8JyxcbiAgICAgICAgb3B0aW9uczogJzwnXG4gICAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXG4gICAgLmNvbXBvbmVudCgnZGlza1VzYWdlJywgZGlza1VzYWdlKTsiLCJmdW5jdGlvbiBEaXNrV2lkZ2V0Q29udHJvbGxlcihTdGF0c1NlcnZpY2UsICRsb2csICR0aW1lb3V0LCAkc2NvcGUpIHtcbiAgICB2YXIgY3RybCA9IHRoaXM7XG5cbiAgICAkc2NvcGUuY2hhcnRDb25maWcgPSB7XG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGNoYXJ0OiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2FyZWEnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHNlcmllczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGRhdGE6IFsyOS45LCAyOS4zLCAzMS4wLCAzMl1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZGF0YTogWzMuNCwgNS4zLCA1LjgsIDYuM11cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZGF0YTogWzUuOCwgMTIuMywgMTYuNCwgMjAuMV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgeEF4aXM6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFsnLTQnLCAnLTMnLCAnLTInLCAnLTEnXVxuICAgICAgICB9LFxuICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgdGV4dDogJ0Rpc2sgVXNhZ2UgLSA0IFdlZWtzJ1xuICAgICAgICB9LFxuXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlXG4gICAgfVxuXG4gICAgY3RybC5wb2xsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkc2NvcGUuY2hhcnRDb25maWcuc2VyaWVzWzBdLmRhdGEuc2hpZnQoKTtcbiAgICAgICAgICAgICRzY29wZS5jaGFydENvbmZpZy5zZXJpZXNbMF0uZGF0YS5wdXNoKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIwKSArIDEpO1xuXG4gICAgICAgICAgICAkc2NvcGUuY2hhcnRDb25maWcuc2VyaWVzWzFdLmRhdGEuc2hpZnQoKTtcbiAgICAgICAgICAgICRzY29wZS5jaGFydENvbmZpZy5zZXJpZXNbMV0uZGF0YS5wdXNoKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIwKSArIDEpO1xuXG4gICAgICAgICAgICAkc2NvcGUuY2hhcnRDb25maWcuc2VyaWVzWzJdLmRhdGEuc2hpZnQoKTtcbiAgICAgICAgICAgICRzY29wZS5jaGFydENvbmZpZy5zZXJpZXNbMl0uZGF0YS5wdXNoKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIwKSArIDEpO1xuICAgICAgICAgICAgY3RybC5wb2xsKCk7XG4gICAgICAgIH0sIDIwMDApO1xuICAgIH1cblxuICAgIHRoaXMuJG9uSW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkbG9nLmxvZyhcImhlbGxvXCIpO1xuICAgICAgICBjdHJsLnBvbGwoKTtcbiAgICB9XG59XG5cbkRpc2tXaWRnZXRDb250cm9sbGVyLiRpbmplY3QgPSBbJ1N0YXRzU2VydmljZScsICckbG9nJywgJyR0aW1lb3V0JywgJyRzY29wZSddO1xuXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXG4gICAgLmNvbnRyb2xsZXIoJ0Rpc2tXaWRnZXRDb250cm9sbGVyJywgRGlza1dpZGdldENvbnRyb2xsZXIpO1xuICAgICIsInZhciBtZW1Vc2FnZSA9IHtcbiAgICB0ZW1wbGF0ZVVybDogJ2FwcC9jb21wb25lbnRzL2Rhc2hib2FyZC9tZW0td2lkZ2V0L21lbS13aWRnZXQuaHRtbCcsXG4gICAgY29udHJvbGxlcjogTWVtV2lkZ2V0Q29udHJvbGxlcixcbiAgICBiaW5kaW5nczoge1xuICAgICAgICB1c2FnZTogJzwnLFxuICAgICAgICBzZXJpZXM6ICc8JyxcbiAgICAgICAgbGFiZWxzOiAnPCcsXG4gICAgICAgIGRhdGE6ICc8JyxcbiAgICAgICAgb3B0aW9uczogJzwnXG4gICAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXG4gICAgLmNvbXBvbmVudCgnbWVtVXNhZ2UnLCBtZW1Vc2FnZSk7XG4iLCJmdW5jdGlvbiBNZW1XaWRnZXRDb250cm9sbGVyKFN0YXRzU2VydmljZSwgJGxvZywgJHRpbWVvdXQsICRzY29wZSkge1xuICAgIHZhciBjdHJsID0gdGhpcztcblxuICAgICRzY29wZS5jaGFydENvbmZpZyA9IHtcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgY2hhcnQ6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnYXJlYSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgdGV4dDogJ01lbW9yeSBVc2FnZSdcbiAgICAgICAgfSxcblxuICAgICAgICBsb2FkaW5nOiBmYWxzZSxcblxuICAgICAgICB4QXhpczoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsIFxuICAgICAgICAgICAgICAgICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYyddXG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VyaWVzOiBbe1xuICAgICAgICAgICAgZGF0YTogWzI5LjksIDcxLjUsIDEwNi40LCAxMjkuMiwgMTQ0LjAsIDE3Ni4wLCAxMzUuNiwgMTQ4LjUsIDIxNi40LCAxOTQuMSwgOTUuNiwgNTQuNF1cbiAgICAgICAgfV1cbiAgICB9O1xuXG4gICAgY3RybC5wb2xsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkc2NvcGUuY2hhcnRDb25maWcuc2VyaWVzWzBdLmRhdGEuc2hpZnQoKTtcbiAgICAgICAgICAgICRzY29wZS5jaGFydENvbmZpZy5zZXJpZXNbMF0uZGF0YS5wdXNoKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIwKSArIDEwMCk7XG4gICAgICAgICAgICBjdHJsLnBvbGwoKTtcbiAgICAgICAgfSwgMjAwMCk7XG4gICAgfVxuXG4gICAgdGhpcy4kb25Jbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICRsb2cubG9nKFwiaGVsbG9cIik7XG4gICAgICAgIGN0cmwucG9sbCgpO1xuICAgIH1cblxufVxuXG5NZW1XaWRnZXRDb250cm9sbGVyLiRpbmplY3QgPSBbJ1N0YXRzU2VydmljZScsICckbG9nJywgJyR0aW1lb3V0JywgJyRzY29wZSddO1xuXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXG4gICAgLmNvbnRyb2xsZXIoJ01lbVdpZGdldENvbnRyb2xsZXInLCBNZW1XaWRnZXRDb250cm9sbGVyKTtcbiAgICAiLCJ2YXIgbmV0d29ya1VzYWdlID0ge1xuICAgIHRlbXBsYXRlVXJsOiAnYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkL25ldHdvcmstdXNhZ2UvbmV0d29yay11c2FnZS5odG1sJyxcbiAgICBjb250cm9sbGVyOiBOZXR3b3JrVXNhZ2VDb250cm9sbGVyLFxuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHVzYWdlOiAnPCcsXG4gICAgICAgIHNlcmllczogJzwnLFxuICAgICAgICBsYWJlbHM6ICc8JyxcbiAgICAgICAgZGF0YTogJzwnLFxuICAgICAgICBvcHRpb25zOiAnPCdcbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCdyb290JylcbiAgICAuY29tcG9uZW50KCduZXR3b3JrVXNhZ2UnLCBuZXR3b3JrVXNhZ2UpO1xuICAgICIsImZ1bmN0aW9uIE5ldHdvcmtVc2FnZUNvbnRyb2xsZXIoU3RhdHNTZXJ2aWNlLCAkbG9nLCAkdGltZW91dCwgJHNjb3BlKSB7XG4gICAgdmFyIGN0cmwgPSB0aGlzO1xuXG4gICAgJHNjb3BlLmNoYXJ0Q29uZmlnID0ge1xuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBjaGFydDoge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdhcmVhJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICB0ZXh0OiAnTmV0d29yayBVc2FnZSAtIExhc3QgNjAgTWludXRlcydcbiAgICAgICAgfSxcbiAgICAgICAgeUF4aXM6IHtcbiAgICAgICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICAgICAgdGV4dDogJ1Rocm91Z2hwdXQgTUJpdC9zJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB4QXhpczoge1xuICAgICAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICAgICAgICB0ZXh0OiAnTWludXRlcydcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbJy01NScsICctNTAnLCAnLTQ1JywgJy00MCcsICctMzUnLCAnLTMwJywgXG4gICAgICAgICAgICAgICAgJy0yNScsICctMjAnLCAnLTE1JywgJy0xMCcsICctMDUnLCAnMCddXG4gICAgICAgIH0sXG4gICAgICAgIHBsb3RPcHRpb25zOiB7XG4gICAgICAgICAgICBsaW5lOiB7XG4gICAgICAgICAgICAgICAgZGF0YUxhYmVsczoge1xuICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiB0cnVlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlbmFibGVNb3VzZVRyYWNraW5nOiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHNlcmllczogW1xuICAgICAgICAgICAgeyAgIFxuICAgICAgICAgICAgICAgIG5hbWU6ICdJbmJvdW5kJyxcbiAgICAgICAgICAgICAgICBkYXRhOiBbMjkuOSwgNzEuNSwgMjUuNCwgNDMuMiwgMzcuMCwgMzMuMCwgMzUuNiwgNDguNSwgMjEuNCwgMTkuMSwgMTYuNiwgNTQuNF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ091dGJvdW5kJyxcbiAgICAgICAgICAgICAgICBkYXRhOiBbMTkuMywgNTYuMywgMjMuMSwgMzguNSwgMzIuOSwgMjcuMCwgMzAuNiwgNDIuMywgMTcuNCwgMTIuMCwgOS4xLCAzNC4wXVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfTtcblxuICAgICBjdHJsLnBvbGwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICRzY29wZS5jaGFydENvbmZpZy5zZXJpZXNbMF0uZGF0YS5zaGlmdCgpO1xuICAgICAgICAgICAgJHNjb3BlLmNoYXJ0Q29uZmlnLnNlcmllc1swXS5kYXRhLnB1c2goTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjApICsgMSk7XG4gICAgICAgICAgICAkc2NvcGUuY2hhcnRDb25maWcuc2VyaWVzWzFdLmRhdGEuc2hpZnQoKTtcbiAgICAgICAgICAgICRzY29wZS5jaGFydENvbmZpZy5zZXJpZXNbMV0uZGF0YS5wdXNoKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIwKSArIDEpO1xuICAgICAgICAgICAgY3RybC5wb2xsKCk7XG4gICAgICAgIH0sIDIwMDApO1xuICAgIH1cblxuICAgIHRoaXMuJG9uSW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkbG9nLmxvZyhcImhlbGxvXCIpO1xuICAgICAgICBjdHJsLnBvbGwoKTtcbiAgICB9XG5cbn1cblxuTmV0d29ya1VzYWdlQ29udHJvbGxlci4kaW5qZWN0ID0gWydTdGF0c1NlcnZpY2UnLCAnJGxvZycsICckdGltZW91dCcsICckc2NvcGUnXTtcblxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxuICAgIC5jb250cm9sbGVyKCdOZXR3b3JrVXNhZ2VDb250cm9sbGVyJywgTmV0d29ya1VzYWdlQ29udHJvbGxlcik7XG4iXX0=
