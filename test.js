require("dotenv").config();
const mySecret = process.env.TOKEN
const Discord = require("discord.js");
const fetch = require("node-fetch");
const { prototype } = require("events");
const http = require("https");
const client = new Discord.Client();

client.login(mySecret);

client.on("ready", () => {
  console.log(`Logged in as
  ${client.user.tag}!`)
});
client.on("message", msg => { 
    if(msg.author.bot) return;
    command(msg);
});

function command(msg)
{
  try{
    if(msg.toString().includes("$define"))
    {
      let word ="";
      for(let i = 1; msg.toString().split(" ")[i] !== undefined; ++i)
        word = word + msg.toString().split(" ")[i].toLowerCase() + "%20";
    
      console.log(word)

      findWord(word,msg,1)
      word = "";
    }
    else if(msg.toString().includes("$synonym"))
    {
      let word ="";
      for(let i = 1; msg.toString().split(" ")[i] !== undefined; ++i)
        word = word + msg.toString().split(" ")[i].toLowerCase() + "%20";

      console.log(word)

      findWord(word,msg,2)
      word = "";
    }
    else if(msg.toString().includes("$help"))
    {
       msg.channel.send(`$define word`);
       msg.channel.send(`$synonym word`);
       msg.channel.send(`$findAnime (optional flags: -i for image, -v for video, -l=number for number of results) URL`);

    }
    else if(msg.toString().includes("$findAnime"))
    {
      let flags ={};
      let urlIndex = 0;
      for(let i = 1; msg.toString().split(" ")[i] !== undefined; ++i)
      {
        urlIndex = i;
        switch(msg.toString().split(" ")[i].toLowerCase())
        {
          case "-i":
          {
            flags["-i"] = true;
            console.log("image = " + flags["-i"])
          }
          break;
          case "-v":
          {
            flags["-v"] = true;
            console.log("video = " + flags["-v"])
          }
        }
        if(msg.toString().split(" ")[i].toLowerCase().includes("-l="))
        {
          let str = msg.toString().split(" ")[i].toLowerCase().substring(3);
          flags["-l"] = parseInt(str);
        }
      }

      findAnime(msg.toString().split(" ")[urlIndex],flags,msg)
      flags = {};
    }
  }
  catch(err){}
}

function findAnime(URL,flags,msg)
{
  let options = {
    "method": "GET",
    "hostname": "api.trace.moe",
    "path": '/search?anilistInfo&url=',
    "headers": 
    {
        'custom': 'Custom Header Demo works'
    }
  };
  console.log(URL)
  options["path"] += URL

  let req = http.request(options, function (res) {
  let chunks = [];

  res.on("data", function (chunk) {
      chunks.push(chunk);
  });

  res.on("end", function () {
          let body = Buffer.concat(chunks);
          let jsonObject = JSON.parse(body.toString())  

          try{
              //console.log(jsonObject);
              displayAnime(jsonObject,msg,flags);
          } catch(err){}
      });

  });
  req.end();
}

function displayAnime(jsonObject,msg,flags)
{
  let length = flags["-l"];
  if(length === undefined || Number.isNaN(flags["-l"]))
    length = 1;

  msg.channel.send("-----------------------------------------------------------------");
  for(let l = 0; l < length && l < jsonObject["result"].length; l++)
  {
    if(flags["-i"])
    {
      msg.channel.send(jsonObject["result"][l]["image"]);
    }
    if(flags["-v"])
    {
      msg.channel.send(jsonObject["result"][l]["video"]);
    }
    msg.channel.send(`title: ${jsonObject["result"][l]["anilist"]["title"]["romaji"]}
similarity: ${jsonObject["result"][l]["similarity"].toFixed(2)}
episode: ${jsonObject["result"][l]["episode"]}
-----------------------------------------------------------------`);
    // msg.channel.send("title: " + jsonObject["result"][l]["anilist"]["title"]["romaji"]);
    // msg.channel.send("similarity: " + jsonObject["result"][l]["similarity"].toFixed(2));
    // msg.channel.send("episode: " + jsonObject["result"][l]["episode"]);
    // msg.channel.send("-----------------------------------------------------------------");
  }               
}

function displaySyn(jsonObject,msg)
{
            for(let l = 0; l < Object.keys(jsonObject).length; l++)
              for(let i = 0; i < Object.keys(jsonObject[l]["meanings"]).length; i++)
                  for(let j = 0; j < Object.keys(jsonObject[l]["meanings"][i]["definitions"]).length; j++)
                    for(let n = 0; n < Object.keys(jsonObject[l]["meanings"][i]["definitions"][j]["synonyms"]).length; n++)
                      msg.channel.send("- " + jsonObject[l]["meanings"][i]["definitions"][j]["synonyms"][n]);
}

function displayDef(jsonObject,msg)
{
  for(let l = 0; l < Object.keys(jsonObject).length; l++)
    for(let i = 0; i < Object.keys(jsonObject[l]["meanings"]).length; i++)
      for(let j = 0; j < Object.keys(jsonObject[l]["meanings"][i]["definitions"]).length; j++)
          msg.channel.send("- " + jsonObject[l]["meanings"][i]["definitions"][j]["definition"])

}

function findWord(word,msg,choice)
{
  let options = {
      "method": "GET",
      "hostname": "api.dictionaryapi.dev",
      "path": '/api/v2/entries/en_US/',
      "headers": 
      {
          'custom': 'Custom Header Demo works'
      }
  };
  options["path"] += word
  let req = http.request(options, function (res) {
  let chunks = [];

  res.on("data", function (chunk) {
      chunks.push(chunk);
  });

  res.on("end", function () {
          let body = Buffer.concat(chunks);
          let jsonObject = JSON.parse(body.toString())  

          try{
            if(jsonObject["title"] === "No Definitions Found")
            {
              msg.channel.send(jsonObject["title"])
              return
            }
            switch(choice)
            {
              case 1: displayDef(jsonObject,msg); break;
              case 2: displaySyn(jsonObject,msg); break;  
            }
          } catch(err){}
      });
  });
  req.end();
}