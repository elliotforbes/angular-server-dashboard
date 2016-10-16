function StatsService() {
    var service = {};

    var connection = new WebSocket('http://localhost:9000/stats');

    ws.onopen = function(){  
        console.log("Socket has been opened!");  
    };

    connection.onmessage = function (e) {
        console.log("Server: " + e);
    };

    return service;
}

angular.module('root')
    .factory('StatsService', StatsService);