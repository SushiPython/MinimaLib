import * as ml from './minimalib'


const bot = new ml.Bot()   

bot.on('connect', (data) => {
    console.log('le connectione!')
})

bot.on('message', (response) => {
    switch(response.content) {
        case '!!help':
            let help: ml.SendMessageConfig = {
                channelId: response.channelId,
                content: `${response.author.username} requested help!`,
                tts: false,
            }
            bot.sendMessage(help)
            break;
        case '!!data':
            let data: ml.SendMessageConfig = {
                channelId: response.channelId,
                content: "`"+JSON.stringify(response)+"`",
                tts: false,
            }
            bot.sendMessage(data)
            break;
    }
});

bot.run("token")



