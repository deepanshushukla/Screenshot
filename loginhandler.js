const { ipcRenderer } = require('electron');
document.getElementById("btn-genesys-login").addEventListener("click", loginToGenesys,false);
let accessToken, userId, notificationChannel,webSocket;
function loginToGenesys (){
    ipcRenderer.send('genesys-oauth', 'getToken');
}
ipcRenderer.on('genesys-oauth-reply', (event, args) => {
    console.log(args)
    accessToken = args.access_token
    $.ajax({
        url: "https://api.mypurecloud.com/api/v2/users/me",
        type: "GET",
        beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'bearer ' + accessToken);},
        success: function(data) {
            console.log(data);
            userId= data.id;
            createNewChannel();
        }
    });
});

function createNewChannel (){
    $.ajax({
        url: "https://api.mypurecloud.com/api/v2/notifications/channels",
        type: "POST",
        beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'bearer ' + accessToken);},
        success: function(channel) {
            console.log('notification channel created', channel);
            notificationChannel = channel;

            // Set up web socket
            webSocket = new WebSocket(notificationChannel.connectUri);
            webSocket.onmessage = handleNotification;

            // Subscribe to authenticated user's presence
            userPresenceTopic = `v2.users.${userId}.presence`;
            const body = [ { id: userPresenceTopic } ];
            console.log(body)
            updateNotificationChannel(notificationChannel.id,body)

        }
    });
}
function updateNotificationChannel(channelId,body) {
    $.ajax({
        url: `https://api.mypurecloud.com/api/v2/notifications/channels/${channelId}/subscriptions`,
        type: "PUT",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(body),
        beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'bearer ' + accessToken);},
        success: function(data) {
            console.log(data);
        }
    });
}
function handleNotification(message){
    const notification = JSON.parse(message.data);
    console.log('message Received',notification)

    // Discard unwanted notifications
    if (notification.topicName.toLowerCase() === 'channel.metadata') {
        // Heartbeat
        console.info('Ignoring metadata: ', notification);
        return;
    } else if (notification.topicName.toLowerCase() !== userPresenceTopic.toLowerCase()) {
        // Unexpected topic
        console.warn('Unknown notification: ', notification);
        return;
    } else {
        console.debug('Presence notification: ', notification);
    }

    // Set current presence text in UI
    $('#currentPresence').text(notification.eventBody.presenceDefinition.systemPresence);

    // Log messages
    $('div#messages').append($('<pre>').text(`${new Date().toLocaleTimeString()} - ${JSON.stringify(notification,null,2)}`));
}