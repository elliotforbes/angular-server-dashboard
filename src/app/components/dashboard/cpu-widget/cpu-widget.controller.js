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