function MemWidgetController(StatsService, $log, $timeout) {
    var ctrl = this;

    ctrl.chartConfig = {
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
            ctrl.chartConfig.series[0].data.shift();
            ctrl.chartConfig.series[0].data.push(Math.floor(Math.random() * 20) + 100);
            ctrl.poll();
        }, 2000);
    }

    this.$onInit = function() {
        ctrl.poll();
    }

}

MemWidgetController.$inject = ['StatsService', '$log', '$timeout'];

angular.module('root')
    .controller('MemWidgetController', MemWidgetController);
    