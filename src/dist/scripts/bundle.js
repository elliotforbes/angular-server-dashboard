angular.module('root', [
        'ngRoute'
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
        usage: '<',
        series: '<',
        labels: '<',
        data: '<',
        options: '<'
    }
}

angular.module('root')
    .component('cpuUsage', cpuUsage);
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
var diskUsage = {
    templateUrl: 'app/components/dashboard/disk-widget/disk-widget.html',
    controller: DiskWidgetController,
    bindings : {
        usage : '<',
        series: '<',
        labels: '<',
        data: '<',
        options: '<'
    }
}

angular.module('root')
    .component('diskUsage', diskUsage);
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
    
var memUsage = {
    templateUrl: 'app/components/dashboard/mem-widget/mem-widget.html',
    controller: MemWidgetController,
    bindings: {
        usage: '<',
        series: '<',
        labels: '<',
        data: '<',
        options: '<'
    }
}

angular.module('root')
    .component('memUsage', memUsage);

function MemWidgetController(StatsService, $log, $timeout) {
    var ctrl = this;

    Highcharts.chart('memwidget', {

        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },

        series: [{
            data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
        }]
    });
    
}

MemWidgetController.$inject = ['StatsService', '$log', '$timeout'];

angular.module('root')
    .controller('MemWidgetController', MemWidgetController);
    
var networkUsage = {
    templateUrl: 'app/components/dashboard/network-usage/network-usage.html',
    controller: NetworkUsageController,
    bindings: {
        usage: '<',
        series: '<',
        labels: '<',
        data: '<',
        options: '<'
    }
}

angular.module('root')
    .component('networkUsage', networkUsage);
    
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJvb3QubW9kdWxlLmpzIiwicm9vdC5yb3V0ZXMuanMiLCJzdGF0cy5zZXJ2aWNlLmpzIiwiY29tbW9uL3RvcC1uYXYvdG9wLW5hdi5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9kYXNoYm9hcmQuY29tcG9uZW50LmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvZGFzaGJvYXJkLmNvbnRyb2xsZXIuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9jcHUtd2lkZ2V0L2NwdS13aWRnZXQuY29tcG9uZW50LmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvY3B1LXdpZGdldC9jcHUtd2lkZ2V0LmNvbnRyb2xsZXIuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9kaXNrLXdpZGdldC9kaXNrLXdpZGdldC5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9kaXNrLXdpZGdldC9kaXNrLXdpZGdldC5jb250cm9sbGVyLmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvbWVtLXdpZGdldC9tZW0td2lkZ2V0LmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvZGFzaGJvYXJkL21lbS13aWRnZXQvbWVtLXdpZGdldC5jb250cm9sbGVyLmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvbmV0d29yay11c2FnZS9uZXR3b3JrLXVzYWdlLmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvZGFzaGJvYXJkL25ldHdvcmstdXNhZ2UvbmV0d29yay11c2FnZS5jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgncm9vdCcsIFtcclxuICAgICAgICAnbmdSb3V0ZSdcclxuICAgIF0pO1xyXG4iLCJmdW5jdGlvbiByb3V0ZVByb3ZpZGVyKCRyb3V0ZVByb3ZpZGVyKXtcclxuICAgICRyb3V0ZVByb3ZpZGVyXHJcbiAgICAgIC53aGVuKCcvJywge1xyXG4gICAgICAgICAgdGVtcGxhdGU6ICc8ZGFzaGJvYXJkPjwvZGFzaGJvYXJkPidcclxuICAgICAgfSk7XHJcbn1cclxucm91dGVQcm92aWRlci4kaW5qZWN0ID0gWyckcm91dGVQcm92aWRlciddO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxyXG4gIC5jb25maWcocm91dGVQcm92aWRlcik7XHJcbiIsImZ1bmN0aW9uIFN0YXRzU2VydmljZSgpIHtcclxuICAgIHZhciBzZXJ2aWNlID0ge307XHJcblxyXG4gICAgdmFyIGNvbm5lY3Rpb24gPSBuZXcgV2ViU29ja2V0KCd3czovL2xvY2FsaG9zdDo5MDAwL3N0YXRzJyk7XHJcblxyXG4gICAgdmFyIG1lc3NhZ2VRdWV1ZSA9IFtdO1xyXG5cclxuICAgIGNvbm5lY3Rpb24ub25vcGVuID0gZnVuY3Rpb24oKXsgIFxyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiU29ja2V0IGhhcyBiZWVuIG9wZW5lZCFcIik7ICBcclxuICAgIH07XHJcblxyXG4gICAgY29ubmVjdGlvbi5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiU2VydmVyOiBcIiArIGUpO1xyXG4gICAgICAgIHRoaXMubWVzc2FnZVF1ZXVlLnB1c2goZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBzZXJ2aWNlO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXHJcbiAgICAuZmFjdG9yeSgnU3RhdHNTZXJ2aWNlJywgU3RhdHNTZXJ2aWNlKTsiLCJ2YXIgdG9wTmF2ID0ge1xyXG4gICAgdGVtcGxhdGVVcmw6ICcuL2FwcC9jb21tb24vdG9wLW5hdi90b3AtbmF2Lmh0bWwnXHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdyb290JylcclxuICAgIC5jb21wb25lbnQoJ3RvcE5hdicsIHRvcE5hdik7XHJcbiIsInZhciBkYXNoYm9hcmQgPSB7XHJcbiAgICB0ZW1wbGF0ZVVybDogJy4vYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkL2Rhc2hib2FyZC5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6IERhc2hib2FyZENvbnRyb2xsZXIsXHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIHN0YXRzOiAnPCcsXHJcbiAgICAgICAgbWVtQWxlcnQ6ICc8J1xyXG4gICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdyb290JylcclxuICAgIC5jb21wb25lbnQoJ2Rhc2hib2FyZCcsIGRhc2hib2FyZCk7XHJcbiIsImZ1bmN0aW9uIERhc2hib2FyZENvbnRyb2xsZXIoKSB7XHJcbiAgICB2YXIgY3RybCA9IHRoaXM7XHJcblxyXG4gICAgY3RybC4kb25Jbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY3RybC5tZW1BbGVydCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0Rhc2hib2FyZENvbnRyb2xsZXInLCBEYXNoYm9hcmRDb250cm9sbGVyKTtcclxuIiwidmFyIGNwdVVzYWdlID0ge1xyXG4gICAgdGVtcGxhdGVVcmw6ICdhcHAvY29tcG9uZW50cy9kYXNoYm9hcmQvY3B1LXdpZGdldC9jcHUtd2lkZ2V0Lmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogQ3B1V2lkZ2V0Q29udHJvbGxlcixcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgdXNhZ2U6ICc8JyxcclxuICAgICAgICBzZXJpZXM6ICc8JyxcclxuICAgICAgICBsYWJlbHM6ICc8JyxcclxuICAgICAgICBkYXRhOiAnPCcsXHJcbiAgICAgICAgb3B0aW9uczogJzwnXHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdyb290JylcclxuICAgIC5jb21wb25lbnQoJ2NwdVVzYWdlJywgY3B1VXNhZ2UpOyIsImZ1bmN0aW9uIENwdVdpZGdldENvbnRyb2xsZXIoU3RhdHNTZXJ2aWNlLCAkbG9nLCAkdGltZW91dCkge1xyXG4gICAgdmFyIGN0cmwgPSB0aGlzO1xyXG5cclxuICAgIEhpZ2hjaGFydHMuY2hhcnQoJ2NwdXdpZGdldCcsIHtcclxuICAgICAgICBjaGFydDoge1xyXG4gICAgICAgICAgICB0eXBlOiAnYXJlYSdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRpdGxlOiB7XHJcbiAgICAgICAgICAgIHRleHQ6ICdDUFUgVXNhZ2UgKCUpJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeUF4aXM6IHtcclxuICAgICAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgICAgICAgIHRleHQ6ICdQZXJjZW50YWdlICglKSdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeEF4aXM6IHtcclxuICAgICAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgICAgICAgIHRleHQ6ICdNaW51dGVzIEFnbydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY2F0ZWdvcmllczogWyc1NScsICc1MCcsICc0NScsICc0MCcsICczNScsICczMCcsIFxyXG4gICAgICAgICAgICAgICAgJzI1JywgJzIwJywgJzE1JywgJzEwJywgJzUnLCAnMCddXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2VyaWVzOiBbe1xyXG4gICAgICAgICAgICBkYXRhOiBbMjkuOSwgNzEuNSwgMTYuNCwgMjkuMiwgNDQuMCwgNzYuMCwgMzUuNiwgNDguNSwgMTYuNCwgOTQuMSwgOTUuNiwgNTQuNF1cclxuICAgICAgICB9XVxyXG4gICAgfSk7XHJcblxyXG59XHJcblxyXG5DcHVXaWRnZXRDb250cm9sbGVyLiRpbmplY3QgPSBbJ1N0YXRzU2VydmljZScsICckbG9nJywgJyR0aW1lb3V0J107XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXHJcbiAgICAuY29udHJvbGxlcignQ3B1V2lkZ2V0Q29udHJvbGxlcicsIENwdVdpZGdldENvbnRyb2xsZXIpOyIsInZhciBkaXNrVXNhZ2UgPSB7XHJcbiAgICB0ZW1wbGF0ZVVybDogJ2FwcC9jb21wb25lbnRzL2Rhc2hib2FyZC9kaXNrLXdpZGdldC9kaXNrLXdpZGdldC5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6IERpc2tXaWRnZXRDb250cm9sbGVyLFxyXG4gICAgYmluZGluZ3MgOiB7XHJcbiAgICAgICAgdXNhZ2UgOiAnPCcsXHJcbiAgICAgICAgc2VyaWVzOiAnPCcsXHJcbiAgICAgICAgbGFiZWxzOiAnPCcsXHJcbiAgICAgICAgZGF0YTogJzwnLFxyXG4gICAgICAgIG9wdGlvbnM6ICc8J1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXHJcbiAgICAuY29tcG9uZW50KCdkaXNrVXNhZ2UnLCBkaXNrVXNhZ2UpOyIsImZ1bmN0aW9uIERpc2tXaWRnZXRDb250cm9sbGVyKFN0YXRzU2VydmljZSwgJGxvZywgJHRpbWVvdXQpIHtcclxuICAgIHZhciBjdHJsID0gdGhpcztcclxuXHJcbiAgICBIaWdoY2hhcnRzLmNoYXJ0KCdjb250YWluZXInLCB7XHJcbiAgICAgICAgY2hhcnQ6IHtcclxuICAgICAgICAgICAgdHlwZTogJ2FyZWEnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aXRsZToge1xyXG4gICAgICAgICAgICB0ZXh0OiAnRGlzayBVc2FnZSAtIDQgd2Vla3MnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB5QXhpczoge1xyXG4gICAgICAgICAgICB0aXRsZToge1xyXG4gICAgICAgICAgICAgICAgdGV4dDogJ0JpbGxpb25zJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBsYWJlbHM6IHtcclxuICAgICAgICAgICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbHVlIC8gMTAwMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeEF4aXM6IHtcclxuICAgICAgICAgICAgY2F0ZWdvcmllczogWyctNCcsICctMycsICctMicsICctMSddXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2VyaWVzOiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGRhdGE6IFsyOS45LCAyOS4zLCAzMS4wLCAzMl1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZGF0YTogWzMuNCwgNS4zLCA1LjgsIDYuM11cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZGF0YTogWzUuOCwgMTIuMywgMTYuNCwgMjAuMV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgIH0pO1xyXG59XHJcblxyXG5EaXNrV2lkZ2V0Q29udHJvbGxlci4kaW5qZWN0ID0gWydTdGF0c1NlcnZpY2UnLCAnJGxvZycsICckdGltZW91dCddO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0Rpc2tXaWRnZXRDb250cm9sbGVyJywgRGlza1dpZGdldENvbnRyb2xsZXIpO1xyXG4gICAgIiwidmFyIG1lbVVzYWdlID0ge1xyXG4gICAgdGVtcGxhdGVVcmw6ICdhcHAvY29tcG9uZW50cy9kYXNoYm9hcmQvbWVtLXdpZGdldC9tZW0td2lkZ2V0Lmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogTWVtV2lkZ2V0Q29udHJvbGxlcixcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgdXNhZ2U6ICc8JyxcclxuICAgICAgICBzZXJpZXM6ICc8JyxcclxuICAgICAgICBsYWJlbHM6ICc8JyxcclxuICAgICAgICBkYXRhOiAnPCcsXHJcbiAgICAgICAgb3B0aW9uczogJzwnXHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdyb290JylcclxuICAgIC5jb21wb25lbnQoJ21lbVVzYWdlJywgbWVtVXNhZ2UpO1xyXG4iLCJmdW5jdGlvbiBNZW1XaWRnZXRDb250cm9sbGVyKFN0YXRzU2VydmljZSwgJGxvZywgJHRpbWVvdXQpIHtcclxuICAgIHZhciBjdHJsID0gdGhpcztcclxuXHJcbiAgICBIaWdoY2hhcnRzLmNoYXJ0KCdtZW13aWRnZXQnLCB7XHJcblxyXG4gICAgICAgIHhBeGlzOiB7XHJcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCBcclxuICAgICAgICAgICAgICAgICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYyddXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2VyaWVzOiBbe1xyXG4gICAgICAgICAgICBkYXRhOiBbMjkuOSwgNzEuNSwgMTA2LjQsIDEyOS4yLCAxNDQuMCwgMTc2LjAsIDEzNS42LCAxNDguNSwgMjE2LjQsIDE5NC4xLCA5NS42LCA1NC40XVxyXG4gICAgICAgIH1dXHJcbiAgICB9KTtcclxuICAgIFxyXG59XHJcblxyXG5NZW1XaWRnZXRDb250cm9sbGVyLiRpbmplY3QgPSBbJ1N0YXRzU2VydmljZScsICckbG9nJywgJyR0aW1lb3V0J107XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXHJcbiAgICAuY29udHJvbGxlcignTWVtV2lkZ2V0Q29udHJvbGxlcicsIE1lbVdpZGdldENvbnRyb2xsZXIpO1xyXG4gICAgIiwidmFyIG5ldHdvcmtVc2FnZSA9IHtcclxuICAgIHRlbXBsYXRlVXJsOiAnYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkL25ldHdvcmstdXNhZ2UvbmV0d29yay11c2FnZS5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6IE5ldHdvcmtVc2FnZUNvbnRyb2xsZXIsXHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIHVzYWdlOiAnPCcsXHJcbiAgICAgICAgc2VyaWVzOiAnPCcsXHJcbiAgICAgICAgbGFiZWxzOiAnPCcsXHJcbiAgICAgICAgZGF0YTogJzwnLFxyXG4gICAgICAgIG9wdGlvbnM6ICc8J1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXHJcbiAgICAuY29tcG9uZW50KCduZXR3b3JrVXNhZ2UnLCBuZXR3b3JrVXNhZ2UpO1xyXG4gICAgIiwiZnVuY3Rpb24gTmV0d29ya1VzYWdlQ29udHJvbGxlcihTdGF0c1NlcnZpY2UsICRsb2csICR0aW1lb3V0LCAkc2NvcGUpIHtcclxuICAgIHZhciBjdHJsID0gdGhpcztcclxuXHJcbiAgICBIaWdoY2hhcnRzLmNoYXJ0KCduZXR3b3JrdXNhZ2UnLCB7XHJcbiAgICAgICAgdGl0bGU6IHtcclxuICAgICAgICAgICAgdGV4dDogJ05ldHdvcmsgVXNhZ2UgLSBMYXN0IDYwIE1pbnV0ZXMnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB5QXhpczoge1xyXG4gICAgICAgICAgICB0aXRsZToge1xyXG4gICAgICAgICAgICAgICAgdGV4dDogJ1Rocm91Z2hwdXQgTUJpdC9zJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICB4QXhpczoge1xyXG4gICAgICAgICAgICB0aXRsZToge1xyXG4gICAgICAgICAgICAgICAgdGV4dDogJ01pbnV0ZXMnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFsnLTU1JywgJy01MCcsICctNDUnLCAnLTQwJywgJy0zNScsICctMzAnLCBcclxuICAgICAgICAgICAgICAgICctMjUnLCAnLTIwJywgJy0xNScsICctMTAnLCAnLTA1JywgJzAnXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcGxvdE9wdGlvbnM6IHtcclxuICAgICAgICAgICAgbGluZToge1xyXG4gICAgICAgICAgICAgICAgZGF0YUxhYmVsczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWVcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBlbmFibGVNb3VzZVRyYWNraW5nOiB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlcmllczogW1xyXG4gICAgICAgICAgICB7ICAgXHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnSW5ib3VuZCcsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbMjkuOSwgNzEuNSwgMjUuNCwgNDMuMiwgMzcuMCwgMzMuMCwgMzUuNiwgNDguNSwgMjEuNCwgMTkuMSwgMTYuNiwgNTQuNF1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ091dGJvdW5kJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IFsxOS4zLCA1Ni4zLCAyMy4xLCAzOC41LCAzMi45LCAyNy4wLCAzMC42LCA0Mi4zLCAxNy40LCAxMi4wLCA5LjEsIDM0LjBdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICB9KTtcclxuXHJcbiAgICBjdHJsLnBvbGwgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY3RybC5wb2xsKCk7XHJcbiAgICAgICAgfSwgMjAwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgY3RybC4kb25Jbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY3RybC5wb2xsKCk7XHJcbiAgICB9O1xyXG5cclxufVxyXG5cclxuTmV0d29ya1VzYWdlQ29udHJvbGxlci4kaW5qZWN0ID0gWydTdGF0c1NlcnZpY2UnLCAnJGxvZycsICckdGltZW91dCcsICckc2NvcGUnXTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdyb290JylcclxuICAgIC5jb250cm9sbGVyKCdOZXR3b3JrVXNhZ2VDb250cm9sbGVyJywgTmV0d29ya1VzYWdlQ29udHJvbGxlcik7XHJcbiJdfQ==
