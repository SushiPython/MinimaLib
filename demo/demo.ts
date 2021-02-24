import * as ml from 'DIRECT PATH TO FILE'


const bot = new ml.Bot()

bot.on('connect', (data) => {
    console.log('The bot is now online!')
})

bot.on('message', async(response) => {
    console.log(response.content)
})

bot.on('!!help', async(response) => {
    let help: ml.SendMessageConfig = {
        channelId: response.channelId,
        content: `${response.author.username} requested help!`,
        tts: false,
    }
    await bot.sendMessage(help)
})

bot.on('!!data', async(response) => {
    let data: ml.SendMessageConfig = {
        channelId: response.channelId,
        content: "`"+JSON.stringify(response)+"`",
        tts: false,
    }
    await bot.sendMessage(data)
})

bot.on('!!getChannel', async(response) => {
    let second = response.content.split(' ')[1]
    bot.sendMessage({
        channelId: response.channelId,
        content: "Finding data for " + second,
        tts: false
        })
    let channelData = await bot.getChannel(second)
    let getChannel: ml.SendMessageConfig = {
        channelId: response.channelId,
        content: `Channel ID: ${channelData.channelId}\nName: ${channelData.name}`,
        tts: false
    }
    await bot.sendMessage(getChannel)
})

bot.on('!!getUser', async(response) => {
    let passedID = response.content.split(' ')[1]
    console.log(passedID)
    let user = await bot.getUser(passedID)
    bot.sendMessage({
        channelId: response.channelId,
        content: user.username,
        tts: false
    })
})

bot.on('!!embed', async(response) => {
    let fields = [
        {
        "name": "thing",
        "value": "a",
        "inline": true
        }
    ]
    let embed: ml.SendEmbedConfig = {
        channelId: response.channelId,
        description: "Hello World",
        title: "Testing",
        tts: false,
        fields: JSON.stringify(fields)
    }
    await bot.sendEmbed(embed)
})

bot.on('!!deleteme', async(response) => {
    await bot.deleteMessage(response)
    await bot.sendMessage({
        content: "Deleted!",
        channelId: response.channelId,
        tts: false
    })
})

bot.on('!!editin3s', async(response) => {
    let message = await bot.sendMessage({
        channelId: response.channelId,
        content: "Message 1",
        tts: false
    })
    setTimeout(async function(){
        await bot.editMessage(message, {
            channelId: message.channelId,
            content: "Message 2",
            tts: false
        })
    }, 3000);
})


bot.run("BOT_TOKEN")
