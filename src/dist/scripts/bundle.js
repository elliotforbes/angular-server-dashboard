angular.module('root', [
        'ngRoute',
        'chart.js'
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

    var connection = new WebSocket('http://localhost:9000/stats');

    ws.onopen = function(){  
        console.log("Socket has been opened!");  
    };

    connection.onmessage = function (e) {
        console.log("Server: " + e);
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
        stats: '<'
   }
}

angular.module('root')
    .component('dashboard', dashboard);
function DashboardController() {
    var ctrl = this;
}

angular.module('root')
    .controller('DashboardController', DashboardController);
var cpuUsage = {
    templateUrl: 'app/components/dashboard/cpu-widget/cpu-widget.html',
    controller: CpuWidgetController,
    bindings: {
        usage: '<'
    }
}

angular.module('root')
    .component('cpuUsage', cpuUsage);
function CpuWidgetController() {
    var ctrl = this;
}

angular.module('root')
    .controller('CpuUsageController', CpuUsageController);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJvb3QubW9kdWxlLmpzIiwicm9vdC5yb3V0ZXMuanMiLCJzdGF0cy5zZXJ2aWNlLmpzIiwiY29tbW9uL3RvcC1uYXYvdG9wLW5hdi5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9kYXNoYm9hcmQuY29tcG9uZW50LmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvZGFzaGJvYXJkLmNvbnRyb2xsZXIuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9jcHUtd2lkZ2V0L2NwdS13aWRnZXQuY29tcG9uZW50LmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvY3B1LXdpZGdldC9jcHUtd2lkZ2V0LmNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCdyb290JywgW1xyXG4gICAgICAgICduZ1JvdXRlJyxcclxuICAgICAgICAnY2hhcnQuanMnXHJcbiAgICBdKTtcclxuIiwiZnVuY3Rpb24gcm91dGVQcm92aWRlcigkcm91dGVQcm92aWRlcil7XHJcbiAgICAkcm91dGVQcm92aWRlclxyXG4gICAgICAud2hlbignLycsIHtcclxuICAgICAgICAgIHRlbXBsYXRlOiAnPGRhc2hib2FyZD48L2Rhc2hib2FyZD4nXHJcbiAgICAgIH0pO1xyXG59XHJcbnJvdXRlUHJvdmlkZXIuJGluamVjdCA9IFsnJHJvdXRlUHJvdmlkZXInXTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdyb290JylcclxuICAuY29uZmlnKHJvdXRlUHJvdmlkZXIpO1xyXG4iLCJmdW5jdGlvbiBTdGF0c1NlcnZpY2UoKSB7XHJcbiAgICB2YXIgc2VydmljZSA9IHt9O1xyXG5cclxuICAgIHZhciBjb25uZWN0aW9uID0gbmV3IFdlYlNvY2tldCgnaHR0cDovL2xvY2FsaG9zdDo5MDAwL3N0YXRzJyk7XHJcblxyXG4gICAgd3Mub25vcGVuID0gZnVuY3Rpb24oKXsgIFxyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiU29ja2V0IGhhcyBiZWVuIG9wZW5lZCFcIik7ICBcclxuICAgIH07XHJcblxyXG4gICAgY29ubmVjdGlvbi5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiU2VydmVyOiBcIiArIGUpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gc2VydmljZTtcclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxyXG4gICAgLmZhY3RvcnkoJ1N0YXRzU2VydmljZScsIFN0YXRzU2VydmljZSk7IiwidmFyIHRvcE5hdiA9IHtcclxuICAgIHRlbXBsYXRlVXJsOiAnLi9hcHAvY29tbW9uL3RvcC1uYXYvdG9wLW5hdi5odG1sJ1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXHJcbiAgICAuY29tcG9uZW50KCd0b3BOYXYnLCB0b3BOYXYpO1xyXG4iLCJ2YXIgZGFzaGJvYXJkID0ge1xyXG4gICAgdGVtcGxhdGVVcmw6ICcuL2FwcC9jb21wb25lbnRzL2Rhc2hib2FyZC9kYXNoYm9hcmQuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiBEYXNoYm9hcmRDb250cm9sbGVyLFxyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBzdGF0czogJzwnXHJcbiAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxyXG4gICAgLmNvbXBvbmVudCgnZGFzaGJvYXJkJywgZGFzaGJvYXJkKTsiLCJmdW5jdGlvbiBEYXNoYm9hcmRDb250cm9sbGVyKCkge1xyXG4gICAgdmFyIGN0cmwgPSB0aGlzO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXHJcbiAgICAuY29udHJvbGxlcignRGFzaGJvYXJkQ29udHJvbGxlcicsIERhc2hib2FyZENvbnRyb2xsZXIpOyIsInZhciBjcHVVc2FnZSA9IHtcclxuICAgIHRlbXBsYXRlVXJsOiAnYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkL2NwdS13aWRnZXQvY3B1LXdpZGdldC5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6IENwdVdpZGdldENvbnRyb2xsZXIsXHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIHVzYWdlOiAnPCdcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxyXG4gICAgLmNvbXBvbmVudCgnY3B1VXNhZ2UnLCBjcHVVc2FnZSk7IiwiZnVuY3Rpb24gQ3B1V2lkZ2V0Q29udHJvbGxlcigpIHtcclxuICAgIHZhciBjdHJsID0gdGhpcztcclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0NwdVVzYWdlQ29udHJvbGxlcicsIENwdVVzYWdlQ29udHJvbGxlcik7Il19
