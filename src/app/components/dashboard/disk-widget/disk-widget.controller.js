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
    