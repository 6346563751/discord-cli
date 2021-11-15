import WebSocket from 'ws'
import './env.js'
const ws = new WebSocket('wss://gateway.discord.gg/?v=9&encoding=json')
const token = process.env.TOKEN 

const Hello = {
  "op": 10,
  "d": {
      "heartbeat_interval": 45000
  }
}

const Heartbeat = {
	    "op": 1,
	    "d": null 
}

const IDENTIFY = {
  "op": 2,
  "d": {
    "token": token, 
    "intents": 4096,
    "properties": {
      "$os": "linux",
      "$browser": "disco",
      "$device": "disco"
    }
  }
}

const RESUME = {
  "op": 6,
  "d": {
    "token": token, 
    "session_id": "session_id_i_stored",
    "seq": 1337
  }
}

function loopHeartbeat (interval) {
  for (let i = 0; i < 10; i++) {
    setTimeout(function timer() {
      ws.send(JSON.stringify(Heartbeat)) 
    }, i * interval + Math.random() * interval)
  }
}


ws.on('open', function open() {
	ws.send(JSON.stringify(IDENTIFY))
});

ws.on('close', function close() {
	console.log('disconnected')
})

ws.on('message', function message(data) { 
    const parsed = JSON.parse(data) 
    const {t, event, op, d} = parsed 
    if(parsed.op === 10) loopHeartbeat(parsed.d.heartbeat_interval)
    Heartbeat.d = parsed.s
}) 

export default ws
