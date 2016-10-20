function DiskWidgetController() {
    var ctrl = this;

    ctrl.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
    ctrl.series = ['Visitors', 'Page Views'];

    ctrl.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
    ];

    ctrl.options = {
        scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
    };
}

angular.module('root')
    .controller('DiskWidgetController', DiskWidgetController);
    