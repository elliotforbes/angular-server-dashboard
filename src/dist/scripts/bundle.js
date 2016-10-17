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
    .controller('CpuWidgetController', CpuWidgetController);
var diskUsage = {
    templateUrl: 'app/components/dashboard/disk-widget/disk-widget.html',
    controller: DiskWidgetController,
    bindings : {
        usage : '<'
    }
}

angular.module('root')
    .component('diskUsage', diskUsage);
function DiskWidgetController() {
    var ctrl = this;
}

angular.module('root')
    .controller('DiskWidgetController', DiskWidgetController);
    
var memUsage = {
    templateUrl: 'app/components/dashboard/mem-widget/mem-widget.html',
    controller: MemWidgetController,
    bindings: {
        usage: '<'
    }
}

angular.module('root')
    .component('memUsage', memUsage);

function MemWidgetController() {
    var ctrl = this;
}

angular.module('root')
    .controller('MemWidgetController', MemWidgetController);
    
var networkUsage = {
    templateUrl: 'app/components/dashboard/network-usage/network-usage.html',
    controller: NetworkUsageController,
    bindings: {
        usage: '<'
    }
}

angular.module('root')
    .component('networkUsage', networkUsage);
    
function NetworkUsageController() {
    var ctrl = this;
}

angular.module('root')
    .controller('NetworkUsageController', NetworkUsageController);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJvb3QubW9kdWxlLmpzIiwicm9vdC5yb3V0ZXMuanMiLCJzdGF0cy5zZXJ2aWNlLmpzIiwiY29tbW9uL3RvcC1uYXYvdG9wLW5hdi5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9kYXNoYm9hcmQuY29tcG9uZW50LmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvZGFzaGJvYXJkLmNvbnRyb2xsZXIuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9jcHUtd2lkZ2V0L2NwdS13aWRnZXQuY29tcG9uZW50LmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvY3B1LXdpZGdldC9jcHUtd2lkZ2V0LmNvbnRyb2xsZXIuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9kaXNrLXdpZGdldC9kaXNrLXdpZGdldC5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9kaXNrLXdpZGdldC9kaXNrLXdpZGdldC5jb250cm9sbGVyLmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvbWVtLXdpZGdldC9tZW0td2lkZ2V0LmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvZGFzaGJvYXJkL21lbS13aWRnZXQvbWVtLXdpZGdldC5jb250cm9sbGVyLmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvbmV0d29yay11c2FnZS9uZXR3b3JrLXVzYWdlLmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvZGFzaGJvYXJkL25ldHdvcmstdXNhZ2UvbmV0d29yay11c2FnZS5jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ3Jvb3QnLCBbXHJcbiAgICAgICAgJ25nUm91dGUnLFxyXG4gICAgICAgICdjaGFydC5qcydcclxuICAgIF0pO1xyXG4iLCJmdW5jdGlvbiByb3V0ZVByb3ZpZGVyKCRyb3V0ZVByb3ZpZGVyKXtcclxuICAgICRyb3V0ZVByb3ZpZGVyXHJcbiAgICAgIC53aGVuKCcvJywge1xyXG4gICAgICAgICAgdGVtcGxhdGU6ICc8ZGFzaGJvYXJkPjwvZGFzaGJvYXJkPidcclxuICAgICAgfSk7XHJcbn1cclxucm91dGVQcm92aWRlci4kaW5qZWN0ID0gWyckcm91dGVQcm92aWRlciddO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxyXG4gIC5jb25maWcocm91dGVQcm92aWRlcik7XHJcbiIsImZ1bmN0aW9uIFN0YXRzU2VydmljZSgpIHtcclxuICAgIHZhciBzZXJ2aWNlID0ge307XHJcblxyXG4gICAgdmFyIGNvbm5lY3Rpb24gPSBuZXcgV2ViU29ja2V0KCdodHRwOi8vbG9jYWxob3N0OjkwMDAvc3RhdHMnKTtcclxuXHJcbiAgICB3cy5vbm9wZW4gPSBmdW5jdGlvbigpeyAgXHJcbiAgICAgICAgY29uc29sZS5sb2coXCJTb2NrZXQgaGFzIGJlZW4gb3BlbmVkIVwiKTsgIFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25uZWN0aW9uLm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJTZXJ2ZXI6IFwiICsgZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBzZXJ2aWNlO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXHJcbiAgICAuZmFjdG9yeSgnU3RhdHNTZXJ2aWNlJywgU3RhdHNTZXJ2aWNlKTsiLCJ2YXIgdG9wTmF2ID0ge1xyXG4gICAgdGVtcGxhdGVVcmw6ICcuL2FwcC9jb21tb24vdG9wLW5hdi90b3AtbmF2Lmh0bWwnXHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdyb290JylcclxuICAgIC5jb21wb25lbnQoJ3RvcE5hdicsIHRvcE5hdik7XHJcbiIsInZhciBkYXNoYm9hcmQgPSB7XHJcbiAgICB0ZW1wbGF0ZVVybDogJy4vYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkL2Rhc2hib2FyZC5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6IERhc2hib2FyZENvbnRyb2xsZXIsXHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIHN0YXRzOiAnPCdcclxuICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXHJcbiAgICAuY29tcG9uZW50KCdkYXNoYm9hcmQnLCBkYXNoYm9hcmQpOyIsImZ1bmN0aW9uIERhc2hib2FyZENvbnRyb2xsZXIoKSB7XHJcbiAgICB2YXIgY3RybCA9IHRoaXM7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdyb290JylcclxuICAgIC5jb250cm9sbGVyKCdEYXNoYm9hcmRDb250cm9sbGVyJywgRGFzaGJvYXJkQ29udHJvbGxlcik7IiwidmFyIGNwdVVzYWdlID0ge1xyXG4gICAgdGVtcGxhdGVVcmw6ICdhcHAvY29tcG9uZW50cy9kYXNoYm9hcmQvY3B1LXdpZGdldC9jcHUtd2lkZ2V0Lmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogQ3B1V2lkZ2V0Q29udHJvbGxlcixcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgdXNhZ2U6ICc8J1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXHJcbiAgICAuY29tcG9uZW50KCdjcHVVc2FnZScsIGNwdVVzYWdlKTsiLCJmdW5jdGlvbiBDcHVXaWRnZXRDb250cm9sbGVyKCkge1xyXG4gICAgdmFyIGN0cmwgPSB0aGlzO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXHJcbiAgICAuY29udHJvbGxlcignQ3B1V2lkZ2V0Q29udHJvbGxlcicsIENwdVdpZGdldENvbnRyb2xsZXIpOyIsInZhciBkaXNrVXNhZ2UgPSB7XHJcbiAgICB0ZW1wbGF0ZVVybDogJ2FwcC9jb21wb25lbnRzL2Rhc2hib2FyZC9kaXNrLXdpZGdldC9kaXNrLXdpZGdldC5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6IERpc2tXaWRnZXRDb250cm9sbGVyLFxyXG4gICAgYmluZGluZ3MgOiB7XHJcbiAgICAgICAgdXNhZ2UgOiAnPCdcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxyXG4gICAgLmNvbXBvbmVudCgnZGlza1VzYWdlJywgZGlza1VzYWdlKTsiLCJmdW5jdGlvbiBEaXNrV2lkZ2V0Q29udHJvbGxlcigpIHtcclxuICAgIHZhciBjdHJsID0gdGhpcztcclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0Rpc2tXaWRnZXRDb250cm9sbGVyJywgRGlza1dpZGdldENvbnRyb2xsZXIpO1xyXG4gICAgIiwidmFyIG1lbVVzYWdlID0ge1xyXG4gICAgdGVtcGxhdGVVcmw6ICdhcHAvY29tcG9uZW50cy9kYXNoYm9hcmQvbWVtLXdpZGdldC9tZW0td2lkZ2V0Lmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogTWVtV2lkZ2V0Q29udHJvbGxlcixcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgdXNhZ2U6ICc8J1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXHJcbiAgICAuY29tcG9uZW50KCdtZW1Vc2FnZScsIG1lbVVzYWdlKTtcclxuIiwiZnVuY3Rpb24gTWVtV2lkZ2V0Q29udHJvbGxlcigpIHtcclxuICAgIHZhciBjdHJsID0gdGhpcztcclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ01lbVdpZGdldENvbnRyb2xsZXInLCBNZW1XaWRnZXRDb250cm9sbGVyKTtcclxuICAgICIsInZhciBuZXR3b3JrVXNhZ2UgPSB7XHJcbiAgICB0ZW1wbGF0ZVVybDogJ2FwcC9jb21wb25lbnRzL2Rhc2hib2FyZC9uZXR3b3JrLXVzYWdlL25ldHdvcmstdXNhZ2UuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiBOZXR3b3JrVXNhZ2VDb250cm9sbGVyLFxyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICB1c2FnZTogJzwnXHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdyb290JylcclxuICAgIC5jb21wb25lbnQoJ25ldHdvcmtVc2FnZScsIG5ldHdvcmtVc2FnZSk7XHJcbiAgICAiLCJmdW5jdGlvbiBOZXR3b3JrVXNhZ2VDb250cm9sbGVyKCkge1xyXG4gICAgdmFyIGN0cmwgPSB0aGlzO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXHJcbiAgICAuY29udHJvbGxlcignTmV0d29ya1VzYWdlQ29udHJvbGxlcicsIE5ldHdvcmtVc2FnZUNvbnRyb2xsZXIpO1xyXG4iXX0=
