function DashboardController() {
    var ctrl = this;

    ctrl.$onInit = function() {
        ctrl.memAlert = false;
    }

}

angular.module('root')
    .controller('DashboardController', DashboardController);
