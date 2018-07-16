'use strict';

const request = require('request');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const
	express = require('express'),
	bodyParser = require('body-parser'),
	{ convert } = require('convert-svg-to-png'),
	converters = require('./converters.js'),
	app = express().use(bodyParser.json()); 

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));


app.get('/', function (req, res) {
	res.send("Hereee");
})


app.get('/webhook/', (req, res) => {

	let VERIFY_TOKEN = process.env.VERIFY_TOKEN;
    
	let mode = req.query['hub.mode'];
	let token = req.query['hub.verify_token'];
	let challenge = req.query['hub.challenge'];
    
	if (mode && token) {

		if (mode === 'subscribe' && token === VERIFY_TOKEN) {

			console.log('WEBHOOK_VERIFIED');
			res.status(200).send(challenge);
		
		} else {
			res.sendStatus(403);      
		}
	}
});


app.post('/webhook/', (req, res) => {  
 
	let body = req.body;

	if (body.object === 'page') {

		body.entry.forEach(function(entry) {

			let webhook_event = entry.messaging[0];
			console.log(webhook_event);

			let sender_psid = webhook_event.sender.id;
			console.log('Sender PSID: ' + sender_psid);
			
			if (webhook_event.message) {		// LOTS OF QUESTIONS
				
				// let pngBuffer = inputToPng(webhook_event.message);  
				let url = 'https://mobile-latex.herokuapp.com/' + sender_psid + '/';
				
				// res.set('Location', url);
				// res.set('Content-Type', 'image/png');
				// res.write(pngBuffer);
				// res.set('Content-Type', 'text/html');
				// res.write('sighhhh');
				
				res.location(url);
				res.set('Content-Type', 'text/html');
				res.write('sigh finally overrrr');
				
				callSendAPI(sender_psid, {"text": url});
				
				callSendAPI(sender_psid, {"text": `input: "${webhook_event.message.text}" - Good luck with the rest <3`});
			}
		});
		
		// res.set('Location', 'https://mobile-latex.herokuapp.com/webhook/');
		res.location('https://mobile-latex.herokuapp.com/webhook/');
		res.status(200).send('EVENT_RECEIVED');
		
	} else {
		res.sendStatus(404);
	}

});

function inputToPng(received_message) {
	if (received_message.text) {    
		let unformatted = received_message.text;
		let svg = converters(unformatted);
		let png = convert(svg);
		
		return png;
	}
}

function callSendAPI(sender_psid, response) {
	let request_body = {
		"recipient": {
		  "id": sender_psid
		},
		"message": response
	}
	
	request({
		"url": "https://graph.facebook.com/v2.6/me/messages",
		"qs": { "access_token": PAGE_ACCESS_TOKEN },
		"method": "POST",
		"json": request_body
	}, (err, res, body) => {
		if (!err) {
			console.log('message sent!')
		} else {
			console.error("Unable to send message:" + err);
		}
	}); 
}