function NetworkUsageController(StatsService, $log, $timeout, $scope) {
    var ctrl = this;

    ctrl.chartConfig = {
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
            // Here is where you could poll a REST API or the websockets service for live data
            ctrl.chartConfig.series[0].data.shift();
            ctrl.chartConfig.series[0].data.push(Math.floor(Math.random() * 20) + 1);
            ctrl.chartConfig.series[1].data.shift();
            ctrl.chartConfig.series[1].data.push(Math.floor(Math.random() * 20) + 1);
            ctrl.poll();
        }, 2000);
    }

    this.$onInit = function() {
        $log.log("hello");
        ctrl.poll();
    }

}

NetworkUsageController.$inject = ['StatsService', '$log', '$timeout'];

angular.module('root')
    .controller('NetworkUsageController', NetworkUsageController);
