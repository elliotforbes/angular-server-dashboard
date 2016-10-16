var dashboard = {
    templateUrl: './app/components/dashboard/dashboard.html',
    controller: DashboardController,
    bindings: {
        stats: '<'
   }
}

angular.module('root')
    .component('dashboard', dashboard);