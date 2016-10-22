var memUsage = {
    templateUrl: 'app/components/dashboard/mem-widget/mem-widget.html',
    controller: MemWidgetController,
    bindings: {
        chartConfig: '<'
    }
}

angular.module('root')
    .component('memUsage', memUsage);
