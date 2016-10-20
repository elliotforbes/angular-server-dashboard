var cpuUsage = {
    templateUrl: 'app/components/dashboard/cpu-widget/cpu-widget.html',
    controller: CpuWidgetController,
    bindings: {
        usage: '<',
        series: '<',
        labels: '<',
        data: '<',
        options: '<'
    }
}

angular.module('root')
    .component('cpuUsage', cpuUsage);