angular.module('root', [
        'ngRoute',
         'highcharts-ng'
    ]);

function routeProvider($routeProvider){
    $routeProvider
      .when('/', {
          template: '<dashboard></dashboard>'
      });
}
routeProvider.$inject = ['$routeProvider'];

angular.module('root')
  .config(routeProvider);

function StatsService() {
    var service = {};

    var connection = new WebSocket('ws://localhost:9000/stats');

    var messageQueue = [];

    connection.onopen = function(){  
        console.log("Socket has been opened!");  
    };

    connection.onmessage = function (e) {
        console.log("Server: " + e);
        this.messageQueue.push(e);
    };

    return service;
}

angular.module('root')
    .factory('StatsService', StatsService);
var topNav = {
    templateUrl: './app/common/top-nav/top-nav.html'
}

angular.module('root')
    .component('topNav', topNav);

var dashboard = {
    templateUrl: './app/components/dashboard/dashboard.html',
    controller: DashboardController,
    bindings: {
        stats: '<',
        memAlert: '<'
   }
}

angular.module('root')
    .component('dashboard', dashboard);

function DashboardController() {
    var ctrl = this;

    ctrl.$onInit = function() {
        ctrl.memAlert = false;
    }

}

angular.module('root')
    .controller('DashboardController', DashboardController);

var cpuUsage = {
    templateUrl: 'app/components/dashboard/cpu-widget/cpu-widget.html',
    controller: CpuWidgetController,
    bindings: {
        chartConfig: '<'
    }
}

angular.module('root')
    .component('cpuUsage', cpuUsage);
function CpuWidgetController(StatsService, $log, $timeout) {
    var ctrl = this;

    ctrl.chartConfig = {
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
            ctrl.chartConfig.series[0].data.shift();
            ctrl.chartConfig.series[0].data.push(Math.floor(Math.random() * 20) + 1);
            ctrl.poll();
        }, 2000);
    }

    this.$onInit = function() {
        $log.log("hello");
        ctrl.poll();
    }

}

CpuWidgetController.$inject = ['StatsService', '$log', '$timeout'];

angular.module('root')
    .controller('CpuWidgetController', CpuWidgetController);
var memUsage = {
    templateUrl: 'app/components/dashboard/mem-widget/mem-widget.html',
    controller: MemWidgetController,
    bindings: {
        chartConfig: '<'
    }
}

angular.module('root')
    .component('memUsage', memUsage);

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
    
var diskUsage = {
    templateUrl: 'app/components/dashboard/disk-widget/disk-widget.html',
    controller: DiskWidgetController,
    bindings : {
        chartConfig : '<'
    }
}

angular.module('root')
    .component('diskUsage', diskUsage);
function DiskWidgetController(StatsService, $log, $timeout) {
    var ctrl = this;

    ctrl.chartConfig = {
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
            ctrl.chartConfig.series[0].data.shift();
            ctrl.chartConfig.series[0].data.push(Math.floor(Math.random() * 20) + 1);

            ctrl.chartConfig.series[1].data.shift();
            ctrl.chartConfig.series[1].data.push(Math.floor(Math.random() * 20) + 1);

            ctrl.chartConfig.series[2].data.shift();
            ctrl.chartConfig.series[2].data.push(Math.floor(Math.random() * 20) + 1);
            ctrl.poll();
        }, 2000);
    }

    this.$onInit = function() {
        $log.log("hello");
        ctrl.poll();
    }
}

DiskWidgetController.$inject = ['StatsService', '$log', '$timeout'];

angular.module('root')
    .controller('DiskWidgetController', DiskWidgetController);
    
var networkUsage = {
    templateUrl: 'app/components/dashboard/network-usage/network-usage.html',
    controller: NetworkUsageController,
    bindings: {
        chartConfig: '<'
    }
}

angular.module('root')
    .component('networkUsage', networkUsage);
    
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJvb3QubW9kdWxlLmpzIiwicm9vdC5yb3V0ZXMuanMiLCJjb21tb24vc2VydmljZXMvc3RhdHMuc2VydmljZS5qcyIsImNvbW1vbi90b3AtbmF2L3RvcC1uYXYuY29tcG9uZW50LmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvZGFzaGJvYXJkLmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvZGFzaGJvYXJkL2Rhc2hib2FyZC5jb250cm9sbGVyLmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvY3B1LXdpZGdldC9jcHUtd2lkZ2V0LmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvZGFzaGJvYXJkL2NwdS13aWRnZXQvY3B1LXdpZGdldC5jb250cm9sbGVyLmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvbWVtLXdpZGdldC9tZW0td2lkZ2V0LmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvZGFzaGJvYXJkL21lbS13aWRnZXQvbWVtLXdpZGdldC5jb250cm9sbGVyLmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvZGlzay13aWRnZXQvZGlzay13aWRnZXQuY29tcG9uZW50LmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvZGlzay13aWRnZXQvZGlzay13aWRnZXQuY29udHJvbGxlci5qcyIsImNvbXBvbmVudHMvZGFzaGJvYXJkL25ldHdvcmstdXNhZ2UvbmV0d29yay11c2FnZS5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9uZXR3b3JrLXVzYWdlL25ldHdvcmstdXNhZ2UuY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ3Jvb3QnLCBbXG4gICAgICAgICduZ1JvdXRlJyxcbiAgICAgICAgICdoaWdoY2hhcnRzLW5nJ1xuICAgIF0pO1xuIiwiZnVuY3Rpb24gcm91dGVQcm92aWRlcigkcm91dGVQcm92aWRlcil7XG4gICAgJHJvdXRlUHJvdmlkZXJcbiAgICAgIC53aGVuKCcvJywge1xuICAgICAgICAgIHRlbXBsYXRlOiAnPGRhc2hib2FyZD48L2Rhc2hib2FyZD4nXG4gICAgICB9KTtcbn1cbnJvdXRlUHJvdmlkZXIuJGluamVjdCA9IFsnJHJvdXRlUHJvdmlkZXInXTtcblxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxuICAuY29uZmlnKHJvdXRlUHJvdmlkZXIpO1xuIiwiZnVuY3Rpb24gU3RhdHNTZXJ2aWNlKCkge1xuICAgIHZhciBzZXJ2aWNlID0ge307XG5cbiAgICB2YXIgY29ubmVjdGlvbiA9IG5ldyBXZWJTb2NrZXQoJ3dzOi8vbG9jYWxob3N0OjkwMDAvc3RhdHMnKTtcblxuICAgIHZhciBtZXNzYWdlUXVldWUgPSBbXTtcblxuICAgIGNvbm5lY3Rpb24ub25vcGVuID0gZnVuY3Rpb24oKXsgIFxuICAgICAgICBjb25zb2xlLmxvZyhcIlNvY2tldCBoYXMgYmVlbiBvcGVuZWQhXCIpOyAgXG4gICAgfTtcblxuICAgIGNvbm5lY3Rpb24ub25tZXNzYWdlID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJTZXJ2ZXI6IFwiICsgZSk7XG4gICAgICAgIHRoaXMubWVzc2FnZVF1ZXVlLnB1c2goZSk7XG4gICAgfTtcblxuICAgIHJldHVybiBzZXJ2aWNlO1xufVxuXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXG4gICAgLmZhY3RvcnkoJ1N0YXRzU2VydmljZScsIFN0YXRzU2VydmljZSk7IiwidmFyIHRvcE5hdiA9IHtcbiAgICB0ZW1wbGF0ZVVybDogJy4vYXBwL2NvbW1vbi90b3AtbmF2L3RvcC1uYXYuaHRtbCdcbn1cblxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxuICAgIC5jb21wb25lbnQoJ3RvcE5hdicsIHRvcE5hdik7XG4iLCJ2YXIgZGFzaGJvYXJkID0ge1xuICAgIHRlbXBsYXRlVXJsOiAnLi9hcHAvY29tcG9uZW50cy9kYXNoYm9hcmQvZGFzaGJvYXJkLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6IERhc2hib2FyZENvbnRyb2xsZXIsXG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgc3RhdHM6ICc8JyxcbiAgICAgICAgbWVtQWxlcnQ6ICc8J1xuICAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXG4gICAgLmNvbXBvbmVudCgnZGFzaGJvYXJkJywgZGFzaGJvYXJkKTtcbiIsImZ1bmN0aW9uIERhc2hib2FyZENvbnRyb2xsZXIoKSB7XG4gICAgdmFyIGN0cmwgPSB0aGlzO1xuXG4gICAgY3RybC4kb25Jbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGN0cmwubWVtQWxlcnQgPSBmYWxzZTtcbiAgICB9XG5cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxuICAgIC5jb250cm9sbGVyKCdEYXNoYm9hcmRDb250cm9sbGVyJywgRGFzaGJvYXJkQ29udHJvbGxlcik7XG4iLCJ2YXIgY3B1VXNhZ2UgPSB7XG4gICAgdGVtcGxhdGVVcmw6ICdhcHAvY29tcG9uZW50cy9kYXNoYm9hcmQvY3B1LXdpZGdldC9jcHUtd2lkZ2V0Lmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6IENwdVdpZGdldENvbnRyb2xsZXIsXG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgY2hhcnRDb25maWc6ICc8J1xuICAgIH1cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxuICAgIC5jb21wb25lbnQoJ2NwdVVzYWdlJywgY3B1VXNhZ2UpOyIsImZ1bmN0aW9uIENwdVdpZGdldENvbnRyb2xsZXIoU3RhdHNTZXJ2aWNlLCAkbG9nLCAkdGltZW91dCkge1xuICAgIHZhciBjdHJsID0gdGhpcztcblxuICAgIGN0cmwuY2hhcnRDb25maWcgPSB7XG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGNoYXJ0OiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2FyZWEnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICB0ZXh0OiAnQ1BVIFVzYWdlIC0gTGFzdCA2MCBNaW51dGVzJ1xuICAgICAgICB9LFxuICAgICAgICBzZXJpZXM6IFt7XG4gICAgICAgICAgICBkYXRhOiBbMTAsIDE1LCAxMiwgOCwgN11cbiAgICAgICAgfV0sXG5cbiAgICAgICAgbG9hZGluZzogZmFsc2VcbiAgICB9ICAgXG5cbiAgICBjdHJsLnBvbGwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGN0cmwuY2hhcnRDb25maWcuc2VyaWVzWzBdLmRhdGEuc2hpZnQoKTtcbiAgICAgICAgICAgIGN0cmwuY2hhcnRDb25maWcuc2VyaWVzWzBdLmRhdGEucHVzaChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyMCkgKyAxKTtcbiAgICAgICAgICAgIGN0cmwucG9sbCgpO1xuICAgICAgICB9LCAyMDAwKTtcbiAgICB9XG5cbiAgICB0aGlzLiRvbkluaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgJGxvZy5sb2coXCJoZWxsb1wiKTtcbiAgICAgICAgY3RybC5wb2xsKCk7XG4gICAgfVxuXG59XG5cbkNwdVdpZGdldENvbnRyb2xsZXIuJGluamVjdCA9IFsnU3RhdHNTZXJ2aWNlJywgJyRsb2cnLCAnJHRpbWVvdXQnXTtcblxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxuICAgIC5jb250cm9sbGVyKCdDcHVXaWRnZXRDb250cm9sbGVyJywgQ3B1V2lkZ2V0Q29udHJvbGxlcik7IiwidmFyIG1lbVVzYWdlID0ge1xuICAgIHRlbXBsYXRlVXJsOiAnYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkL21lbS13aWRnZXQvbWVtLXdpZGdldC5odG1sJyxcbiAgICBjb250cm9sbGVyOiBNZW1XaWRnZXRDb250cm9sbGVyLFxuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIGNoYXJ0Q29uZmlnOiAnPCdcbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCdyb290JylcbiAgICAuY29tcG9uZW50KCdtZW1Vc2FnZScsIG1lbVVzYWdlKTtcbiIsImZ1bmN0aW9uIE1lbVdpZGdldENvbnRyb2xsZXIoU3RhdHNTZXJ2aWNlLCAkbG9nLCAkdGltZW91dCkge1xuICAgIHZhciBjdHJsID0gdGhpcztcblxuICAgIGN0cmwuY2hhcnRDb25maWcgPSB7XG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGNoYXJ0OiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2FyZWEnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICAgIHRleHQ6ICdNZW1vcnkgVXNhZ2UnXG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9hZGluZzogZmFsc2UsXG5cbiAgICAgICAgeEF4aXM6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCBcbiAgICAgICAgICAgICAgICAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2N0JywgJ05vdicsICdEZWMnXVxuICAgICAgICB9LFxuXG4gICAgICAgIHNlcmllczogW3tcbiAgICAgICAgICAgIGRhdGE6IFsyOS45LCA3MS41LCAxMDYuNCwgMTI5LjIsIDE0NC4wLCAxNzYuMCwgMTM1LjYsIDE0OC41LCAyMTYuNCwgMTk0LjEsIDk1LjYsIDU0LjRdXG4gICAgICAgIH1dXG4gICAgfTtcblxuICAgIGN0cmwucG9sbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkdGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgY3RybC5jaGFydENvbmZpZy5zZXJpZXNbMF0uZGF0YS5zaGlmdCgpO1xuICAgICAgICAgICAgY3RybC5jaGFydENvbmZpZy5zZXJpZXNbMF0uZGF0YS5wdXNoKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIwKSArIDEwMCk7XG4gICAgICAgICAgICBjdHJsLnBvbGwoKTtcbiAgICAgICAgfSwgMjAwMCk7XG4gICAgfVxuXG4gICAgdGhpcy4kb25Jbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGN0cmwucG9sbCgpO1xuICAgIH1cblxufVxuXG5NZW1XaWRnZXRDb250cm9sbGVyLiRpbmplY3QgPSBbJ1N0YXRzU2VydmljZScsICckbG9nJywgJyR0aW1lb3V0J107XG5cbmFuZ3VsYXIubW9kdWxlKCdyb290JylcbiAgICAuY29udHJvbGxlcignTWVtV2lkZ2V0Q29udHJvbGxlcicsIE1lbVdpZGdldENvbnRyb2xsZXIpO1xuICAgICIsInZhciBkaXNrVXNhZ2UgPSB7XG4gICAgdGVtcGxhdGVVcmw6ICdhcHAvY29tcG9uZW50cy9kYXNoYm9hcmQvZGlzay13aWRnZXQvZGlzay13aWRnZXQuaHRtbCcsXG4gICAgY29udHJvbGxlcjogRGlza1dpZGdldENvbnRyb2xsZXIsXG4gICAgYmluZGluZ3MgOiB7XG4gICAgICAgIGNoYXJ0Q29uZmlnIDogJzwnXG4gICAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXG4gICAgLmNvbXBvbmVudCgnZGlza1VzYWdlJywgZGlza1VzYWdlKTsiLCJmdW5jdGlvbiBEaXNrV2lkZ2V0Q29udHJvbGxlcihTdGF0c1NlcnZpY2UsICRsb2csICR0aW1lb3V0KSB7XG4gICAgdmFyIGN0cmwgPSB0aGlzO1xuXG4gICAgY3RybC5jaGFydENvbmZpZyA9IHtcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgY2hhcnQ6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnYXJlYSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc2VyaWVzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZGF0YTogWzI5LjksIDI5LjMsIDMxLjAsIDMyXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBkYXRhOiBbMy40LCA1LjMsIDUuOCwgNi4zXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBkYXRhOiBbNS44LCAxMi4zLCAxNi40LCAyMC4xXVxuICAgICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICB4QXhpczoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogWyctNCcsICctMycsICctMicsICctMSddXG4gICAgICAgIH0sXG4gICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICB0ZXh0OiAnRGlzayBVc2FnZSAtIDQgV2Vla3MnXG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9hZGluZzogZmFsc2VcbiAgICB9XG5cbiAgICBjdHJsLnBvbGwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGN0cmwuY2hhcnRDb25maWcuc2VyaWVzWzBdLmRhdGEuc2hpZnQoKTtcbiAgICAgICAgICAgIGN0cmwuY2hhcnRDb25maWcuc2VyaWVzWzBdLmRhdGEucHVzaChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyMCkgKyAxKTtcblxuICAgICAgICAgICAgY3RybC5jaGFydENvbmZpZy5zZXJpZXNbMV0uZGF0YS5zaGlmdCgpO1xuICAgICAgICAgICAgY3RybC5jaGFydENvbmZpZy5zZXJpZXNbMV0uZGF0YS5wdXNoKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIwKSArIDEpO1xuXG4gICAgICAgICAgICBjdHJsLmNoYXJ0Q29uZmlnLnNlcmllc1syXS5kYXRhLnNoaWZ0KCk7XG4gICAgICAgICAgICBjdHJsLmNoYXJ0Q29uZmlnLnNlcmllc1syXS5kYXRhLnB1c2goTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjApICsgMSk7XG4gICAgICAgICAgICBjdHJsLnBvbGwoKTtcbiAgICAgICAgfSwgMjAwMCk7XG4gICAgfVxuXG4gICAgdGhpcy4kb25Jbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICRsb2cubG9nKFwiaGVsbG9cIik7XG4gICAgICAgIGN0cmwucG9sbCgpO1xuICAgIH1cbn1cblxuRGlza1dpZGdldENvbnRyb2xsZXIuJGluamVjdCA9IFsnU3RhdHNTZXJ2aWNlJywgJyRsb2cnLCAnJHRpbWVvdXQnXTtcblxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxuICAgIC5jb250cm9sbGVyKCdEaXNrV2lkZ2V0Q29udHJvbGxlcicsIERpc2tXaWRnZXRDb250cm9sbGVyKTtcbiAgICAiLCJ2YXIgbmV0d29ya1VzYWdlID0ge1xuICAgIHRlbXBsYXRlVXJsOiAnYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkL25ldHdvcmstdXNhZ2UvbmV0d29yay11c2FnZS5odG1sJyxcbiAgICBjb250cm9sbGVyOiBOZXR3b3JrVXNhZ2VDb250cm9sbGVyLFxuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIGNoYXJ0Q29uZmlnOiAnPCdcbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCdyb290JylcbiAgICAuY29tcG9uZW50KCduZXR3b3JrVXNhZ2UnLCBuZXR3b3JrVXNhZ2UpO1xuICAgICIsImZ1bmN0aW9uIE5ldHdvcmtVc2FnZUNvbnRyb2xsZXIoU3RhdHNTZXJ2aWNlLCAkbG9nLCAkdGltZW91dCwgJHNjb3BlKSB7XG4gICAgdmFyIGN0cmwgPSB0aGlzO1xuXG4gICAgY3RybC5jaGFydENvbmZpZyA9IHtcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgY2hhcnQ6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnYXJlYSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgdGV4dDogJ05ldHdvcmsgVXNhZ2UgLSBMYXN0IDYwIE1pbnV0ZXMnXG4gICAgICAgIH0sXG4gICAgICAgIHlBeGlzOiB7XG4gICAgICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgICAgIHRleHQ6ICdUaHJvdWdocHV0IE1CaXQvcydcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgeEF4aXM6IHtcbiAgICAgICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICAgICAgdGV4dDogJ01pbnV0ZXMnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2F0ZWdvcmllczogWyctNTUnLCAnLTUwJywgJy00NScsICctNDAnLCAnLTM1JywgJy0zMCcsIFxuICAgICAgICAgICAgICAgICctMjUnLCAnLTIwJywgJy0xNScsICctMTAnLCAnLTA1JywgJzAnXVxuICAgICAgICB9LFxuICAgICAgICBwbG90T3B0aW9uczoge1xuICAgICAgICAgICAgbGluZToge1xuICAgICAgICAgICAgICAgIGRhdGFMYWJlbHM6IHtcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZW5hYmxlTW91c2VUcmFja2luZzogdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzZXJpZXM6IFtcbiAgICAgICAgICAgIHsgICBcbiAgICAgICAgICAgICAgICBuYW1lOiAnSW5ib3VuZCcsXG4gICAgICAgICAgICAgICAgZGF0YTogWzI5LjksIDcxLjUsIDI1LjQsIDQzLjIsIDM3LjAsIDMzLjAsIDM1LjYsIDQ4LjUsIDIxLjQsIDE5LjEsIDE2LjYsIDU0LjRdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdPdXRib3VuZCcsXG4gICAgICAgICAgICAgICAgZGF0YTogWzE5LjMsIDU2LjMsIDIzLjEsIDM4LjUsIDMyLjksIDI3LjAsIDMwLjYsIDQyLjMsIDE3LjQsIDEyLjAsIDkuMSwgMzQuMF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH07XG5cbiAgICAgY3RybC5wb2xsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAvLyBIZXJlIGlzIHdoZXJlIHlvdSBjb3VsZCBwb2xsIGEgUkVTVCBBUEkgb3IgdGhlIHdlYnNvY2tldHMgc2VydmljZSBmb3IgbGl2ZSBkYXRhXG4gICAgICAgICAgICBjdHJsLmNoYXJ0Q29uZmlnLnNlcmllc1swXS5kYXRhLnNoaWZ0KCk7XG4gICAgICAgICAgICBjdHJsLmNoYXJ0Q29uZmlnLnNlcmllc1swXS5kYXRhLnB1c2goTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjApICsgMSk7XG4gICAgICAgICAgICBjdHJsLmNoYXJ0Q29uZmlnLnNlcmllc1sxXS5kYXRhLnNoaWZ0KCk7XG4gICAgICAgICAgICBjdHJsLmNoYXJ0Q29uZmlnLnNlcmllc1sxXS5kYXRhLnB1c2goTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjApICsgMSk7XG4gICAgICAgICAgICBjdHJsLnBvbGwoKTtcbiAgICAgICAgfSwgMjAwMCk7XG4gICAgfVxuXG4gICAgdGhpcy4kb25Jbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICRsb2cubG9nKFwiaGVsbG9cIik7XG4gICAgICAgIGN0cmwucG9sbCgpO1xuICAgIH1cblxufVxuXG5OZXR3b3JrVXNhZ2VDb250cm9sbGVyLiRpbmplY3QgPSBbJ1N0YXRzU2VydmljZScsICckbG9nJywgJyR0aW1lb3V0J107XG5cbmFuZ3VsYXIubW9kdWxlKCdyb290JylcbiAgICAuY29udHJvbGxlcignTmV0d29ya1VzYWdlQ29udHJvbGxlcicsIE5ldHdvcmtVc2FnZUNvbnRyb2xsZXIpO1xuIl19
