var networkUsage = {
    templateUrl: 'app/components/dashboard/network-usage/network-usage.html',
    controller: NetworkUsageController,
    bindings: {
        usage: '<'
    }
}

angular.module('root')
    .component('networkUsage', networkUsage);
    