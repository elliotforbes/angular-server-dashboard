var memUsage = {
    templateUrl: 'app/components/dashboard/mem-widget/mem-widget.html',
    controller: MemWidgetController,
    bindings: {
        usage: '<'
    }
}

angular.module('root')
    .component('memUsage', memUsage);
