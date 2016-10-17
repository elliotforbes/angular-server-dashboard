var diskUsage = {
    templateUrl: 'app/components/dashboard/disk-widget/disk-widget.html',
    controller: DiskWidgetController,
    bindings : {
        usage : '<'
    }
}

angular.module('root')
    .component('diskUsage', diskUsage);