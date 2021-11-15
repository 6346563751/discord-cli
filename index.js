import blessed from 'blessed'
import fetch from 'node-fetch';
import './env.js'
import ws from './gateaway.js'

const utils = {}

const destinataire = '' // id of the user to talk

async function getUsername() {
  const response = await fetch(
    "https://discord.com/api/v9/users/@me",
    {
      headers: {
        authorization:
          process.env.TOKEN, 
      },
      method: "GET",
      mode: "cors",
    }
  )

  const data = (await response.json()).username
  return data
}

async function fetchMessages(DISCORD_ID) {
  const response = await fetch(
    "https://discord.com/api/v9/channels/"+destinataire+"/messages?limit=20",
    {
      headers: {
        authorization:
          process.env.TOKEN, 
      },
      method: "GET",
      mode: "cors",
    }
  )
  const data = (await response.json()).map(message => message.author.username + ' : ' + message.content)
  return data 
}

async function getChannel(DISCORD_ID) {
  const response = await fetch("https://discord.com/api/v9/users/@me/channels", {
  "headers": {
    "authorization": process.env.TOKEN, 
    "content-type": "application/json",
  },
  "body": "{\"recipients\":[\""+ DISCORD_ID +"\"]}",
  "method": "POST",
  "mode": "cors"
  })

  const data = await response.json()
  return data.id
}

async function sendDeepMessage(CHANNEL_ID, content) {
  const response = await fetch("https://discord.com/api/v9/channels/"+ CHANNEL_ID +"/messages", {
    "headers": {
      "authorization": process.env.TOKEN,
      "content-type": "application/json",
    },
    "body": "{\"content\":\"" +content +"\",\"tts\":false}",
    "method": "POST",
    "mode": "cors"
  })
  
  const data = await response.json()
  return
}

async function init() {
  const messages = await fetchMessages()
  list.setItems(messages.reverse())
  list.focus()
  input.focus()
  utils.username = await getUsername()
}

const screen = blessed.screen({
  smartCSR: true,
})

screen.title = "Discord CLI";

screen.key(["escape", "q", "C-c"], function (ch, key) {
  return process.exit(0);
})

const list = blessed.list({
  parent: screen,
  label: " {bold}{cyan-fg}Messages List{/cyan-fg}{/bold} ",
  tags: true,
  draggable: false,
  top: 0,
  right: 0,
  width: "100%",
  height: "99%",
  keys: true,
  vi: true,
  interactive: false,
  mouse: true,
  border: "line",
  scrollbar: {
    ch: " ",
    track: {
      bg: "cyan",
    },
    style: {
      inverse: true,
    },
  },
  style: {
    item: {
      hover: {
        bg: "blue",
      },
    },
    selected: {
      bg: "blue",
      bold: true,
    },
  },
});

const form = blessed.form({
  parent: screen,
  name: "form",
  left: 0,
  bottom: 0,
  width: "100%",
  height: 1,
})

const input = blessed.textbox({
  parent: form,
  name: "input",
  input: true,
  vi: true,
  keys: true,
  top: 0,
  left: 0,
  height: "100%",
  width: "100%",
  style: {
    fg: "white",
    bg: "black",
    focus: {
      bg: "red",
      fg: "white",
    }
  }
})

input.focus()

input.on("submit", async function (v) {
  const channel = await getChannel(destinataire)
  utils.actual_channel = channel
  sendDeepMessage(destinataire, v)
  input.clearValue()
  screen.render()
  return
})

init()

input.focus()
screen.render()

ws.on('message', function message(data) {
  const parsed = JSON.parse(data)
  const {t, event, op, d} = parsed
  switch (t) {
    case 'MESSAGE_CREATE': {
      if(d.channel_id == destinataire) {
        list.pushItem(d.author.username + ' : ' + d.content)
        list.focus()
        input.focus()
      }
      break;
    }
  }
})
