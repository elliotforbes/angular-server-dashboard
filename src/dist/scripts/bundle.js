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

    var messageQueue = [];

    ws.onopen = function(){  
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
        usage: '<',
        series: '<',
        labels: '<',
        data: '<',
        options: '<'
    }
}

angular.module('root')
    .component('cpuUsage', cpuUsage);
function CpuWidgetController() {
    var ctrl = this;

    ctrl.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
    ctrl.series = ['Visitors', 'Page Views'];

    ctrl.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
    ];

    ctrl.options = {
        scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
    };
}

angular.module('root')
    .controller('CpuWidgetController', CpuWidgetController);
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

function MemWidgetController() {
    var ctrl = this;

    ctrl.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
    ctrl.series = ['Visitors', 'Page Views'];

    ctrl.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
    ];

    ctrl.options = {
        scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
    };
}

angular.module('root')
    .controller('MemWidgetController', MemWidgetController);
    
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
function DiskWidgetController() {
    var ctrl = this;

    ctrl.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
    ctrl.series = ['Visitors', 'Page Views'];

    ctrl.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
    ];

    ctrl.options = {
        scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
    };
}

angular.module('root')
    .controller('DiskWidgetController', DiskWidgetController);
    
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
    
function NetworkUsageController() {
    var ctrl = this;

    ctrl.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
    ctrl.series = ['Visitors', 'Page Views'];

    ctrl.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
    ];

    ctrl.options = {
        scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
    };
}

angular.module('root')
    .controller('NetworkUsageController', NetworkUsageController);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJvb3QubW9kdWxlLmpzIiwicm9vdC5yb3V0ZXMuanMiLCJzdGF0cy5zZXJ2aWNlLmpzIiwiY29tbW9uL3RvcC1uYXYvdG9wLW5hdi5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9kYXNoYm9hcmQuY29tcG9uZW50LmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvZGFzaGJvYXJkLmNvbnRyb2xsZXIuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9jcHUtd2lkZ2V0L2NwdS13aWRnZXQuY29tcG9uZW50LmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvY3B1LXdpZGdldC9jcHUtd2lkZ2V0LmNvbnRyb2xsZXIuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9tZW0td2lkZ2V0L21lbS13aWRnZXQuY29tcG9uZW50LmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvbWVtLXdpZGdldC9tZW0td2lkZ2V0LmNvbnRyb2xsZXIuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9kaXNrLXdpZGdldC9kaXNrLXdpZGdldC5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2Rhc2hib2FyZC9kaXNrLXdpZGdldC9kaXNrLXdpZGdldC5jb250cm9sbGVyLmpzIiwiY29tcG9uZW50cy9kYXNoYm9hcmQvbmV0d29yay11c2FnZS9uZXR3b3JrLXVzYWdlLmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvZGFzaGJvYXJkL25ldHdvcmstdXNhZ2UvbmV0d29yay11c2FnZS5jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgncm9vdCcsIFtcclxuICAgICAgICAnbmdSb3V0ZScsXHJcbiAgICAgICAgJ2NoYXJ0LmpzJ1xyXG4gICAgXSk7XHJcbiIsImZ1bmN0aW9uIHJvdXRlUHJvdmlkZXIoJHJvdXRlUHJvdmlkZXIpe1xyXG4gICAgJHJvdXRlUHJvdmlkZXJcclxuICAgICAgLndoZW4oJy8nLCB7XHJcbiAgICAgICAgICB0ZW1wbGF0ZTogJzxkYXNoYm9hcmQ+PC9kYXNoYm9hcmQ+J1xyXG4gICAgICB9KTtcclxufVxyXG5yb3V0ZVByb3ZpZGVyLiRpbmplY3QgPSBbJyRyb3V0ZVByb3ZpZGVyJ107XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXHJcbiAgLmNvbmZpZyhyb3V0ZVByb3ZpZGVyKTtcclxuIiwiZnVuY3Rpb24gU3RhdHNTZXJ2aWNlKCkge1xyXG4gICAgdmFyIHNlcnZpY2UgPSB7fTtcclxuXHJcbiAgICB2YXIgY29ubmVjdGlvbiA9IG5ldyBXZWJTb2NrZXQoJ2h0dHA6Ly9sb2NhbGhvc3Q6OTAwMC9zdGF0cycpO1xyXG5cclxuICAgIHZhciBtZXNzYWdlUXVldWUgPSBbXTtcclxuXHJcbiAgICB3cy5vbm9wZW4gPSBmdW5jdGlvbigpeyAgXHJcbiAgICAgICAgY29uc29sZS5sb2coXCJTb2NrZXQgaGFzIGJlZW4gb3BlbmVkIVwiKTsgIFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25uZWN0aW9uLm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJTZXJ2ZXI6IFwiICsgZSk7XHJcbiAgICAgICAgdGhpcy5tZXNzYWdlUXVldWUucHVzaChlKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHNlcnZpY2U7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdyb290JylcclxuICAgIC5mYWN0b3J5KCdTdGF0c1NlcnZpY2UnLCBTdGF0c1NlcnZpY2UpOyIsInZhciB0b3BOYXYgPSB7XHJcbiAgICB0ZW1wbGF0ZVVybDogJy4vYXBwL2NvbW1vbi90b3AtbmF2L3RvcC1uYXYuaHRtbCdcclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxyXG4gICAgLmNvbXBvbmVudCgndG9wTmF2JywgdG9wTmF2KTtcclxuIiwidmFyIGRhc2hib2FyZCA9IHtcclxuICAgIHRlbXBsYXRlVXJsOiAnLi9hcHAvY29tcG9uZW50cy9kYXNoYm9hcmQvZGFzaGJvYXJkLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogRGFzaGJvYXJkQ29udHJvbGxlcixcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgc3RhdHM6ICc8J1xyXG4gICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdyb290JylcclxuICAgIC5jb21wb25lbnQoJ2Rhc2hib2FyZCcsIGRhc2hib2FyZCk7IiwiZnVuY3Rpb24gRGFzaGJvYXJkQ29udHJvbGxlcigpIHtcclxuICAgIHZhciBjdHJsID0gdGhpcztcclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0Rhc2hib2FyZENvbnRyb2xsZXInLCBEYXNoYm9hcmRDb250cm9sbGVyKTsiLCJ2YXIgY3B1VXNhZ2UgPSB7XHJcbiAgICB0ZW1wbGF0ZVVybDogJ2FwcC9jb21wb25lbnRzL2Rhc2hib2FyZC9jcHUtd2lkZ2V0L2NwdS13aWRnZXQuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiBDcHVXaWRnZXRDb250cm9sbGVyLFxyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICB1c2FnZTogJzwnLFxyXG4gICAgICAgIHNlcmllczogJzwnLFxyXG4gICAgICAgIGxhYmVsczogJzwnLFxyXG4gICAgICAgIGRhdGE6ICc8JyxcclxuICAgICAgICBvcHRpb25zOiAnPCdcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxyXG4gICAgLmNvbXBvbmVudCgnY3B1VXNhZ2UnLCBjcHVVc2FnZSk7IiwiZnVuY3Rpb24gQ3B1V2lkZ2V0Q29udHJvbGxlcigpIHtcclxuICAgIHZhciBjdHJsID0gdGhpcztcclxuXHJcbiAgICBjdHJsLmxhYmVscyA9IFsnMjAwNicsICcyMDA3JywgJzIwMDgnLCAnMjAwOScsICcyMDEwJywgJzIwMTEnLCAnMjAxMiddO1xyXG4gICAgY3RybC5zZXJpZXMgPSBbJ1Zpc2l0b3JzJywgJ1BhZ2UgVmlld3MnXTtcclxuXHJcbiAgICBjdHJsLmRhdGEgPSBbXHJcbiAgICAgICAgWzY1LCA1OSwgODAsIDgxLCA1NiwgNTUsIDQwXSxcclxuICAgICAgICBbMjgsIDQ4LCA0MCwgMTksIDg2LCAyNywgOTBdXHJcbiAgICBdO1xyXG5cclxuICAgIGN0cmwub3B0aW9ucyA9IHtcclxuICAgICAgICBzY2FsZXM6IHtcclxuICAgICAgICAgICAgICAgIHlBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgIHRpY2tzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZ2luQXRaZXJvOnRydWVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXHJcbiAgICAuY29udHJvbGxlcignQ3B1V2lkZ2V0Q29udHJvbGxlcicsIENwdVdpZGdldENvbnRyb2xsZXIpOyIsInZhciBtZW1Vc2FnZSA9IHtcclxuICAgIHRlbXBsYXRlVXJsOiAnYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkL21lbS13aWRnZXQvbWVtLXdpZGdldC5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6IE1lbVdpZGdldENvbnRyb2xsZXIsXHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIHVzYWdlOiAnPCcsXHJcbiAgICAgICAgc2VyaWVzOiAnPCcsXHJcbiAgICAgICAgbGFiZWxzOiAnPCcsXHJcbiAgICAgICAgZGF0YTogJzwnLFxyXG4gICAgICAgIG9wdGlvbnM6ICc8J1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXHJcbiAgICAuY29tcG9uZW50KCdtZW1Vc2FnZScsIG1lbVVzYWdlKTtcclxuIiwiZnVuY3Rpb24gTWVtV2lkZ2V0Q29udHJvbGxlcigpIHtcclxuICAgIHZhciBjdHJsID0gdGhpcztcclxuXHJcbiAgICBjdHJsLmxhYmVscyA9IFsnMjAwNicsICcyMDA3JywgJzIwMDgnLCAnMjAwOScsICcyMDEwJywgJzIwMTEnLCAnMjAxMiddO1xyXG4gICAgY3RybC5zZXJpZXMgPSBbJ1Zpc2l0b3JzJywgJ1BhZ2UgVmlld3MnXTtcclxuXHJcbiAgICBjdHJsLmRhdGEgPSBbXHJcbiAgICAgICAgWzY1LCA1OSwgODAsIDgxLCA1NiwgNTUsIDQwXSxcclxuICAgICAgICBbMjgsIDQ4LCA0MCwgMTksIDg2LCAyNywgOTBdXHJcbiAgICBdO1xyXG5cclxuICAgIGN0cmwub3B0aW9ucyA9IHtcclxuICAgICAgICBzY2FsZXM6IHtcclxuICAgICAgICAgICAgICAgIHlBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgIHRpY2tzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZ2luQXRaZXJvOnRydWVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXHJcbiAgICAuY29udHJvbGxlcignTWVtV2lkZ2V0Q29udHJvbGxlcicsIE1lbVdpZGdldENvbnRyb2xsZXIpO1xyXG4gICAgIiwidmFyIGRpc2tVc2FnZSA9IHtcclxuICAgIHRlbXBsYXRlVXJsOiAnYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkL2Rpc2std2lkZ2V0L2Rpc2std2lkZ2V0Lmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogRGlza1dpZGdldENvbnRyb2xsZXIsXHJcbiAgICBiaW5kaW5ncyA6IHtcclxuICAgICAgICB1c2FnZSA6ICc8JyxcclxuICAgICAgICBzZXJpZXM6ICc8JyxcclxuICAgICAgICBsYWJlbHM6ICc8JyxcclxuICAgICAgICBkYXRhOiAnPCcsXHJcbiAgICAgICAgb3B0aW9uczogJzwnXHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdyb290JylcclxuICAgIC5jb21wb25lbnQoJ2Rpc2tVc2FnZScsIGRpc2tVc2FnZSk7IiwiZnVuY3Rpb24gRGlza1dpZGdldENvbnRyb2xsZXIoKSB7XHJcbiAgICB2YXIgY3RybCA9IHRoaXM7XHJcblxyXG4gICAgY3RybC5sYWJlbHMgPSBbJzIwMDYnLCAnMjAwNycsICcyMDA4JywgJzIwMDknLCAnMjAxMCcsICcyMDExJywgJzIwMTInXTtcclxuICAgIGN0cmwuc2VyaWVzID0gWydWaXNpdG9ycycsICdQYWdlIFZpZXdzJ107XHJcblxyXG4gICAgY3RybC5kYXRhID0gW1xyXG4gICAgICAgIFs2NSwgNTksIDgwLCA4MSwgNTYsIDU1LCA0MF0sXHJcbiAgICAgICAgWzI4LCA0OCwgNDAsIDE5LCA4NiwgMjcsIDkwXVxyXG4gICAgXTtcclxuXHJcbiAgICBjdHJsLm9wdGlvbnMgPSB7XHJcbiAgICAgICAgc2NhbGVzOiB7XHJcbiAgICAgICAgICAgICAgICB5QXhlczogW3tcclxuICAgICAgICAgICAgICAgICAgICB0aWNrczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiZWdpbkF0WmVybzp0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3Jvb3QnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0Rpc2tXaWRnZXRDb250cm9sbGVyJywgRGlza1dpZGdldENvbnRyb2xsZXIpO1xyXG4gICAgIiwidmFyIG5ldHdvcmtVc2FnZSA9IHtcclxuICAgIHRlbXBsYXRlVXJsOiAnYXBwL2NvbXBvbmVudHMvZGFzaGJvYXJkL25ldHdvcmstdXNhZ2UvbmV0d29yay11c2FnZS5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6IE5ldHdvcmtVc2FnZUNvbnRyb2xsZXIsXHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIHVzYWdlOiAnPCcsXHJcbiAgICAgICAgc2VyaWVzOiAnPCcsXHJcbiAgICAgICAgbGFiZWxzOiAnPCcsXHJcbiAgICAgICAgZGF0YTogJzwnLFxyXG4gICAgICAgIG9wdGlvbnM6ICc8J1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXHJcbiAgICAuY29tcG9uZW50KCduZXR3b3JrVXNhZ2UnLCBuZXR3b3JrVXNhZ2UpO1xyXG4gICAgIiwiZnVuY3Rpb24gTmV0d29ya1VzYWdlQ29udHJvbGxlcigpIHtcclxuICAgIHZhciBjdHJsID0gdGhpcztcclxuXHJcbiAgICBjdHJsLmxhYmVscyA9IFsnMjAwNicsICcyMDA3JywgJzIwMDgnLCAnMjAwOScsICcyMDEwJywgJzIwMTEnLCAnMjAxMiddO1xyXG4gICAgY3RybC5zZXJpZXMgPSBbJ1Zpc2l0b3JzJywgJ1BhZ2UgVmlld3MnXTtcclxuXHJcbiAgICBjdHJsLmRhdGEgPSBbXHJcbiAgICAgICAgWzY1LCA1OSwgODAsIDgxLCA1NiwgNTUsIDQwXSxcclxuICAgICAgICBbMjgsIDQ4LCA0MCwgMTksIDg2LCAyNywgOTBdXHJcbiAgICBdO1xyXG5cclxuICAgIGN0cmwub3B0aW9ucyA9IHtcclxuICAgICAgICBzY2FsZXM6IHtcclxuICAgICAgICAgICAgICAgIHlBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgIHRpY2tzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZ2luQXRaZXJvOnRydWVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncm9vdCcpXHJcbiAgICAuY29udHJvbGxlcignTmV0d29ya1VzYWdlQ29udHJvbGxlcicsIE5ldHdvcmtVc2FnZUNvbnRyb2xsZXIpO1xyXG4iXX0=
