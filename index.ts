import {EventEmitter} from 'events';
import * as WebSocket from 'ws'
import axios from 'axios';
export {Bot}

export interface Author {
    userId: string
    username: string
    tag: string
    avatarID: string
}

export interface SendMessageConfig {
    channelId: string
    content: string
    tts: boolean
}

export interface SendEmbedConfig {
    channelId: string
    title: string
    description: string
    tts: boolean
    fields?: string
}

export interface Message {
    channelId: string
    content: string
    author: Author
    time: string, 
    token: string,
    guildId: string
}

export interface Channel {
    channelId: string
    channelType: string
    name: string
    nsfw: boolean
}

export interface Guild {
    guildId: string,
    name: string,
    icon: string,
    splash: string,
    ownerId: string,
    roles: JSON,
    region: string,
    Description: string
}

class Bot extends EventEmitter {

    ws: WebSocket
    token: string
    
    async run(token: string) {
        this.token = token
        this.ws = new WebSocket("wss://gateway.discord.gg/?v=6&encoding=json");
        this.ws.onmessage = (response) => this.onmsg.apply(this, [response])
        this.ws.onclose = () => this.login.apply(this)
    }

    async getChannel(id: string): Promise<Channel> {
        try {
            let response = await axios.get("https://discord.com/api/v8/channels/"+id, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': 'Bot ' + this.token
                }
            })  
                let json = response.data
                let outChannel: Channel = {
                    name: json.name,
                    channelType: json.type,
                    nsfw: json.nsfw,
                    channelId: json.id
                } 
                return outChannel
            } catch (error) {
            console.log(error)
        }
    }
    login() {
        let msg = {
            "token": this.token,
            "properties": {
                "$os": "browser",
                "$browser": "chrome",
                "$device": "cloud9"
            },
            "compress": false
        }
        let payload = {"op": 2, "d": msg}; 
        this.ws.send(JSON.stringify(payload)); 
    }

    sendMessage(c: SendMessageConfig) {
        axios({
            method: "post",
            url: "https://discord.com/api/v8/channels/"+c.channelId+"/messages",
            data: {
                "content": c.content,
                "tts": false,
            },
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Bot ' + this.token
            }
        })
        .catch(function (response) {
            console.log(response);
        });
    }
    
    sendEmbed(c: SendEmbedConfig) {
        axios({
            method: "post",
            url: "https://discord.com/api/v8/channels/"+c.channelId+"/messages",
            data: {
                "embed": {
                    "title": c.title,
                    "description": c.description,
                    "fields": JSON.parse(c.fields),
                    "tts": false,
                },
            },
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Bot ' + this.token
            }
        })
        .catch(function (response) {
            console.log(response);
        });
    }
    
    onmsg(msg) {
        let json = msg.data; 
        json = JSON.parse(json);
        if (json.op == 10) {
            this.login();
            this.emit('connected', json)
        } else if (json.op == 0) { 
            if (json.t == "MESSAGE_CREATE") {
                let out = json.d
                let messageAuthor: Author = {
                    userId: out.author.id,
                    username: out.author.username,
                    tag: out.author.discriminator,
                    avatarID: out.author.avatar
                }
                let response: Message = {
                    channelId: out.channel_id,
                    content: out.content,
                    author: messageAuthor,
                    time: out.timestamp,
                    token: this.token,
                    guildId: out.guild_id
                }
                this.emit('message', response)
            }
        }
    }
}
