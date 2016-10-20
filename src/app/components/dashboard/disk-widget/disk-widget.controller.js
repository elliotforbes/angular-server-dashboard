function DiskWidgetController(StatsService, $log, $timeout) {
    var ctrl = this;

    Highcharts.chart('container', {
        chart: {
            type: 'area'
        },
        title: {
            text: 'Disk Usage - 4 weeks'
        },
        yAxis: {
            title: {
                text: 'Billions'
            },
            labels: {
                formatter: function () {
                    return this.value / 1000;
                }
            }
        },
        xAxis: {
            categories: ['-4', '-3', '-2', '-1']
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
        ]
    });
}

DiskWidgetController.$inject = ['StatsService', '$log', '$timeout'];

angular.module('root')
    .controller('DiskWidgetController', DiskWidgetController);
    