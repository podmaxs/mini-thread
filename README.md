# mini-thread

### Simple nodejs thread implementation
>##### Install
>``npm i mini-thread -S``

>#### Use
>```javascript
>const thread = require('mini-thread');
>let responses = [],
>    list = [];
>
>function test(name){
>    var hash = "";
>    while(hash.length !== 5){
>        var tm = new Date().getTime().toString().substr(-4),
>            cam = 0;
>        for(var i = 0; i<4; i++){
>            if(tm.charAt(i) !== "") {
>                cam = cam + parseInt(tm.charAt(i));
>            }
>        }
>        if((cam/4) > 4)
>            hash += (cam/4);
>    } 
>    return 'Hola ' + name + ' ' + hash;
>}
>
>
>for(var p = 0; p<100; p++){
>    var pro = new thread(test, 'thread_sample_name' + p);
>    
>    pro.on('message', (payload) => {
>        console.log('On message: ',payload, new Date().getTime());
>        responses.push(payload)
>    });
>    pro.on('error', (error) => {
>        console.log('error:', error);
>        responses.push(error);
>    });
>    pro.start(['Maximiliano '+p])
>}

