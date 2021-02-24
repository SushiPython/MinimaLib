import {EventEmitter} from 'events';
import * as WebSocket from 'ws'
import axios from 'axios';
export {Bot}

export interface User {
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
    author: User
    time: string, 
    guildId: string
    messageId: string
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
                console.error(error)
        }
    }
    async getUser(id: string): Promise<User> {
        try {
            const resp = await axios.get("https://discord.com/api/v8/users/"+id, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': 'Bot ' + this.token
                }
            });
    
            let json = resp.data
            let outUser: User = {
                avatarID: json.avatar,
                tag: json.discriminator,
                userId: json.id,
                username: json.username
            } 
            return outUser
        } catch (error) {
            console.error(error);
        }
    }
    async getMessage(messageid: string, channelid: string): Promise<Message> {
        try {
            const resp = await axios.get(`https://discord.com/api/v8//channels/${channelid}/messages/${messageid}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': 'Bot ' + this.token
                }
            });
    
            let json = resp.data
            let author: User = await this.getUser(json.author.id)
            let outMessage: Message = {
                messageId: json.id,
                author: author,
                channelId: channelid,
                content: json.content,
                guildId: json.guild_id,
                time: json.timestamp
            } 
            return outMessage
        } catch (error) {
            console.error(error);
        }
    }
    async getGuild(id: string): Promise<Guild> {
        try {
            const resp = await axios.get("https://discord.com/api/v8/guilds/"+id, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': 'Bot ' + this.token
                }
            });
    
            let json = resp.data
            let outGuild: Guild = {
                guildId: id,
                icon: json.icon,
                name: json.name,
                ownerId: json.owner_id,
                region: json.region,
                roles: json.roles,
                splash: json.splash
            } 
            return outGuild
        } catch (error) {
            console.error(error);
        }
    }
    async login() {
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
        await this.ws.send(JSON.stringify(payload)); 
    }

    async sendMessage(c: SendMessageConfig) {
        try {
            let resp = await axios({
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
            let out = resp.data
            let messageAuthor: User = {
                userId: out.author.id,
                username: out.author.username,
                tag: out.author.discriminator,
                avatarID: out.author.avatar
            }
            let response: Message = {
                messageId: out.id,
                channelId: out.channel_id,
                content: out.content,
                author: messageAuthor,
                time: out.timestamp,
                guildId: out.guild_id
            }
            return response
        } catch (error) {
            console.error(error);
        }
    }
    

    async sendEmbed(c: SendEmbedConfig) {
        try {
            await axios({
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
        } catch (error) {
            console.error(error)
        }
    }
    async deleteMessage(message: Message) {
        try {
            await axios({
                method: "delete",
                url: `https://discord.com/api/v8/channels/${message.channelId}/messages/${message.messageId}`,
                headers: {
                    'authorization': 'Bot ' + this.token
                }
            })
        } catch (error) {
            console.log(error)
        }
    }
    async editMessage(message: Message, c: SendMessageConfig) {
        try {
            await axios({
                method: "patch",
                url: `https://discord.com/api/v8/channels/${message.channelId}/messages/${message.messageId}`,
                headers: {
                    'authorization': 'Bot ' + this.token
                },
                data: {
                    "content": c.content,
                    "tts": false,
                }
            })
        } catch (error) {
            console.log(error)
        }
    }
    async onmsg(msg) {
        let json = msg.data; 
        json = JSON.parse(json);
        if (json.op == 10) {
            await this.login();
            await this.emit('connect', json)
        } else if (json.op == 0) { 
            if (json.t == "MESSAGE_CREATE") {
                let out = json.d
                let messageAuthor: User = {
                    userId: out.author.id,
                    username: out.author.username,
                    tag: out.author.discriminator,
                    avatarID: out.author.avatar
                }
                let response: Message = {
                    messageId: out.id,
                    channelId: out.channel_id,
                    content: out.content,
                    author: messageAuthor,
                    time: out.timestamp,
                    guildId: out.guild_id
                }
                await this.emit('message', response)
                await this.emit(out.content.split(' ')[0], response)
            }
        }
    }
}
