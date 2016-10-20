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
    