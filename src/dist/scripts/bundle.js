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

        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },

        series: [{
            data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
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

        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },

        series: [{
            data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
        }]
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

    Highcharts.chart('container', {

        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },

        series: [{
            data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
        }]
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJvb3QubW9kdWxlLmpzIiwicm9vdC5yb3V0ZXMuanMiLCJzdGF0cy5zZXJ2aWNlLmpzIiwiY29tbW9uL3RvcC1uYXYvdG9wLW5hdi5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9kYXNoYm9hcmQuY29tcG9uZW50LmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvZGFzaGJvYXJkLmNvbnRyb2xsZXIuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9jcHUtd2lkZ2V0L2NwdS13aWRnZXQuY29tcG9uZW50LmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvY3B1LXdpZGdldC9jcHUtd2lkZ2V0LmNvbnRyb2xsZXIuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9kaXNrLXdpZGdldC9kaXNrLXdpZGdldC5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9kaXNrLXdpZGdldC9kaXNrLXdpZGdldC5jb250cm9sbGVyLmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvbWVtLXdpZGdldC9tZW0td2lkZ2V0LmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvZGFzaGJvYXJkL21lbS13aWRnZXQvbWVtLXdpZGdldC5jb250cm9sbGVyLmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvbmV0d29yay11c2FnZS9uZXR3b3JrLXVzYWdlLmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvZGFzaGJvYXJkL25ldHdvcmstdXNhZ2UvbmV0d29yay11c2FnZS5jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ3Jvb3QnLCBbXG4gICAgICAgICduZ1JvdXRlJ1xuICAgIF0pO1xuIiwiZnVuY3Rpb24gcm91dGVQcm92aWRlcigkcm91dGVQcm92aWRlcil7XG4gICAgJHJvdXRlUHJvdmlkZXJcbiAgICAgIC53aGVuKCcvJywge1xuICAgICAgICAgIHRlbXBsYXRlOiAnPGRhc2hib2FyZD48L2Rhc2hib2FyZD4nXG4gICAgICB9KTtcbn1cbnJvdXRlUHJvdmlkZXIuJGluamVjdCA9IFsnJHJvdXRlUHJvdmlkZXInXTtcblxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxuICAuY29uZmlnKHJvdXRlUHJvdmlkZXIpO1xuIiwiZnVuY3Rpb24gU3RhdHNTZXJ2aWNlKCkge1xuICAgIHZhciBzZXJ2aWNlID0ge307XG5cbiAgICB2YXIgY29ubmVjdGlvbiA9IG5ldyBXZWJTb2NrZXQoJ3dzOi8vbG9jYWxob3N0OjkwMDAvc3RhdHMnKTtcblxuICAgIHZhciBtZXNzYWdlUXVldWUgPSBbXTtcblxuICAgIGNvbm5lY3Rpb24ub25vcGVuID0gZnVuY3Rpb24oKXsgIFxuICAgICAgICBjb25zb2xlLmxvZyhcIlNvY2tldCBoYXMgYmVlbiBvcGVuZWQhXCIpOyAgXG4gICAgfTtcblxuICAgIGNvbm5lY3Rpb24ub25tZXNzYWdlID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJTZXJ2ZXI6IFwiICsgZSk7XG4gICAgICAgIHRoaXMubWVzc2FnZVF1ZXVlLnB1c2goZSk7XG4gICAgfTtcblxuICAgIHJldHVybiBzZXJ2aWNlO1xufVxuXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXG4gICAgLmZhY3RvcnkoJ1N0YXRzU2VydmljZScsIFN0YXRzU2VydmljZSk7IiwidmFyIHRvcE5hdiA9IHtcbiAgICB0ZW1wbGF0ZVVybDogJy4vYXBwL2NvbW1vbi90b3AtbmF2L3RvcC1uYXYuaHRtbCdcbn1cblxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxuICAgIC5jb21wb25lbnQoJ3RvcE5hdicsIHRvcE5hdik7XG4iLCJ2YXIgZGFzaGJvYXJkID0ge1xuICAgIHRlbXBsYXRlVXJsOiAnLi9hcHAvY29tcG9uZW50cy9kYXNoYm9hcmQvZGFzaGJvYXJkLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6IERhc2hib2FyZENvbnRyb2xsZXIsXG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgc3RhdHM6ICc8JyxcbiAgICAgICAgbWVtQWxlcnQ6ICc8J1xuICAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXG4gICAgLmNvbXBvbmVudCgnZGFzaGJvYXJkJywgZGFzaGJvYXJkKTtcbiIsImZ1bmN0aW9uIERhc2hib2FyZENvbnRyb2xsZXIoKSB7XG4gICAgdmFyIGN0cmwgPSB0aGlzO1xuXG4gICAgY3RybC4kb25Jbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGN0cmwubWVtQWxlcnQgPSBmYWxzZTtcbiAgICB9XG5cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxuICAgIC5jb250cm9sbGVyKCdEYXNoYm9hcmRDb250cm9sbGVyJywgRGFzaGJvYXJkQ29udHJvbGxlcik7XG4iLCJ2YXIgY3B1VXNhZ2UgPSB7XG4gICAgdGVtcGxhdGVVcmw6ICdhcHAvY29tcG9uZW50cy9kYXNoYm9hcmQvY3B1LXdpZGdldC9jcHUtd2lkZ2V0Lmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6IENwdVdpZGdldENvbnRyb2xsZXIsXG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgdXNhZ2U6ICc8JyxcbiAgICAgICAgc2VyaWVzOiAnPCcsXG4gICAgICAgIGxhYmVsczogJzwnLFxuICAgICAgICBkYXRhOiAnPCcsXG4gICAgICAgIG9wdGlvbnM6ICc8J1xuICAgIH1cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxuICAgIC5jb21wb25lbnQoJ2NwdVVzYWdlJywgY3B1VXNhZ2UpOyIsImZ1bmN0aW9uIENwdVdpZGdldENvbnRyb2xsZXIoU3RhdHNTZXJ2aWNlLCAkbG9nLCAkdGltZW91dCkge1xuICAgIHZhciBjdHJsID0gdGhpcztcblxuICAgIEhpZ2hjaGFydHMuY2hhcnQoJ2NwdXdpZGdldCcsIHtcblxuICAgICAgICB4QXhpczoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsIFxuICAgICAgICAgICAgICAgICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYyddXG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VyaWVzOiBbe1xuICAgICAgICAgICAgZGF0YTogWzI5LjksIDcxLjUsIDEwNi40LCAxMjkuMiwgMTQ0LjAsIDE3Ni4wLCAxMzUuNiwgMTQ4LjUsIDIxNi40LCAxOTQuMSwgOTUuNiwgNTQuNF1cbiAgICAgICAgfV1cbiAgICB9KTtcblxufVxuXG5DcHVXaWRnZXRDb250cm9sbGVyLiRpbmplY3QgPSBbJ1N0YXRzU2VydmljZScsICckbG9nJywgJyR0aW1lb3V0J107XG5cbmFuZ3VsYXIubW9kdWxlKCdyb290JylcbiAgICAuY29udHJvbGxlcignQ3B1V2lkZ2V0Q29udHJvbGxlcicsIENwdVdpZGdldENvbnRyb2xsZXIpOyIsInZhciBkaXNrVXNhZ2UgPSB7XG4gICAgdGVtcGxhdGVVcmw6ICdhcHAvY29tcG9uZW50cy9kYXNoYm9hcmQvZGlzay13aWRnZXQvZGlzay13aWRnZXQuaHRtbCcsXG4gICAgY29udHJvbGxlcjogRGlza1dpZGdldENvbnRyb2xsZXIsXG4gICAgYmluZGluZ3MgOiB7XG4gICAgICAgIHVzYWdlIDogJzwnLFxuICAgICAgICBzZXJpZXM6ICc8JyxcbiAgICAgICAgbGFiZWxzOiAnPCcsXG4gICAgICAgIGRhdGE6ICc8JyxcbiAgICAgICAgb3B0aW9uczogJzwnXG4gICAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXG4gICAgLmNvbXBvbmVudCgnZGlza1VzYWdlJywgZGlza1VzYWdlKTsiLCJmdW5jdGlvbiBEaXNrV2lkZ2V0Q29udHJvbGxlcihTdGF0c1NlcnZpY2UsICRsb2csICR0aW1lb3V0KSB7XG4gICAgdmFyIGN0cmwgPSB0aGlzO1xuXG4gICAgSGlnaGNoYXJ0cy5jaGFydCgnY29udGFpbmVyJywge1xuXG4gICAgICAgIHhBeGlzOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgXG4gICAgICAgICAgICAgICAgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJ11cbiAgICAgICAgfSxcblxuICAgICAgICBzZXJpZXM6IFt7XG4gICAgICAgICAgICBkYXRhOiBbMjkuOSwgNzEuNSwgMTA2LjQsIDEyOS4yLCAxNDQuMCwgMTc2LjAsIDEzNS42LCAxNDguNSwgMjE2LjQsIDE5NC4xLCA5NS42LCA1NC40XVxuICAgICAgICB9XVxuICAgIH0pO1xufVxuXG5EaXNrV2lkZ2V0Q29udHJvbGxlci4kaW5qZWN0ID0gWydTdGF0c1NlcnZpY2UnLCAnJGxvZycsICckdGltZW91dCddO1xuXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXG4gICAgLmNvbnRyb2xsZXIoJ0Rpc2tXaWRnZXRDb250cm9sbGVyJywgRGlza1dpZGdldENvbnRyb2xsZXIpO1xuICAgICIsInZhciBtZW1Vc2FnZSA9IHtcbiAgICB0ZW1wbGF0ZVVybDogJ2FwcC9jb21wb25lbnRzL2Rhc2hib2FyZC9tZW0td2lkZ2V0L21lbS13aWRnZXQuaHRtbCcsXG4gICAgY29udHJvbGxlcjogTWVtV2lkZ2V0Q29udHJvbGxlcixcbiAgICBiaW5kaW5nczoge1xuICAgICAgICB1c2FnZTogJzwnLFxuICAgICAgICBzZXJpZXM6ICc8JyxcbiAgICAgICAgbGFiZWxzOiAnPCcsXG4gICAgICAgIGRhdGE6ICc8JyxcbiAgICAgICAgb3B0aW9uczogJzwnXG4gICAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXG4gICAgLmNvbXBvbmVudCgnbWVtVXNhZ2UnLCBtZW1Vc2FnZSk7XG4iLCJmdW5jdGlvbiBNZW1XaWRnZXRDb250cm9sbGVyKFN0YXRzU2VydmljZSwgJGxvZywgJHRpbWVvdXQpIHtcbiAgICB2YXIgY3RybCA9IHRoaXM7XG5cbiAgICBIaWdoY2hhcnRzLmNoYXJ0KCdtZW13aWRnZXQnLCB7XG5cbiAgICAgICAgeEF4aXM6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCBcbiAgICAgICAgICAgICAgICAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2N0JywgJ05vdicsICdEZWMnXVxuICAgICAgICB9LFxuXG4gICAgICAgIHNlcmllczogW3tcbiAgICAgICAgICAgIGRhdGE6IFsyOS45LCA3MS41LCAxMDYuNCwgMTI5LjIsIDE0NC4wLCAxNzYuMCwgMTM1LjYsIDE0OC41LCAyMTYuNCwgMTk0LjEsIDk1LjYsIDU0LjRdXG4gICAgICAgIH1dXG4gICAgfSk7XG4gICAgXG59XG5cbk1lbVdpZGdldENvbnRyb2xsZXIuJGluamVjdCA9IFsnU3RhdHNTZXJ2aWNlJywgJyRsb2cnLCAnJHRpbWVvdXQnXTtcblxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxuICAgIC5jb250cm9sbGVyKCdNZW1XaWRnZXRDb250cm9sbGVyJywgTWVtV2lkZ2V0Q29udHJvbGxlcik7XG4gICAgIiwidmFyIG5ldHdvcmtVc2FnZSA9IHtcbiAgICB0ZW1wbGF0ZVVybDogJ2FwcC9jb21wb25lbnRzL2Rhc2hib2FyZC9uZXR3b3JrLXVzYWdlL25ldHdvcmstdXNhZ2UuaHRtbCcsXG4gICAgY29udHJvbGxlcjogTmV0d29ya1VzYWdlQ29udHJvbGxlcixcbiAgICBiaW5kaW5nczoge1xuICAgICAgICB1c2FnZTogJzwnLFxuICAgICAgICBzZXJpZXM6ICc8JyxcbiAgICAgICAgbGFiZWxzOiAnPCcsXG4gICAgICAgIGRhdGE6ICc8JyxcbiAgICAgICAgb3B0aW9uczogJzwnXG4gICAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXG4gICAgLmNvbXBvbmVudCgnbmV0d29ya1VzYWdlJywgbmV0d29ya1VzYWdlKTtcbiAgICAiLCJmdW5jdGlvbiBOZXR3b3JrVXNhZ2VDb250cm9sbGVyKFN0YXRzU2VydmljZSwgJGxvZywgJHRpbWVvdXQsICRzY29wZSkge1xuICAgIHZhciBjdHJsID0gdGhpcztcblxuICAgIEhpZ2hjaGFydHMuY2hhcnQoJ2NvbnRhaW5lcicsIHtcblxuICAgICAgICB4QXhpczoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsIFxuICAgICAgICAgICAgICAgICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYyddXG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VyaWVzOiBbe1xuICAgICAgICAgICAgZGF0YTogWzI5LjksIDcxLjUsIDEwNi40LCAxMjkuMiwgMTQ0LjAsIDE3Ni4wLCAxMzUuNiwgMTQ4LjUsIDIxNi40LCAxOTQuMSwgOTUuNiwgNTQuNF1cbiAgICAgICAgfV1cbiAgICB9KTtcblxuICAgIGN0cmwucG9sbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgY3RybC5wb2xsKCk7XG4gICAgICAgIH0sIDIwMDApO1xuICAgIH1cblxuICAgIGN0cmwuJG9uSW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjdHJsLnBvbGwoKTtcbiAgICB9O1xuXG59XG5cbk5ldHdvcmtVc2FnZUNvbnRyb2xsZXIuJGluamVjdCA9IFsnU3RhdHNTZXJ2aWNlJywgJyRsb2cnLCAnJHRpbWVvdXQnLCAnJHNjb3BlJ107XG5cbmFuZ3VsYXIubW9kdWxlKCdyb290JylcbiAgICAuY29udHJvbGxlcignTmV0d29ya1VzYWdlQ29udHJvbGxlcicsIE5ldHdvcmtVc2FnZUNvbnRyb2xsZXIpO1xuIl19
