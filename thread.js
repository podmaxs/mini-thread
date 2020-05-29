const fork = require('child_process').fork;
const fs = require('fs');

module.exports = function(method, name){
    var self = this;
    this.pool = 0;
    this.EVENT_PROCESS = [];
   
    self.createFork = function(){
        self.prd = fork('./controller.js');
    
        self.prd.on('message', (eventData) => {
            if(eventData.type === 'success') {
                self.emit('message',eventData.payload);
            }
            if(eventData.type === 'error') {
                self.emit('error',eventData.error);
            }
        });
        
        self.prd.send({
            type: 'init',
            method: method,
            name: name
        });
    }

    self.subscription = function(event, handler) {
        self.EVENT_PROCESS.push({
            name: event,
            handler: handler
        });
    }

    self.emit = function(event, payload){
        self.EVENT_PROCESS.forEach(function(item) {
            if(item.name === event){
                if(item.handler !== undefined && item.handler instanceof Function) {
                    item.handler(payload);
                }
            }
        })
    }

    function run(arg){
        self.createFork();
        var script = `
        ${method.toString()}
            response = ${method.name}.apply('${method.name}_context', ${JSON.stringify(arg)});
        `;
        self.prd.send({
            type: 'start',
            args: arg,
            script: script
        });
    }

    return {
        start: run,
        on: self.subscription
    }
}