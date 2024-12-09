import amqp from 'amqplib/callback_api.js';
amqp.connect('amqp://localhost:5668', function(error, connection) {
    if(error){
        console.log("error connecting rabit mq server ",error);
        return;
    }

    connection.createChannel((err,channel)=>{
        if(err){
            console.log("error creating the channel");
            return;
        }
        const queueName = 'hello';
        channel.assertQueue(queueName,{durable:false});
        channel.consume(queueName,(message)=>{
            console.log(message.content.toString());
        },{
            noAck:true
        })
        
    })

});

export {amqp};