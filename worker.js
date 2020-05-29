const fork = require('child_process').fork;
const fs = require('fs');

module.exports = function(method, name){
    var self = this;
    this.pool = 0;
    this.EVENT_PROCESS = [];
    this.poolProcess = [];

    process.on('exit', () => {
        self.poolProcess.forEach( prd => {
            try{
                prd.exit();
            } catch(e){}
        })
    });

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

    function run(arg, scriptSrc){
        self.pool = self.pool + 1;
        var file = `.Thread_${self.pool}${new Date().getTime()}.js`;
        if(name !== undefined)
            file = `.Thread_${self.pool}${name}.js`;
        if(arg === undefined)
            arg = [];
        if(method instanceof Function){
            var script = `
            ${method.toString()}
                var response;
                try{
                    response = ${method.name}.apply('${method.name}_context', ${JSON.stringify(arg)});
                } catch(e){
                    console.log(e);
                }
                process.send(response);
                setTimeout(function(){
                    process.exit();
                }, 100);
            `;
            fs.writeFile(`./${file}`, script, function(err){
                if(!err) {
                    var new_process = fork(`./${file}`);
                    new_process.on('message', (payload) => {
                        // end
                        self.emit('message', payload);
                        removeTempScript(file)
                    });
                    new_process.on('exit', ()=> {
                        removeTempScript(file)
                    });
                    new_process.on('error', (error) => {
                        // error
                        removeTempScript(file);
                        self.emit('error', payload);
                    });
                } else {
                    console.log(err);
                }
            });
        } else {
           if(scriptSrc !== undefined) {
                try {
                    var response;
                    eval(scriptSrc);
                    self.emit('message', response);
                } catch (e) {
                    self.emit('error', e);
                }
           }
        }
    }

    function removeTempScript(file){
        try{
            fs.unlinkSync(`./${file}`);
        }catch(e){
            console.log(file, e);
        }
    }

    return {
        start: run,
        on: self.subscription,
    }
}