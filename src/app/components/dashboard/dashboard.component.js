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
