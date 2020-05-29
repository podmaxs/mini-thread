var worker = require('./worker');

var  miniProcess;
var name;
process.on('message', (payload) => {
    if(payload.type === 'init') {
        miniProcess = new worker(payload.method, payload.name, payload.script);
        name = payload.name;
        miniProcess.on('message', (subPayload) => {
            process.send({
                type: 'success',
                payload: subPayload
            });
            process.exit();
        });
        miniProcess.on('error', (error) => {
            process.send({
                type: 'error',
                error: error
            });
            process.exit();
        });
    }
    if(payload.type === 'start' && miniProcess !== undefined) {
        miniProcess.start(payload.args, payload.script);
    }
});