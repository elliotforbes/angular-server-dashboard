function NetworkUsageController(StatsService, $log, $timeout, $scope) {
    var ctrl = this;

    Highcharts.chart('networkusage', {
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
    });

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
