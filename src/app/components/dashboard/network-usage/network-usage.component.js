var networkUsage = {
    templateUrl: 'app/components/dashboard/network-usage/network-usage.html',
    controller: NetworkUsageController,
    bindings: {
        chartConfig: '<'
    }
}

angular.module('root')
    .component('networkUsage', networkUsage);
    