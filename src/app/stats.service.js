function StatsService() {
    var service = {};

    var connection = new WebSocket('ws://localhost:9000/stats');

    var messageQueue = [];

    connection.onopen = function(){  
        console.log("Socket has been opened!");  
    };

    connection.onmessage = function (e) {
        console.log("Server: " + e);
        this.messageQueue.push(e);
    };

    return service;
}

angular.module('root')
    .factory('StatsService', StatsService);