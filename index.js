		let ws = new WebSocket('ws://192.168.1.5:5000');
		let canvas = document.getElementById('canv');
		let block = document.getElementsByClassName('paint')[0];

		let ctx = canvas.getContext('2d');

		let color = document.getElementById('color').value;
		let brush_size = document.getElementById('size').value;
		let username = prompt(`What's your name?`);
		let ismousedown = false;
		let cords = [];

		ws.onopen = res => {
			console.log('Connected!');
			ws.send(JSON.stringify({
				type: 'name',
				userName: username
			}));
		}

		ws.onclose = res => {
			console.log('Disconnected!');
		}

		ws.onmessage = res => {
			message = JSON.parse(res.data);
			console.log(message);
			switch(message.type){
				case 'chatMessage':
					putMsg(message.userName,message.text);
					break;
				case 'usersList': 
					document.querySelector('.users-box').innerHTML = '';
					message.usersOnline.forEach( user => {
						putUser(user.userName);
					});
					break;
				case 'draw':
					if (true){
					if(message.break){
						ctx.beginPath();
					}
					draw(message.x,message.y,message.brushSize,message.brushColor);
					break;
					}
			}
			
		}

		ws.onerror = res => {
			console.log('Error!');
		}

		canvas.onmousedown = () => {
			ismousedown = true;
		}		

		canvas.onmouseup = () => {
			ismousedown = false;
			ws.send(JSON.stringify({
				type: 'draw',
				break: true
			}));
			ctx.beginPath();
		}

		function putMsg(name, message){
			if(name === username){
				name = `<span style="color:red;" >${name}</span>`;
			}
			let msg = document.createElement('div');
			msg.className = 'message';
			msg.innerHTML = `<div class="message__name">${name}:</div>
		    					<div class="message__text">${message}</div>`;
			document.getElementsByClassName('message-box')[0].appendChild(msg);
		}

		function putUser(user){
			let msg = document.createElement('div');
			msg.className = 'users__item';
			msg.innerHTML = user;
			document.getElementsByClassName('users-box')[0].appendChild(msg);
		}

		function draw(x,y,brushsize,color) {
				ctx.fillStyle = color;
				ctx.strokeStyle = color;
				ctx.lineWidth = brushsize*2;
				ctx.lineTo(x,y);
				ctx.stroke();

				ctx.beginPath();
				ctx.arc(x,y,brushsize,0,2*Math.PI);
				ctx.fill();

				ctx.beginPath();
				ctx.moveTo(x,y);

				cords.push([x,y,brushsize,color,ismousedown]);
		}

		function clear(){
			ctx.clearRect(0,0,canvas.width,canvas.height);
		}

		canvas.onmousemove = (e) => {
				let brushSize = document.getElementById('size').value;
				let brushColor = document.getElementById('color').value;
				let x = e.offsetX;
				let y = e.offsetY;
				if( ismousedown ){
					ws.send(JSON.stringify({
						type: 'draw',
						brushSize: brushSize,
						brushColor: brushColor,
						x: x,
						y: y,
						break: false
					}));
					draw(x,y,brushSize,brushColor);
				}

		}

		// chat 

		function sendChatMessage(){
			let msg = document.getElementById('chat-text');
			ws.send(JSON.stringify({
				type: 'chatMessage',
				text: msg.value
			}));
			msg.value = '';
			document.getElementsByClassName('message-box')[0].scrollTop += 10000;
			console.log(document.getElementsByClassName('message-box')[0].scrollTop);
		}

		document.getElementById('send').addEventListener('click', sendChatMessage);
		
		window.onkeydown = (e) => {
			console.log(e.keyCode)
			if (e.keyCode == 13){
				sendChatMessage();
			}
			if(e.keyCode == 67){
				clear();
			}
		}




