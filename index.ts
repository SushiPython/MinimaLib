import {EventEmitter} from 'events';
import * as WebSocket from 'ws'
import axios from 'axios';
export {Bot}

export interface author {
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
}

export interface message {
    channelId: string
    content: string
    author: author
    time: string, 
    token: string
}


class Bot extends EventEmitter {
    ws: WebSocket
    token: string
    
    run(token) {
        this.token = token
        this.ws = new WebSocket("wss://gateway.discord.gg/?v=6&encoding=json");
        this.ws.onmessage = (response) => this.onmsg.apply(this, [response])
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
        .then(function (response) {
            console.log(response);
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
                    "description": c.description
                },
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
    
    onmsg(msg) {
        let json = msg.data; 
        json = JSON.parse(json);
        if (json.op == 10) {
            this.login();
            this.emit('connected', json)
        } else if (json.op == 0) { 
            if (json.t == "MESSAGE_CREATE") {
                let out = json.d
                let messageAuthor: author = {
                    userId: out.author.id,
                    username: out.author.username,
                    tag: out.author.discriminator,
                    avatarID: out.author.avatar
                }
                let response: message = {
                    channelId: out.channel_id,
                    content: out.content,
                    author: messageAuthor,
                    time: out.timestamp,
                    token: this.token
                }
                this.emit('message', response)
            }
        }
    }
}
