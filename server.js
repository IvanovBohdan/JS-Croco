const path = require('path');
const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');
const httpServer = new http.createServer();

httpServer.on('request', (req,res) => {
	let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
	fs.readFile(filePath, (err,data) => {
		if(err){
			res.writeHead(404);
		}else{
			contentType = req.url.split('.')[1];
			contentType = (contentType === undefined) ? 'html' : contentType;
			
			if (contentType === 'js'){
				contentType = 'javascript';
			}

			res.writeHead(200,{ ContentType: `text/${contentType}` });
			res.end(data);
		}
	});
});

httpServer.listen(8080,'192.168.1.5', () => {
	console.log('Server works...');
});

// web socket server 


const server = new WebSocket.Server({port: 5000 });

let users = [];
let online = [];

function indexBySocket(array,socket){
	return array.findIndex(user => {
		if(user.userSocket === socket)
			return true;

	});
}


function sendToAll(msg) {
	server.clients.forEach(client => {
        	if (client.readyState === WebSocket.OPEN) {
          		client.send(msg);
        	}
      	});
}

server.on("connection", (ws,req) => {
	ws.on("message", message => {
 		message = JSON.parse(message);
 		switch(message.type){
 			case 'name': 
 				users.push({
 					userName: message.userName,
 					userSocket: ws
 				}); 

 				sendToAll(JSON.stringify({
 					type: 'usersList',
 					usersOnline: users
 				}));
 				
 				break;
 			case 'chatMessage':
 				sendToAll(JSON.stringify({
 					type: 'chatMessage',
 					userName: users[indexBySocket(users,ws)].userName,
 					text: message.text
 				}));
 				break;
 			case 'draw':
 				for (let k of users){
 					if(k.userSocket != ws){
 						k.userSocket.send(JSON.stringify(message));
 					}
 				}
 				break;
 		}
	});

	ws.on('close', () => {
		users.splice(indexBySocket(users,ws), 1);
		sendToAll(JSON.stringify({
 			type: 'usersList',
 			usersOnline: users
 		}));
	})

});


