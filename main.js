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

client.on("ready", () => {
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
    client.user.setPresence({ game: { name: `over coolman6's server`, type: 3 } });
    log = client.channels.get(`459077897525788692`)
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
          "title": "The Logic Lounge Leaderboard",
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
    }
  });

  
client.login(process.env.BOT_TOKEN);
