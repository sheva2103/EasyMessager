import { Chat, Message1 } from "../types/types"


export function createChatList(data: Chat[]) {
    const chatsArray: Chat[] = []
    let key: keyof typeof data
    for (key in data) {
        chatsArray.push(data[key])
    }
    return chatsArray
}

export function createMessageList(list: Message1[]) {
    const messagesArray: Message1[] = []
    let key: keyof typeof list
    for (key in list) {
        messagesArray.push(list[key])
    }
    const sort = messagesArray.sort((a, b) => {
        if(a.date < b.date) return -1
        else if(a.date > b.date) return 1
        else return 0
    })
    return sort
}

export function createNewDate(): string {
    const now = new Date()
    const date = now.toLocaleDateString()
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const time = `${hours}:${minutes}:${seconds}`
    return `${date} ${time}`
}