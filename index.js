'use strict';

const request = require('request');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const
	express = require('express'),
	bodyParser = require('body-parser'),
	app = express().use(bodyParser.json()),
	convert = require('./converters.js');

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
			
			if (webhook_event.message) {
				
				convert(webhook_event.message.text).then((url) => {
					response = {
						"attachment": {
							"type": "template",
							"payload": {
								"template_type": "generic",
								"elements": [{
									"image_url": url,									
								}]
							}
						}
					}
					
					callSendAPI(sender_psid, response);
				});
				
				callSendAPI(sender_psid, {"text": `original input: "${webhook_event.message.text}"`});
			}
		});
		
		res.status(200).send('EVENT_RECEIVED');
		
	} else {
		res.sendStatus(404);
	}

});

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