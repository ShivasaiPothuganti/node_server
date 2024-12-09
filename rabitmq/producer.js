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
        const message = 'Hello from the sender ';
        channel.assertQueue(queueName,{durable:false});
        channel.sendToQueue(queueName,Buffer.from(message));
        console.log(message,' sent..');
    })

});

export {amqp};