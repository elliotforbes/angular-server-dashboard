function CpuWidgetController(StatsService, $log, $timeout) {
    var ctrl = this;

    Highcharts.chart('cpuwidget', {
        chart: {
            type: 'area'
        },
        title: {
            text: 'CPU Usage (%)'
        },
        yAxis: {
            title: {
                text: 'Percentage (%)'
            }
        },
        xAxis: {
            title: {
                text: 'Minutes Ago'
            },
            categories: ['55', '50', '45', '40', '35', '30', 
                '25', '20', '15', '10', '5', '0']
        },

        series: [{
            data: [29.9, 71.5, 16.4, 29.2, 44.0, 76.0, 35.6, 48.5, 16.4, 94.1, 95.6, 54.4]
        }]
    });

}

CpuWidgetController.$inject = ['StatsService', '$log', '$timeout'];

angular.module('root')
    .controller('CpuWidgetController', CpuWidgetController);