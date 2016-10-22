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
    