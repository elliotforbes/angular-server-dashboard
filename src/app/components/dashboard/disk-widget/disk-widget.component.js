var diskUsage = {
    templateUrl: 'app/components/dashboard/disk-widget/disk-widget.html',
    controller: DiskWidgetController,
    bindings : {
        chartConfig : '<'
    }
}

angular.module('root')
    .component('diskUsage', diskUsage);