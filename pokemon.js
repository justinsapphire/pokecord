//  +--------------+  \\
//  | Dependencies |  \\
//  +--------------+  \\

const Discord = require("discord.js") //access Discord.js
const bot = new Discord.Client({disableEveryone: true}) //Defines Bot
const botconfig = require("./app.json") //Configures Bot
const pokemon = require("./pokemon.json") //Gets data on all the pokemon cards
const pokemonList = require("./pokemonlist.json") //Gets list of all pokemon
const fs = require("fs") //Accesses File Systems
//const superagent = require("superagent") //gets superagent
const serverData = require("./serverdata.json") //gets serverdata
const userData = require("./userdata.json") //gets userdata
const marketData = require("./marketdata.json") //gets marketdata
const channelData = require("./channeldata.json") //gets channeldata

//  +--------+  \\
//  | Bot On |  \\
//  +--------+  \\

bot.on("ready", async () => {    
    console.log(`${bot.user.username} is online in ${bot.guilds.size} servers!`)
    bot.user.setActivity("Sapphire's Commands", {type: "LISTENING"});
});

//  +---------------+  \\
//  | Bot Responses |  \\
//  +---------------+  \\

bot.on("message", async message => {
    //  +-----------+  \\
    //  | Variables |  \\
    //  +-----------+  \\
    
    let prefix = botconfig.prefix;
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);
    if(message.author.bot) return;
    if(message.author.id === "0") return; //Blacklisted People
    
    //  +----------+  \\
    //  | Commands |  \\
    //  +----------+  \\
    
    if(serverData[message.guild.id]) {
        prefix = serverData[message.guild.id].prefix
    }
    
    

    if(cmd === `${prefix}testcommand`) {
        //message.channel.send(pokemon.bulbasaur.test)
        //message.channel.send(pokemon.bulbasaur.attack1.name)
        //message.channel.send(Date.now());
        //message.channel.send(pokemon[0].bulbasaur.price)
        //message.channel.send(userData[message.author.id].cards.split("-"))
        //let arrayone = ["hello", "why", "lmfao", { "set": 3, "oooo": message.author.id}]
        //let pos = arrayone.map(function(e) { return e.set; }).indexOf('3');
        //message.channel.send(pos)
        //message.channel.send(arrayone[3].set)
        //let oh = arrayone.findIndex(v => v.oooo === message.author.id);
        //message.channel.send(oh)
    }
    
    if(cmd === `${prefix}prefix`) {
        if(!message.member.hasPermission("ADMINISTRATOR")) {
            message.channel.send("You do not have permission to change the prefix of this bot! You must have the Administrator permission to do so.")
        } else if(!args[0]){
            serverData[message.guild.id] = {
                prefix: botconfig.prefix
            }
            
            message.channel.send(`Your prefix was reset to ${botconfig.prefix}`)
        } else {
            serverData[message.guild.id] = {
                prefix: args[0]
            }
            message.channel.send(`Your prefix was set to: ${args[0]}`)
        }
    }
    
    if(cmd === `${prefix}start`){
        if(userData[message.author.id]) {
            message.channel.send("You have already started pokécard! You don't need to start again!")
        } else {
            //let versions = cardData.versions
            userData[message.author.id] = {
                cards: [pokemon[0].bulbasaur.pokedexnumber + "-" + (Number(pokemon[0].bulbasaur.count) + 1), pokemon[1].ivysaur.pokedexnumber + "-" + (Number(pokemon[1].ivysaur.count) + 1),
                pokemon[2].venusaur.pokedexnumber + "-" + (Number(pokemon[2].venusaur.count) + 1)],
                selected: 0,
                money: 0,
                moneyLastEarned: 0,
                dailyLastGotten: 0
            }
            pokemon[0].bulbasaur.count = Number(pokemon[0].bulbasaur.count) + 1
            pokemon[1].ivysaur.count = Number(pokemon[1].ivysaur.count) + 1
            pokemon[2].venusaur.count = Number(pokemon[2].venusaur.count) + 1
            message.channel.send("Congratulations! You've officially started pokécard.")
        }
    }
    
    if(cmd === `${prefix}shop`){
        if(userData[message.author.id]) {
            let shopEmbed = new Discord.RichEmbed()
            .setColor(botconfig.color)
            if(args[0]) {
                if(args[0] === "1") {
                    if(marketData.lastUpdated + 86400000 < Date.now()) {
                        marketData.lastUpdated = Date.now()
                        marketData.daily = Math.floor(Math.random() * (pokemon.length))
                    }
                    if(args[1]) {
                        //If there is a second argument
                        if(args[1] === "buy") {
                            //If you wanted to buy the thing in the shop
                            if(userData[message.author.id].money > pokemon[marketData.daily][pokemonList[marketData.daily].toLowerCase()].price) {
                                /*let check;
                                for(i = 0; i < userData[message.author.id].cards.length; i++) {
                                    if(Number(userData[message.author.id].cards[i].split("-")[0]) - 1 === marketData.daily) {
                                        shopEmbed.setDescription("You already have this card! You can't buy it again!")
                                        check = "no"
                                    }
                                }
                                if(check === "no") {
                                    //do nothing, they have this card and can't buy it again
                                } else {*/
                                    //send confirmation message
                                    
                                    if(!channelData[message.channel.id]) {
                                        channelData[message.channel.id] = {
                                            marketRequestDaily: [message.author.id],
                                            marketRequestBooster: [],
                                            marketRequestGlobal: [],
                                            duelRequest: [],
                                            giftRequest: [],
                                            discardRequest: []
                                        }
                                        shopEmbed.addField("Are you sure you want to buy this " + pokemonList[marketData.daily] + " for $" + pokemon[marketData.daily][pokemonList[marketData.daily].toLowerCase()].price + "?", "Type " + prefix + "confirm if you do, or " + prefix + "deny if you don't.")
                                    } else {
                                        let residue
                                        for(i = 0; i < channelData[message.channel.id].marketRequestDaily.length; i++) {
                                            if(channelData[message.channel.id].marketRequestDaily[i] === message.author.id) {
                                                shopEmbed.addField("You already have a request running! Confirm or deny it first.", "_ _")
                                                residue = "yes"
                                            }
                                        } 
                                        if(residue !== "yes") {
                                            channelData[message.channel.id].marketRequestDaily.push(message.author.id)
                                            shopEmbed.addField("Are you sure you want to buy this " + pokemonList[marketData.daily] + " for $" + pokemon[marketData.daily][pokemonList[marketData.daily].toLowerCase()].price + "?", "Type " + prefix + "confirm if you do, or " + prefix + "deny if you don't.")
                                        }
                                    }
                                //}
                            } else {
                                shopEmbed.setDescription("You don't have enough money to buy the " + pokemonList[marketData.daily] + " card!")
                            }
                        }
                    } else {
                        shopEmbed.setDescription("Daily Shop")
                        shopEmbed.addField(pokemonList[marketData.daily], `Cost: $${pokemon[marketData.daily][pokemonList[marketData.daily].toLowerCase()].price} | Buy using: ${prefix}shop 1 buy`)
                        shopEmbed.setImage(pokemon[marketData.daily][pokemonList[marketData.daily].toLowerCase()].image)
                        shopEmbed.setFooter(`You have: $${userData[message.author.id].money} | The shop will update 24 hours after the previous update.`)    
                    }
                } else if(args[0] === "2") {
                    if(args[1]) {
                        if(args[1] === "buy") {
                            //when someone wants to buy an item
                            if(args[2]) {
                                if(args[2] === "1") {
                                    if(userData[message.author.id].money > 300) {
                                        //If they have enough money
                                        if(!channelData[message.channel.id]) {
                                            channelData[message.channel.id] = {
                                                marketRequestDaily: [],
                                                marketRequestBooster: [{
                                                    set: 1,
                                                    buyer: message.author.id
                                                }],
                                                marketRequestGlobal: [],
                                                duelRequest: [],
                                                giftRequest: [],
                                                discardRequest: []
                                            }
                                        } else {
                                            let residue
                                            for(i = 0; i < channelData[message.channel.id].marketRequestBooster.length; i++) {
                                                if(channelData[message.channel.id].marketRequestBooster[i].buyer === message.author.id) {
                                                    shopEmbed.addField("You already have a request running! Confirm or deny it first.", "_ _")
                                                    residue = "yes"
                                                }
                                            } 
                                            if(residue !== "yes") {
                                                channelData[message.channel.id].marketRequestBooster.push({"set": 1, "buyer": message.author.id})
                                                shopEmbed.addField("Are you sure you want to buy the Basic Booster Pack for $300?", "Type " + prefix + "confirm if you do, or " + prefix + "deny if you don't.")
                                            }
                                        }
                                    } else {
                                        shopEmbed.setTitle("You don't have enough money to buy this item!")
                                    }
                                    //If someone wants to buy the first item

                                } else if(args[2] === "2") {
                                    if(userData[message.author.id].money > 250) {
                                        //If they have enough money
                                        if(!channelData[message.channel.id]) {
                                            channelData[message.channel.id] = {
                                                marketRequestDaily: [],
                                                marketRequestBooster: [{
                                                    set: 2,
                                                    buyer: message.author.id
                                                }],
                                                marketRequestGlobal: [],
                                                duelRequest: [],
                                                giftRequest: [],
                                                discardRequest: []
                                            }
                                            shopEmbed.addField("Are you sure you want to buy the Stage 1 Booster Pack for $250?", "Type " + prefix + "confirm if you do, or " + prefix + "deny if you don't.")
                                        } else {
                                            let residue
                                            for(i = 0; i < channelData[message.channel.id].marketRequestBooster.length; i++) {
                                                if(channelData[message.channel.id].marketRequestBooster[i].buyer === message.author.id) {
                                                    shopEmbed.addField("You already have a request running! Confirm or deny it first.", "_ _")
                                                    residue = "yes"
                                                }
                                            } 
                                            if(residue !== "yes") {
                                                shopEmbed.addField("Are you sure you want to buy the Stage 1 Booster Pack for $250?", "Type " + prefix + "confirm if you do, or " + prefix + "deny if you don't.")
                                                channelData[message.channel.id].marketRequestBooster.push({"set": 2, "buyer": message.author.id})
                                            }
                                        }
                                    } else {
                                        shopEmbed.setTitle("You don't have enough money to buy this item!")
                                    }
                                    //If someone wants to buy the second item
                                } else if(args[2] === "3") {
                                    if(userData[message.author.id].money > 500) {
                                        //If they have enough money
                                        if(!channelData[message.channel.id]) {
                                            channelData[message.channel.id] = {
                                                marketRequestDaily: [],
                                                marketRequestBooster: [{
                                                    set: 3,
                                                    buyer: message.author.id
                                                }],
                                                marketRequestGlobal: [],
                                                duelRequest: [],
                                                giftRequest: [],
                                                discardRequest: []
                                            }
                                        } else {
                                            let residue
                                            for(i = 0; i < channelData[message.channel.id].marketRequestBooster.length; i++) {
                                                if(channelData[message.channel.id].marketRequestBooster[i].buyer === message.author.id) {
                                                    shopEmbed.addField("You already have a request running! Confirm or deny it first.", "_ _")
                                                    residue = "yes"
                                                }
                                            } 
                                            if(residue !== "yes") {
                                                shopEmbed.addField("Are you sure you want to buy the Stage 2 Booster Pack for $500?", "Type " + prefix + "confirm if you do, or " + prefix + "deny if you don't.")
                                                channelData[message.channel.id].marketRequestBooster.push({"set": 3, "buyer": message.author.id})
                                            }
                                        }
                                    } else {
                                        shopEmbed.setTitle("You don't have enough money to buy this item!")
                                    }
                                    //If someone wants to buy the third item
                                } else if(args[2] === "4") {
                                    if(userData[message.author.id].money > 1000) {
                                        //If they have enough money
                                        if(!channelData[message.channel.id]) {
                                            channelData[message.channel.id] = {
                                                marketRequestDaily: [],
                                                marketRequestBooster: [{
                                                    set: 4,
                                                    buyer: message.author.id
                                                }],
                                                marketRequestGlobal: [],
                                                duelRequest: [],
                                                giftRequest: [],
                                                discardRequest: []
                                            }
                                        } else {
                                            let residue
                                            for(i = 0; i < channelData[message.channel.id].marketRequestBooster.length; i++) {
                                                if(channelData[message.channel.id].marketRequestBooster[i].buyer === message.author.id) {
                                                    shopEmbed.addField("You already have a request running! Confirm or deny it first.", "_ _")
                                                    residue = "yes"
                                                }
                                            } 
                                            if(residue !== "yes") {
                                                shopEmbed.addField("Are you sure you want to buy the Advanced Booster Pack for $1000?", "Type " + prefix + "confirm if you do, or " + prefix + "deny if you don't.")
                                                channelData[message.channel.id].marketRequestBooster.push({"set": 4, "buyer": message.author.id})
                                            }
                                        }
                                    } else {
                                        shopEmbed.setTitle("You don't have enough money to buy this item!")
                                    }
                                    //If someone wants to buy the fourth item
                                }
                                //If there is a second argument
                            }
                        }
                        //If there is an argument
                    } else {
                        shopEmbed.setDescription("Booster Packs")
                        shopEmbed.addField(`Basic Booster Pack | ${prefix}shop 2 buy 1`, "Contains 3 Random Basic Cards, $300")
                        shopEmbed.addField(`Stage 1 Booster Pack | ${prefix}shop 2 buy 2`, "Contains 3 Random Stage 1 Cards, $250")
                        shopEmbed.addField(`Stage 2 Booster Pack | ${prefix}shop 2 buy 3`, "Contains 3 Random Stage 2 Cards, $500")
                        shopEmbed.addField(`Advanced Booster Pack | ${prefix}shop 2 buy 4`, "Contains 5 Random Cards, $1000")
                        shopEmbed.setFooter(`You have: $${userData[message.author.id].money}`)
                    }
                    
                } else if(args[0] === "3") {
                    if(args[1]) {
                        if(args[1] === "buy") {
                            if(args[2]) {
                                
                            } else {
                                shopEmbed.addField("Please state what you wish to buy.")
                            }
                        } else if(args[1] === "list") {
                            if(args[2]) {

                            } else {
                                shopEmbed.addField("Please state what you wish to list.")
                            }
                        }
                    }
                    //shopEmbed.setDescription("Global Marketplace")
                    shopEmbed.addField("Global Marketplace", "Map of all pokemon in marketplace, name, global id, price")
                    //shopEmbed.setFooter("balance, showing #-# out of #")
                    shopEmbed.setFooter(`You have: $${userData[message.author.id].money} | Showing`)
                } else {
                    shopEmbed.setDescription("Shop Directory")
                    shopEmbed.addField(":one: | Daily Shop", "_ _")
                    shopEmbed.addField(":two: | Booster Packs", "_ _")
                    shopEmbed.addField(":three: | Global Marketplace", "_ _")
                    shopEmbed.setFooter(`Access each page by running ${prefix}shop (Shop Page # Goes Here)`)
                }
            } else {
                shopEmbed.setDescription("Shop Directory")
                shopEmbed.addField(":one: | Daily Shop", "_ _")
                shopEmbed.addField(":two: | Booster Packs", "_ _")
                shopEmbed.addField(":three: | Global Marketplace", "_ _")
                shopEmbed.setFooter(`Access each page by running ${prefix}shop (Shop Page # Goes Here)`)
            }
            message.channel.send(shopEmbed)
        } else {
            message.channel.send(`You haven't started Pokécard yet! You can do so by running the command ${prefix}start`)
        }
    }
    
    if(cmd === `${prefix}confirm`) {
        if(channelData[message.channel.id]) {
            //If there is channel data
            for(i = 0; i < channelData[message.channel.id].marketRequestDaily.length; i++) {

                if(channelData[message.channel.id].marketRequestDaily[i] === message.author.id) {
                    if(userData[message.author.id].money < pokemon[marketData.daily][pokemonList[marketData.daily].toLowerCase()].price) {
                        message.channel.send("You don't have enough money for this item!")
                    } else {
                        userData[message.author.id].money = userData[message.author.id].money - pokemon[marketData.daily][pokemonList[marketData.daily].toLowerCase()].price
                        userData[message.author.id].cards.push(String(Number(marketData.daily) + 1) + "-" + String(Number(pokemon[marketData.daily][pokemonList[marketData.daily].toLowerCase()].count) + 1))
                        pokemon[marketData.daily][pokemonList[marketData.daily].toLowerCase()].count++
                        channelData[message.channel.id].marketRequestDaily.splice(channelData[message.channel.id].marketRequestDaily.indexOf(message.author.id))
                        message.channel.send(`You successfully bought a ${pokemonList[marketData.daily]}!`)
                    }
                    
                }
            }
            for(j = 0; j < channelData[message.channel.id].marketRequestBooster.length; j++) {
                if(channelData[message.channel.id].marketRequestBooster[j]) {
                    if(channelData[message.channel.id].marketRequestBooster[j].set === 1) {
                        if(userData[message.author.id].money < 300) {
                            message.channel.send("You don't have enough money for this item!")
                        } else {
                            userData[message.author.id].money = userData[message.author.id].money - 300
                            let randomcards = [];
                            for(i = 0; randomcards.length < 3; i = Math.floor(Math.random() * pokemon.length)) {
                                if(pokemon[i][pokemonList[i].toLowerCase()].stage === 0) {
                                    randomcards.push(i)
                                }
                            }
                            for(j = 0; j < randomcards.length; j++) {
                                userData[message.author.id].cards.push((Number(randomcards[j]) + 1)+ "-" + (Number(pokemon[randomcards[j]][pokemonList[randomcards[j]].toLowerCase()].count) + 1))
                                pokemon[randomcards[j]][pokemonList[randomcards[j]].toLowerCase()].count++
                            }

                            let dk = channelData[message.channel.id].marketRequestBooster.findIndex(v => v.buyer === message.author.id);
                            channelData[message.channel.id].marketRequestBooster.splice(dk);
                            message.channel.send("Successfully bought the Basic Booster Pack! The pack included: " + randomcards.map(card => pokemonList[card]).join(", "))
                            
                        }
                    } else if(channelData[message.channel.id].marketRequestBooster[j].set === 2) {
                        if(userData[message.author.id].money < 250) {
                            message.channel.send("You don't have enough money for this item!")
                        } else {
                            userData[message.author.id].money = userData[message.author.id].money - 250
                            let randomcards = [];
                            for(i = 0; randomcards.length < 3; i = Math.floor(Math.random() * pokemon.length)) {
                                if(pokemon[i][pokemonList[i].toLowerCase()].stage === 1) {
                                    randomcards.push(i)
                                }
                            }
                            for(j = 0; j < randomcards.length; j++) {
                                userData[message.author.id].cards.push((Number(randomcards[j]) + 1)+ "-" + (Number(pokemon[randomcards[j]][pokemonList[randomcards[j]].toLowerCase()].count) + 1))
                                pokemon[randomcards[j]][pokemonList[randomcards[j]].toLowerCase()].count++
                            }

                            let dk = channelData[message.channel.id].marketRequestBooster.findIndex(v => v.buyer === message.author.id);
                            channelData[message.channel.id].marketRequestBooster.splice(dk);
                            message.channel.send("Successfully bought the Stage 1 Booster Pack! The pack included: " + randomcards.map(card => pokemonList[card]).join(", "))
                        }
                    } else if(channelData[message.channel.id].marketRequestBooster[i].set === 3) {
                        if(userData[message.author.id].money < 500) {
                            message.channel.send("You don't have enough money for this item!")
                        } else {
                            userData[message.author.id].money = userData[message.author.id].money - 500
                            let randomcards = [];
                            for(i = 0; randomcards.length < 3; i = Math.floor(Math.random() * pokemon.length)) {
                                if(pokemon[i][pokemonList[i].toLowerCase()].stage === 2) {
                                    randomcards.push(i)
                                }
                            }
                            for(j = 0; j < randomcards.length; j++) {
                                userData[message.author.id].cards.push((Number(randomcards[j]) + 1)+ "-" + (Number(pokemon[randomcards[j]][pokemonList[randomcards[j]].toLowerCase()].count) + 1))
                                pokemon[randomcards[j]][pokemonList[randomcards[j]].toLowerCase()].count++
                            }

                            let dk = channelData[message.channel.id].marketRequestBooster.findIndex(v => v.buyer === message.author.id);
                            channelData[message.channel.id].marketRequestBooster.splice(dk);
                            message.channel.send("Successfully bought the Stage 2 Booster Pack! The pack included: " + randomcards.map(card => pokemonList[card]).join(", "))
                        }
                    } else if(channelData[message.channel.id].marketRequestBooster[i].set === 4) {
                        if(userData[message.author.id].money < 1000) {
                            message.channel.send("You don't have enough money for this item!")
                        } else {
                            userData[message.author.id].money = userData[message.author.id].money - 1000
                            let randomcards = [];
                            for(i = 0; randomcards.length < 5; i = Math.floor(Math.random() * pokemon.length)) {
                                randomcards.push(i)
                            }
                            for(j = 0; j < randomcards.length; j++) {
                                userData[message.author.id].cards.push((Number(randomcards[j]) + 1)+ "-" + (Number(pokemon[randomcards[j]][pokemonList[randomcards[j]].toLowerCase()].count) + 1))
                                pokemon[randomcards[j]][pokemonList[randomcards[j]].toLowerCase()].count++
                            }

                            let dk = channelData[message.channel.id].marketRequestBooster.findIndex(v => v.buyer === message.author.id);
                            channelData[message.channel.id].marketRequestBooster.splice(dk);
                            message.channel.send("Successfully bought the Advanced Booster Pack! The pack included: " + randomcards.map(card => pokemonList[card]).join(", "))
                        }
                    }
                }
            }
        } else {
        }
    }

    if(cmd === `${prefix}deny`) {
        if(channelData[message.channel.id]) {
            //If there is channel data

            for(i = 0; i < channelData[message.channel.id].marketRequestDaily.length; i++) {
                if(channelData[message.channel.id].marketRequestDaily[i] === message.author.id) {
                    
                    channelData[message.channel.id].marketRequestDaily.splice(channelData[message.channel.id].marketRequestDaily.indexOf(message.author.id))

                    message.channel.send(`You successfully denied the request!`)
                }
            }
            for(i = 0; i < channelData[message.channel.id].marketRequestBooster.length; i++) {
                if(channelData[message.channel.id].marketRequestBooster[i].buyer === message.author.id) {
                    let dk = channelData[message.channel.id].marketRequestBooster.findIndex(v => v.buyer === message.author.id);
                    channelData[message.channel.id].marketRequestBooster.splice(dk);
                    
                    //check if splice works if i only give it part of the object
                    message.channel.send(`You successfully denied the request!`)
                }
            }
        } else {
        }
    }

    if(cmd === `${prefix}balance` || cmd === `${prefix}bal`){
        if(userData[message.author.id]) {
            let balanceEmbed = new Discord.RichEmbed()
            .setColor(botconfig.color)
            .setDescription(`Your Balance Is: $${userData[message.author.id].money}`)
            message.channel.send(balanceEmbed)
        } else {
            message.channel.send(`You must start Pokécard before you can run this command! Use the command ${prefix}start to start.`)
        }
        
    }
    
    if(cmd === `${prefix}daily`) {
        if(userData[message.author.id]) {
            if(userData[message.author.id].dailyLastGotten + 86400000 < Date.now()) {
                userData[message.author.id].money = userData[message.author.id].money + 250
                message.channel.send("Success! You earned $250!")
                userData[message.author.id].dailyLastGotten = Date.now()
            } else {
                message.channel.send("It hasn't been 24 hours since you last used this command!")
            }
        } else {
            message.channel.send(`You haven't started Pokécard yet! Use the command ${prefix}start to start.`)
        }
    }
    
    if(cmd === `${prefix}cards` || cmd === `${prefix}cs`) {
        if(userData[message.author.id]) {
            let yourCards = userData[message.author.id].cards; 
            let cardsToDisplay = [];
            let cardEmbed = new Discord.RichEmbed()
            .setColor(botconfig.color)
            if(message.content.split(' ').indexOf('--name') !== -1) {
                //If --name is in the command
                let a = "placeholder"
                for(i = 0; i < pokemonList.length; i++) {
                    //for every entry in the pokemon list
                    if(args[Number(message.content.split(' ').indexOf('--name')) - 1].toLowerCase().replace(/^\w/, c => c.toUpperCase()) === pokemonList[i]) {
                        //If the pokemon sent is actually a pokemon
                        a = pokemonList[i]
                        //break
                    } else {
                        //If the pokemon sent isn't a pokemon
                        
                        //message.channel.send(args[Number(message.content.split(' ').indexOf('--name'))].toLowerCase().replace(/^\w/, c => c.toUpperCase()))
                    }
                }
                if(a = "placeholder") {
                    //If the pokemon sent isn't a pokemon
                    cardEmbed.setTitle("That's not a pokémon name!")
                } else {
                    //If the pokemon sent is actually a pokemon
                    
                    for(i = 0; i < yourCards.length; i++) {
                        //for every card you have
                        if(yourCards[i].split("-")[0] === Number(pokemonList.indexOf(a)) + 1) {
                            //If the pokedex number of each card is equal to the pokedex number of the filtered card
                            cardsToDisplay.push(yourCards[i])
                        }
                    }
                    let newCardsToDisplay = []
                    if(isNaN(args[0])) {
                        //If the first argument is not a number
                        for(i = 0; i < 15 && i < cardsToDisplay.length; i++) {
                            //For the first 15, or all of the filtered pokemon
                            let stagename;
                            if(pokemon[cardsToDisplay[i].split("-")[0]][args[Number(message.content.split(' ').indexOf('--name'))].toLowerCase()].stage === 0) {
                                //If the pokemon is basic
                                stagename = "Basic"
                            } else if(pokemon[cardsToDisplay[i].split("-")[0]][args[Number(message.content.split(' ').indexOf('--name'))].toLowerCase()].stage === 1) {
                                //If the pokemon is stage 1
                                stagename = "Stage 1"
                            } else if(pokemon[cardsToDisplay[i].split("-")[0]][args[Number(message.content.split(' ').indexOf('--name'))].toLowerCase()].stage === 2) {
                                //If the pokemon is stage 2
                                stagename = "Stage 2"
                            }
                            newCardsToDisplay.push(`**${pokemonList[Number(cardsToDisplay[i].split("-")[0]) - 1]} | Global ID: ${cardsToDisplay[i]} | Number: ${Number(yourCards.indexOf(cardsToDisplay[i])) + 1} | Stage: ${stagename}`)
                        }
                        cardEmbed.addField("Filtered Cards:", newCardsToDisplay.map(card => card).join("\n"))
                        cardEmbed.setFooter(`Showing 1-15 out of ${cardsToDisplay.length} cards`)
                    } else {
                        //If the first argument is a number
                        if(cardsToDisplay.length > 15) {
                            //If there are more than 15 filtered pokemon
                            //cardEmbed.addField("Filtered Cards:", "")
                            
                            for(i = 2 * (Number(args[0]) - 1); i < 15 + 2 * (Number(args[0]) - 1) && i < cardsToDisplay.length; i++) {
                                //For every card called upon
                                let stagename;
                                if(pokemon[cardsToDisplay[i].split("-")[0]][args[Number(message.content.split(' ').indexOf('--name'))].toLowerCase()].stage === 0) {
                                    //If the pokemon is basic
                                    stagename = "Basic"
                                } else if(pokemon[cardsToDisplay[i].split("-")[0]][args[Number(message.content.split(' ').indexOf('--name'))].toLowerCase()].stage === 1) {
                                    //If the pokemon is stage 1
                                    stagename = "Stage 1"
                                } else if(pokemon[cardsToDisplay[i].split("-")[0]][args[Number(message.content.split(' ').indexOf('--name'))].toLowerCase()].stage === 2) {
                                    //If the pokemon is stage 2
                                    stagename = "Stage 2"
                                }
                                newCardsToDisplay.push(`**${pokemonList[Number(cardsToDisplay[i].split("-")[0]) - 1]} | Global ID: ${cardsToDisplay[i]} | Number: ${Number(yourCards.indexOf(cardsToDisplay[i])) + 1} | Stage: ${stagename}`)
                            }
                            cardEmbed.addField("Filtered Cards:", newCardsToDisplay.map(card => card).join("\n"))
                            cardEmbed.setFooter(`Showing ${1 + 2 * (Number(args[0]) - 1)}-${15 + 2 * (Number(args[0]) - 1)} out of ${cardsToDisplay.length} cards`)
                        } else {
                            //If there are less than 15, or 15 filtered pokemon
                            for(i = 0; i < 15 && i < cardsToDisplay.length; i++) {
                                //For the first 15, or all of the filtered pokemon
                                let stagename;
                                if(pokemon[cardsToDisplay[i].split("-")[0]][args[Number(message.content.split(' ').indexOf('--name'))].toLowerCase()].stage === 0) {
                                    //If the pokemon is basic
                                    stagename = "Basic"
                                } else if(pokemon[cardsToDisplay[i].split("-")[0]][args[Number(message.content.split(' ').indexOf('--name'))].toLowerCase()].stage === 1) {
                                    //If the pokemon is stage 1
                                    stagename = "Stage 1"
                                } else if(pokemon[cardsToDisplay[i].split("-")[0]][args[Number(message.content.split(' ').indexOf('--name'))].toLowerCase()].stage === 2) {
                                    //If the pokemon is stage 2
                                    stagename = "Stage 2"
                                }
                                newCardsToDisplay.push(`**${pokemonList[Number(cardsToDisplay[i].split("-")[0]) - 1]} | Global ID: ${cardsToDisplay[i]} | Number: ${Number(yourCards.indexOf(cardsToDisplay[i])) + 1} | Stage: ${stagename}`)
                            }
                            cardEmbed.addField("Filtered Cards:", newCardsToDisplay.map(card => card).join("\n"))
                            cardEmbed.setFooter(`Showing 1-${cardsToDisplay.length} out of ${cardsToDisplay.length} cards`)
                        }
                    }
                }
            } else {
                //If there is no filter
                let previousCards
                for(i = 0; i < yourCards.length; i++) {
                    //for every card you have
                    previousCards = yourCards
                    yourCards[i] = pokemonList[Number(yourCards[i].split("-")[0]) - 1]
                }
                let newCardsToDisplay = []
                if(args[0]) {
                    //If there is an argument
                    if(isNaN(args[0])) {
                        //If the argument is not a number
                        for(i = 0; i < 15 && i < yourCards.length; i++) {
                            //for every pokemon that you called
                            let stagename
                            if(pokemon[pokemonList.indexOf(yourCards[i])][yourCards[i].toLowerCase()].stage === 0) {
                                stagename = "Basic"
                            } else if(pokemon[pokemonList.indexOf(yourCards[i])][yourCards[i].toLowerCase()].stage === 1) {
                                stagename = "Stage 1"
                            } else if(pokemon[pokemonList.indexOf(yourCards[i])][yourCards[i].toLowerCase()].stage === 2) {
                                stagename = "Stage 2"
                            }
                            newCardsToDisplay.push(`**${yourCards[i]} | Global ID: ${previousCards[i]} | Number: ${Number(previousCards.indexOf(previousCards[i])) + 1} | Stage: ${stagename}`)
                        }
                    } else {
                        //If the argument is a number
                        if(yourCards.length > 15) {
                            //If you have more than 15 cards
                            for(i = 2 * (Number(args[0]) - 1); i < 15 + 2 * (Number(args[0]) - 1) && i < yourCards.length; i++) {
                                //for every pokemon that you called
                                let stagename
                                if(pokemon[pokemonList.indexOf(yourCards[i])][yourCards[i].toLowerCase()].stage === 0) {
                                    stagename = "Basic"
                                } else if(pokemon[pokemonList.indexOf(yourCards[i])][yourCards[i].toLowerCase()].stage === 1) {
                                    stagename = "Stage 1"
                                } else if(pokemon[pokemonList.indexOf(yourCards[i])][yourCards[i].toLowerCase()].stage === 2) {
                                    stagename = "Stage 2"
                                }
                                newCardsToDisplay.push(`**${yourCards[i]} | Global ID: ${previousCards[i]} | Number: ${Number(previousCards.indexOf(previousCards[i])) + 1} | Stage: ${stagename}`)
                            }

                        } else {
                            //If you have 15 or less cards
                            for(i = 0; i < 15 && i < yourCards.length; i++) {
                                //for every pokemon that you called
                                let stagename
                                if(pokemon[pokemonList.indexOf(yourCards[i])][yourCards[i].toLowerCase()].stage === 0) {
                                    stagename = "Basic"
                                } else if(pokemon[pokemonList.indexOf(yourCards[i])][yourCards[i].toLowerCase()].stage === 1) {
                                    stagename = "Stage 1"
                                } else if(pokemon[pokemonList.indexOf(yourCards[i])][yourCards[i].toLowerCase()].stage === 2) {
                                    stagename = "Stage 2"
                                }
                                newCardsToDisplay.push(`**${yourCards[i]} | Global ID: ${previousCards[i]} | Number: ${Number(previousCards.indexOf(previousCards[i])) + 1} | Stage: ${stagename}`)
                            }
                        }
                    }
                } else {
                    //If there is not an argument
                    for(i = 0; i < 15 && i < yourCards.length; i++) {
                        //for every pokemon that you called
                        let stagename
                        if(pokemon[pokemonList.indexOf(yourCards[i])][yourCards[i].toLowerCase()].stage === 0) {
                            stagename = "Basic"
                        } else if(pokemon[pokemonList.indexOf(yourCards[i])][yourCards[i].toLowerCase()].stage === 1) {
                            stagename = "Stage 1"
                        } else if(pokemon[pokemonList.indexOf(yourCards[i])][yourCards[i].toLowerCase()].stage === 2) {
                            stagename = "Stage 2"
                        }
                        newCardsToDisplay.push(`**${yourCards[i]} | Global ID: ${previousCards[i]} | Number: ${Number(previousCards.indexOf(previousCards[i])) + 1} | Stage: ${stagename}`)
                    }
                }
            }

            message.channel.send(cardEmbed)
        }
    }
    /*if(cmd === `${prefix}cards...` || cmd === `${prefix}cs...`){ //Make it so that the filter doesn't filter per page, but everything.
        if(userData[message.author.id]) {
            let yourCards = userData[message.author.id].cards
            let newCards = [];

            for(i=0;i<yourCards.length;i++) {
                let res = yourCards[i].split("-");
                newCards.push(res[0])
            }
            for(k=0; k < newCards.length; k++) {
                //change into pokemon names
                let pokemonname = String(pokemonList[Number(newCards[k]) - 1]).toLowerCase()
                let stagename;
                if(pokemon[Number(newCards[k])-1][pokemonname].stage === 0) {
                    stagename = "Basic"
                } else if(pokemon[Number(newCards[k])-1][pokemonname].stage === 1) {
                    stagename = "Stage 1"
                } else if(pokemon[Number(newCards[k])-1][pokemonname].stage === 2) {
                    stagename = "Stage 2"
                } else if(pokemon[Number(newCards[k])-1][pokemonname].stage === 3) {
                    stagename = "Mega"
                }
                newCards[k] = "**" + pokemonList[Number(newCards[k]) - 1] + "** | Global ID: " + userData[message.author.id].cards[k] + " | Number: " + (k + 1) + " | Stage: " + stagename
            }
            let firstoff = [];
            let cardsEmbed = new Discord.RichEmbed()
            .setColor(botconfig.color)
            if(!args[0]) {
                for(i = 0; i < 15 && i < newCards.length; i++) {
                    firstoff.push(newCards[i])
                }
                
                
                cardsEmbed.addField("A list of your cards:", firstoff.map(card => card).join("\n"))
                cardsEmbed.setFooter(`Showing 1-${firstoff.length} out of ${newCards.length} cards.`)
            } else if(isNaN(args[0])) {
                for(i = 0; i < 15 && i < newCards.length; i++) {
                    firstoff.push(newCards[i])
                }
            } else {
                if(newCards[(Number(args[0])-1) * 15] && Number(args[0]) !== 1) {
                    for(i = (Number(args[0])-1)*15; i < (Number(args[0])-1)*15 + 15 && i < newCards.length; i++) {
                        firstoff.push(newCards[i])
                    }
                    cardsEmbed.addField("A list of your cards:", firstoff.map(card => card).join ("\n"))
                    if(newCards[(Number(args[0]) - 1) * 15 + 15]) {
                        cardsEmbed.setFooter(`Showing ${(Number(args[0]) - 1) * 15 + 1}-${(Number(args[0]) - 1) * 15 + 15} out of ${newCards.length} cards.`)
                    } else {
                        cardsEmbed.setFooter(`Showing ${(Number(args[0]) - 1) * 15 + 1}-${newCards.length} out of ${newCards.length} cards.`)
                    }
                } else {
                    cardsEmbed.setDescription("You don't have cards with those numbers!")
                }
            }
            if(args[0]) {
                let searched = "no"
                if(message.content.split(' ').indexOf('--name') !== -1) {
                    if(args[Number(message.content.split(' ').indexOf('--name'))]) {
                        for(i = 0; i < pokemonList.length; i++) {
                            if(args[Number(message.content.split(' ').indexOf('--name'))].toLowerCase().replace(/^\w/, c => c.toUpperCase()) === pokemonList[i]) {
                                searched = pokemonList[i]
                            }
                        }
                        let newthing = [];
                        if(searched === "no") {
                            cardsEmbed.addField("Filtered Cards", "Failed to filter cards.")
                        } else {
                            let beforethesplice = firstoff.length
                            for(i = 0; i < firstoff.length; firstoff.splice(0, 1)) {
                                if(firstoff[i].split("**")[1] === searched) {
                                    newthing.push(firstoff[0])
                                }
                            }
                            if(newthing[0]) {
                                if(isNaN(args[1])) {
                                    let firstoffagain = []
                                    for(i = 0; i < 15 && i < newCards.length; i++) {
                                        firstoffagain.push(newCards[i])
                                    }
                                    cardsEmbed.addField("A list of your cards:", firstoffagain.map(card => card).join("\n"))
                                    cardsEmbed.setFooter(`Showing 1-${beforethesplice} out of ${newCards.length} cards`)
                                }
                                cardsEmbed.addField("_ _", "_ _")
                                cardsEmbed.addField("Filtered Cards: ", newthing.map(card => card).join("\n"))
                            } else {
                                cardsEmbed.addField("_ _", "_ _")
                                cardsEmbed.addField("Filtered Cards", "Failed to Filter Cards")
                            }
                        }
                    }
                } else {
                    cardsEmbed.setTitle("Invalid Arguments")
                }
            }
            message.channel.send(cardsEmbed)
        } else {
            message.channel.send(`You haven't started pokécard yet! You can do so by using the command, ${prefix}start.`)
        }
    }

    if(cmd === `${prefix}card` || cmd === `${prefix}c`) {
        let cardEmbed = new Discord.RichEmbed()
            .setColor(botconfig.color)
            .setThumbnail(message.author.displayAvatarURL)

        if(!args[0]) {
            if(userData[message.author.id]) {
                //Selected Card
                let name = pokemonList[Number(userData[message.author.id].cards[userData[message.author.id].selected].split("-")[0]) - 1].toLowerCase()
                let type = pokemon[Number(userData[message.author.id].cards[userData[message.author.id].selected].split("-")[0]) - 1][name].type.replace(/^\w/, c => c.toUpperCase());
                let weaknesses = pokemon[Number(userData[message.author.id].cards[userData[message.author.id].selected].split("-")[0]) - 1][name].weakness.replace(/^\w/, c => c.toUpperCase());
                let resistances = pokemon[Number(userData[message.author.id].cards[userData[message.author.id].selected].split("-")[0]) - 1][name].resistances.replace(/^\w/, c => c.toUpperCase());
                cardEmbed.setImage(pokemon[Number(userData[message.author.id].cards[userData[message.author.id].selected].split("-")[0]) - 1][name].image)
                cardEmbed.setDescription("Evolves Into: " + pokemon[Number(userData[message.author.id].cards[userData[message.author.id].selected].split("-")[0]) - 1][name].evolvesinto.replace(/^\w/, c => c.toUpperCase()))
                cardEmbed.addField("Type: " + type, "Weaknesses: " + weaknesses, true)
                cardEmbed.addField("Resistances: " + resistances, "Pokedex Number: " + pokemon[Number(userData[message.author.id].cards[userData[message.author.id].selected].split("-")[0]) - 1][name].pokedexnumber, true)
                cardEmbed.setFooter(`Selected Card: ${Number(userData[message.author.id].selected) + 1}/${userData[message.author.id].cards.length} | Global ID: ${userData[message.author.id].cards[userData[message.author.id].selected]}`)
                message.channel.send(cardEmbed)
            } else {
                message.channel.send(`You have not started yet! You can do so by using the command ${prefix}start`)
            }
        } else if(isNaN(args[0])){
            //if the first argument is not a number
            let name = args[0].toLowerCase().replace(/^\w/, c => c.toUpperCase());
            let sent;
            //message.channel.send(name)
            for(i = 0; i < pokemonList.length; i++) {
                if(name === pokemonList[i]) {
                    if(pokemon[i][args[0].toLowerCase()]) {
                        let type = pokemon[i][args[0].toLowerCase()].type.replace(/^\w/, c => c.toUpperCase());
                        //work on type
                        let weaknesses = pokemon[i][args[0].toLowerCase()].weakness.replace(/^\w/, c => c.toUpperCase());
                        let resistances = pokemon[i][args[0].toLowerCase()].resistances.replace(/^\w/, c => c.toUpperCase());
                        cardEmbed.setDescription("Evolves Into: " + pokemon[i][args[0].toLowerCase()].evolvesinto.replace(/^\w/, c => c.toUpperCase()))
                        cardEmbed.setImage(pokemon[i][args[0].toLowerCase()].image)
                        cardEmbed.addField("Type: " + type, "Weaknesses: " + weaknesses, true)
                        cardEmbed.addField("Resistances: " + resistances, "Pokedex Number: " + pokemon[i][args[0].toLowerCase()].pokedexnumber, true)
                        message.channel.send(cardEmbed)

                        sent = "yes"
                    } else {
                        message.channel.send("Sapphire hasn't inputted this card's data yet! Sorry!")
                        sent = "yes"
                    }
                }
            }
            if(sent === "yes") {
                //nothing
            } else {
                message.channel.send("That's not a pokémon name!")
            }
        } else {
            //if the first argument is a number
            if(userData[message.author.id]) {
                if(userData[message.author.id].cards[Number(args[0])-1]) {
                    let name = pokemonList[Number(userData[message.author.id].cards[Number(args[0]) - 1].split("-")[0]) - 1].toLowerCase()
                    let type = pokemon[Number(userData[message.author.id].cards[Number(args[0]) - 1].split("-")[0]) - 1][name].type.replace(/^\w/, c => c.toUpperCase());
                    let weaknesses = pokemon[Number(userData[message.author.id].cards[Number(args[0]) - 1].split("-")[0]) - 1][name].weakness.replace(/^\w/, c => c.toUpperCase());
                    let resistances = pokemon[Number(userData[message.author.id].cards[Number(args[0]) - 1].split("-")[0]) - 1][name].resistances.replace(/^\w/, c => c.toUpperCase());
                    cardEmbed.setDescription("Evolves Into: " + pokemon[Number(userData[message.author.id].cards[Number(args[0]) - 1].split("-")[0]) - 1][name].evolvesinto.replace(/^\w/, c => c.toUpperCase()))
                    cardEmbed.setImage(pokemon[Number(userData[message.author.id].cards[Number(args[0]) - 1].split("-")[0]) - 1][name].image)
                    cardEmbed.addField("Type: " + type, "Weaknesses: " + weaknesses, true)
                    cardEmbed.addField("Resistances: " + resistances, "Pokedex Number: " + pokemon[Number(userData[message.author.id].cards[Number(args[0]) - 1].split("-")[0]) - 1][name].pokedexnumber, true)
                    cardEmbed.setFooter("Displaying Card: " + args[0] + `/${userData[message.author.id].cards.length} | Global ID: ${userData[message.author.id].cards[Number(args[0]) - 1]}`)
                    
                    message.channel.send(cardEmbed)
                } else {
                    message.channel.send("You don't have a card with that number!")
                }
            } else {
                message.channel.send(`You haven't started Pokécard yet! You can do so by typing ${prefix}start`)
            }
        }
    }*/

    if(cmd === `${prefix}select` || cmd === `${prefix}st`) {
        if(userData[message.author.id]) {
            if(!args[0]) {
               message.channel.send("You need to send an argument in order for the command to work!")
                 
            } else if(parseInt(args[0])) {
                if(userData[message.author.id].cards[Number(args[0])-1]) {
                    if(pokemon[Number(userData[message.author.id].cards[Number(args[0]) - 1].split("-")[0]) - 1][pokemonList[Number(userData[message.author.id].cards[Number(args[0])-1].split("-")[0])-1].toLowerCase()].stage === 0) {
                        userData[message.author.id].selected = Number(args[0]) - 1
                        message.channel.send(`You've successfully selected #${args[0]}, ${pokemonList[Number(userData[message.author.id].cards[Number(args[0]) - 1].split("-")[0]) - 1]}, with a Global ID of ${userData[message.author.id].cards[Number(args[0]) - 1]}`)
                     } else {
                         message.channel.send("You can't select a non-basic card!")
                     }
                    
                } else {
                    message.channel.send("You don't have a card with that number!")
                }
                
            }
        } else {
            message.channel.send(`You haven't started Pokécard yet! You can do so by typing ${prefix}start`)
        }
    }
    
    if(cmd === `${prefix}discard`){

    }

    if(cmd === `${prefix}battle`){

    }

    if(cmd === `${prefix}gift`){
        
    }
    
    if(cmd === `${prefix}help` || cmd === `${prefix}help`){
        
    }
    
    if(cmd === `${prefix}ping` || cmd === `${prefix}p`) {       
        let m = await message.channel.send("This is a message to test the latency of the bot. If you see this, then the bot's lagging pretty bad.");
        let pingEmbed = new Discord.RichEmbed()
        .setDescription(":ping_pong: PIIIING! POOOONG!")
        .setColor("#ffffff")
        .addField("Latency:", `${m.createdTimestamp - message.createdTimestamp} milliseconds`)
        .addField("This may not be accurate, as larger commands will take longer to process and respond.", ":shrug:")
        .addField("(TEST) latency:", `${bot.ping} milliseconds.`)
        m.delete()
        return message.channel.send(pingEmbed)
        
    }
    
    if(userData[message.author.id]) {
        if(userData[message.author.id].moneyLastEarned + 30000 < Date.now()) {
            userData[message.author.id].money = userData[message.author.id].money + Math.floor(Math.random() * 4) + 1 
            userData[message.author.id].moneyLastEarned = Date.now()
        }   
    }
    
    // +-----------------+ \\
    // | Update Database | \\
    // +-----------------+ \\
    
    fs.writeFile('userdata.json', JSON.stringify(userData), (err) => {
        if(err) console.error(err);
    });
    
    fs.writeFile('serverdata.json', JSON.stringify(serverData), (err) => {
        if(err) console.error(err);
    });
    
    fs.writeFile('pokemon.json', JSON.stringify(pokemon), (err) => {
        if(err) console.error(err);
    })

    fs.writeFile('marketdata.json', JSON.stringify(marketData), (err) => {
        if(err) console.error(err);
    })

    fs.writeFile('channeldata.json', JSON.stringify(channelData), (err) => {
        if(err) console.error(err);
    })
});

//  +-----------+  \\
//  | Bot Login |  \\
//  +-----------+  \\

bot.login(botconfig.token)

//  +--------------+  \\
//  |    To Do     |  \\
//  |--------------|  \\
//  | -dm          |  \\
//  | -start up    |  \\
//  +--------------+  \\

/*
{
    "(pokemonname)": {
        "image": "",
        "hp": ,
        "type": "",
        "stage": ,
        "weakness": "",
        "resistances": "",
        "attack1": {
            "name": "",
            "damage": 
        },
        "attack2": {
            "name": "",
            "damage": 
        },
        "pokedexnumber": ,
        "count": 0,
        "price": ,
        "mega": "none",
        "ex": "none",
        "gx": "none",
        "evolvesinto": ""
    }
},

i = 0; randomcards.length === 3; i = Math.Floor(Math.random() * randomcards.length)
*/