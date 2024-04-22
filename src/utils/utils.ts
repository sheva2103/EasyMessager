import { Chat, Message1 } from "../types/types"
import { format } from "@formkit/tempo"


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
    
    // const date = now.toLocaleDateString()
    // const hours = now.getHours();
    // const minutes = now.getMinutes();
    // const seconds = now.getSeconds();
    // const time = `${hours}:${minutes}:${seconds}`
    const date = format(now, { date: "short" })
    const time = format(now, { time: "medium" })
    return `${date} ${time}`
}

export function getTimeFromDate(date: string): string {
    return date.split(' ')[1].split(':').slice(0,2).join(':')
}

export function getDatefromDate(date: string): string {
    return date.split(' ')[0]
}

export function checkMessage(str: string): string {

    const reg = /(https?:\/\/|ftps?:\/\/|www\.)((?![.,?!;:()]*(\s|$))[^\s]){2,}/gim

    if (!reg.test(str)) return str

    const message = str.split(' ')
    let newStr = message.map(item => {
        if (reg.test(item)) return `<a href='${item}' target='blank'>${item}</a>`
        return item
    })
    return newStr.join(' ')
}