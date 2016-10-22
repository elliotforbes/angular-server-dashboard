var cpuUsage = {
    templateUrl: 'app/components/dashboard/cpu-widget/cpu-widget.html',
    controller: CpuWidgetController,
    bindings: {
        chartConfig: '<'
    }
}

angular.module('root')
    .component('cpuUsage', cpuUsage);