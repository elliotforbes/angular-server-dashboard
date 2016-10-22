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