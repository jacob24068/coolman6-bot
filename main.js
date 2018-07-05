let streaming = {}
const twitchid = process.env.clientID

const request = require('request')
const Discord = require("discord.js")
const { Client } = require('pg');
const client = new Discord.Client()
const prefix = "!"

const pgClient = new Client({connectionString: process.env.DATABASE_URL, ssl: true});

pgClient.connect();

pgClient.query(`SELECT * FROM userdata`, null, (err, res) => {
    if (!err) {
        saveData = JSON.parse(res.rows[0].info)
    }
  })

let saveData = {}

const save = function() {
  pgClient.query(`DELETE FROM userdata`, null, (err, res) => {
    if (err) {console.log(err.stack)}
  })
  pgClient.query(`INSERT INTO userdata(info) VALUES($1)`, [JSON.stringify(saveData)], (err, res) => {
    if (err) {console.log(err.stack)}
  })
}

let progress = 0
let log
let welcome
let notifications
let role
let guild

client.on("ready", () => {
    client.user.setPresence({ game: { name: `over Brice's server`, type: 3 } });
    guild = client.guilds.get(`459074666137649162`)
    notifications = client.channels.get(`459078238283497472`)
    log = client.channels.get(`459077897525788692`)
    welcome = client.channels.get(`459076914691309609`)
    role = guild.roles.get(`460105041563615234`)
  });

function sortByKey(jsObj){
  	var sortedArray = [];
  	for(var i in jsObj)
  	{
		sortedArray.push([i, jsObj[i]]);
	}
	return sortedArray.sort(function(a,b) {return Number(a)>Number(b)});
}

function ordinal_suffix_of(i) {
  var j = i % 10,
      k = i % 100;
  if (j == 1 && k != 11) {
      return i + "st";
  }
  if (j == 2 && k != 12) {
      return i + "nd";
  }
  if (j == 3 && k != 13) {
      return i + "rd";
  }
  return i + "th";
}

const alphabet = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯", "🇰", "🇱", "🇲", "🇳", "🇴", "🇵", "🇶", "🇷", "🇸", "🇹", "🇺", "🇻", "🇼", "🇽", "🇾", "🇿"]

client.on("message", async message => {
    if (!message.guild) return
    if(message.author.bot) return

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();


    if (!saveData[message.author.id]) {
      saveData[message.author.id] = 0
    }

    let userData = saveData[message.author.id];
    saveData[message.author.id] = userData + 1

    if (userData > 2000 && !message.member.roles.some(r=>["Regular"].includes(r.name))){
      message.member.addRole(message.guild.roles.find('name', 'Regular'))
    }

    progress++

    if (progress == 100) {
      save()
      progress = 1
    }

    if (command === "verify" && message.channel.id == `459081091240689670`) {
      log.send(`${message.author} has verified at ${Date()}`)
      message.delete()
      welcome.send({
        "embed": {
          "title": `${message.member.displayName} joined.`,
          "color": 1542474,
          "timestamp": new Date(),
          "thumbnail": {
            "url": message.author.displayAvatarURL
          }
        }
      })
      message.member.addRole(message.guild.roles.find("name", "Fan")).catch(console.error);
  }else if (message.channel.id == `459081091240689670`) return message.delete()

    if(message.content.indexOf(prefix) !== 0) return;
    if (command === "points") {
        let member = message.mentions.members.first()
        if (member) { message.channel.send(`${member.displayName} has ${saveData[member.id]} point${saveData[member.id] == 1 && "" || "s"}.`);
        }else{message.channel.send(`${message.member.displayName}, you have ${saveData[message.author.id]} point${saveData[message.author.id] == 1 && "" || "s"}.`);}

    }else if(command === "forcesave") {
      if (!message.author.id == `188386891182112769`) return;
      save()
      message.channel.send(`All data successfully saved`)
    }else if (command === "leaderboard") {
        //i should rewrite this but oh well
      const keys = Object.keys(saveData);
      let newT = {}
      for(let i=0;i<keys.length;i++){
        let key = keys[i];
        newT[saveData[key]] = key
      }
      const sorted = sortByKey(newT)
      var arr = [];
      for (var prop in newT) {
          arr.push(newT[prop]);
      }
      const a = arr.length - 1
      for(var i = 0; i <= 9; i++) {
      if (!message.guild.members.get(arr[a-i])) {
       delete saveData[arr[a-i]]
        }
      }
      const member = message.mentions.members.first()
      let number = args.slice(0).join(' ');
      if (member) {
        for (var i = 0, row; row = arr[i]; i++) {
          if (row == member.id) {
            message.channel.send(`${member.displayName} is in ${ordinal_suffix_of(arr.length-i)} place, with ${saveData[member.id].toLocaleString()} points.`)
            break
          }
        }
      }else if (number) {
        let b = arr.length
        if (arr[b - number]) {
          let mem = message.guild.members.get(arr[b-number])
          message.channel.send(` ${mem.displayName} is in ${ordinal_suffix_of(number)} place is, with ${saveData[mem.id].toLocaleString()} points.`)
        }else return message.channel.send(`There is no person in ${ordinal_suffix_of(number)} place.`)
      }else{
      message.channel.send({
        "embed": {
          "title": "BBG Leaderboard",
          "color": Number("0x"+Math.floor(Math.random()*16777215).toString(16)),
          "fields": [
            {
              "name": "1 - " + String(message.guild.members.get(arr[a]).displayName),
              "value": saveData[arr[a]].toLocaleString() + " points (Ahead "+(saveData[arr[a]] - saveData[arr[a-1]]).toLocaleString()+" points)"
            },
            {
              "name": "2 - " + String(message.guild.members.get(arr[a-1]).displayName),
              "value": saveData[arr[a - 1]].toLocaleString() + " points (Ahead "+(saveData[arr[a - 1]] - saveData[arr[a - 2]]).toLocaleString()+" points)"
            },
            {
              "name": "3 - " + String(message.guild.members.get(arr[a-2]).displayName),
              "value": saveData[arr[a - 2]].toLocaleString() + " points (Ahead "+(saveData[arr[a - 2]] - saveData[arr[a - 3]]).toLocaleString()+" points)"
            },
            {
              "name": "4 - " + String(message.guild.members.get(arr[a-3]).displayName),
              "value": saveData[arr[a - 3]].toLocaleString() + " points (Ahead "+(saveData[arr[a - 3]] - saveData[arr[a - 4]]).toLocaleString()+" points)"
            },
            {
              "name": "5 - " + String(message.guild.members.get(arr[a-4]).displayName),
              "value": saveData[arr[a - 4]].toLocaleString() + " points (Ahead "+(saveData[arr[a - 4]] - saveData[arr[a - 5]]).toLocaleString()+" points)"
            },
            {
              "name": "6 - " + String(message.guild.members.get(arr[a-5]).displayName),
              "value": saveData[arr[a - 5]].toLocaleString() + " points (Ahead "+(saveData[arr[a - 5]] - saveData[arr[a - 6]]).toLocaleString()+" points)"
            },
            {
              "name": "7 - " + String(message.guild.members.get(arr[a-6]).displayName),
              "value": saveData[arr[a - 6]].toLocaleString() + " points (Ahead "+(saveData[arr[a - 6]] - saveData[arr[a - 7]]).toLocaleString()+" points)"
            },
            {
              "name": "8 - " + String(message.guild.members.get(arr[a-7]).displayName),
              "value": saveData[arr[a - 7]].toLocaleString() + " points (Ahead "+(saveData[arr[a - 7]] - saveData[arr[a - 8]]).toLocaleString()+" points)"
            },
            {
              "name": "9 - " + String(message.guild.members.get(arr[a-8]).displayName),
              "value": saveData[arr[a - 8]].toLocaleString() + " points (Ahead "+(saveData[arr[a - 8]] - saveData[arr[a - 9]]).toLocaleString()+" points)"
            },
            {
              "name": "10 - " + String(message.guild.members.get(arr[a-9]).displayName),
              "value": saveData[arr[a - 9]].toLocaleString() + " points (Ahead "+(saveData[arr[a - 9]] - saveData[arr[a - 10]]).toLocaleString()+" points)"
            }
          ]
        }
      })}
    }else if (command === "poll") {
      if (!message.member.roles.some(r => ["Adminstrator", "Moderator", "Bot", "Brice"].includes(r.name))) return
      let table = []
      let fields = []
      message.content.split(" ").forEach(function(text){
        if (!text.match(/\s/g)) {
          table.push(text)
        }
      })
      table.splice(0, 1)
      table.forEach(function(text, index){
        if (!index == 0) {
          fields.push({"name": "Option " + alphabet[index-1], "value": text.replace(`"`, "")})
        }
      })
      const msg = message.channel.send({
        "embed": {
            "title": `${message.member.displayName} has started a poll.`,
            "description": `${table[0]}`,
            "color": Number("0x"+Math.floor(Math.random()*16777215).toString(16)),
            "fields": fields
        }
    })
    fields.forEach(function(a, index){
      msg.react(alphabet[index])
    })
    }
  });

  
client.login(process.env.BOT_TOKEN);

client.on("presenceUpdate", (old, user) => {
    if (!user.roles.some(r => ["Brice"].includes(r.name))) return
    console.log(user.presence)
    let game = user.presence.game
    if (!game && streaming[user.id]) return delete streaming[user.id]
    if (!game) return
    if (!game.streaming && streaming[user.id]) return delete streaming[user.id]
    if (!game.streaming) return
    streaming[user.id] = true
    let username = game.url.split("/")[3]
    request(`https://api.twitch.tv/kraken/channels/${username}?client_id=${twitchid}`, function(err, res, body) {
        if (body) {
            if (!body) return
            let gamename = String(game.name)
            body = JSON.parse(body)
            role.setMentionable(true)
            notifications.send('<@&460105041563615234>')
            role.setMentionable(false)
            notifications.send({
                "embed": {
                    "title": `${user.displayName} has started streaming!`,
                    "description": `You can watch the stream [here](${game.url})`,
                    "color": Number("0x"+Math.floor(Math.random()*16777215).toString(16)),
                    "footer": {
                        "text": "*Information based on twitch and user settings."
                    },
                    "thumbnail": {
                        "url": body["logo"]
                    },
                    "fields": [{
                        "name": `Streaming "${game.name}"`,
                        "value": `Playing ${body["game"]}`
                    }]
                }
            })
        }
    })
})
client.on('guildMemberAdd', member => {
    log.send(`${member} has joined at ${new Date()}`)
});
client.on('guildMemberRemove', member => {
    log.send(`${member} has left at ${new Date()}`)
});
