import blessed from 'blessed'
import fetch from 'node-fetch';
import './env.js'

const utils = {}

console.log(process.env.TOKEN)

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
    "https://discord.com/api/v9/channels/816343656323088452/messages?limit=10",
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

// Create a screen object.
var screen = blessed.screen({
  smartCSR: true,
});

screen.title = "Discord CLI";

screen.key(["escape", "q", "C-c"], function (ch, key) {
  return process.exit(0);
});

var list = blessed.list({
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

var form = blessed.form({
  parent: screen,
  name: "form",
  left: 0,
  bottom: 0,
  width: "100%",
  height: 1,
});

var input = blessed.textbox({
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
  const channel = await getChannel('600995678960877568')
  sendDeepMessage(channel, v)
  list.pushItem(utils.username + ' : ' + v)
  input.clearValue()
  screen.render()
  return
});

init()

input.focus()
screen.render()
