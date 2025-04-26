import { doc, DocumentReference } from "firebase/firestore"
import { Chat, ListMessagesType, Message1, NoReadMessagesType, size } from "../types/types"
import { format } from "@formkit/tempo"
import { db } from "../firebase"


export function createChatList(data: Chat[]) {
    const chatsArray: Chat[] = [];
    let key: keyof typeof data;

    for (key in data) {
        chatsArray.push(data[key]);
    }

    return chatsArray.sort((a, b) => {
        const dateOneToSecond = a.dateOfChange 
            ? Date.parse(a.dateOfChange.replace(/"/g, "")) 
            : 0
        const dateTwoToSecond = b.dateOfChange 
            ? Date.parse(b.dateOfChange.replace(/"/g, "")) 
            : 0

        if (dateOneToSecond < dateTwoToSecond) return 1;
        else if (dateOneToSecond > dateTwoToSecond) return -1;
        else return 0;
    });
}




export function createMessageList(list: Message1[]) {
    const messagesArray: Message1[] = []
    let key: keyof typeof list
    for (key in list) {
        messagesArray.push(list[key])
    }
    const sort = messagesArray.sort((a, b) => {
        const dateOneToSecond = Date.parse(String(new Date(JSON.parse(a.date))))
        const dateTwoToSecond = Date.parse(String(new Date(JSON.parse(b.date))))

        if (dateOneToSecond < dateTwoToSecond) return -1
        else if (dateOneToSecond > dateTwoToSecond) return 1
        else return 0
    })
    return sort
}


export function createLimitMessagesList(list: ListMessagesType): Message1[] {

    

    if (list.limit.length) {
        const startIndex = list.all.findIndex(item => item.messageID === list.limit[0].messageID)
        const lastIndex = list.all.findIndex(item => item.messageID === list.limit[list.limit.length - 1].messageID)
        const newLimit = list.all.slice(startIndex, lastIndex + 1)
        console.log('newlimit', newLimit)
        if (newLimit.length < 49) return list.all
        return newLimit
    }
    console.log(list, '>>>>>>>>>>>')
    return list.limit
}


// export function checkStartIndex(list: Message1[]): number {
//     console.log('checkStartIndex>>>', list)
//     const index = list.findIndex(item => item.read === false)
//     if (index === -1) return 0
//     return index
// }


export function scrollToElement(element: HTMLDivElement, list: Message1[], currentUserID: string, firstRender: boolean) {

    let targetID = list[list.length - 1].messageID
    if (firstRender) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].sender.uid !== currentUserID && i && list[i + 1]?.read === false) {
                targetID = list[i].messageID
                break
            }
        }
    }

    if (element) {
        const targetElement = element.querySelector(`label[data-id="${targetID}"]`)
        targetElement.scrollIntoView({ block: 'end', behavior: firstRender ? 'auto' : 'smooth' })
    }
}


export function createNewDate(now: string): string {
    //const now = new Date()
    // const date = now.toLocaleDateString()
    // const hours = now.getHours();
    // const minutes = now.getMinutes();
    // const seconds = now.getSeconds();
    // const time = `${hours}:${minutes}:${seconds}`
    const date = format(JSON.parse(now), { date: "short" })
    const time = format(JSON.parse(now), { time: "medium" })
    return `${date} ${time}`
}





export function getTimeFromDate(date: string): string {
    return date.split(' ')[1].split(':').slice(0, 2).join(':')
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

export function createListLimitMessages(messages: ListMessagesType): ListMessagesType {
    
    if (messages.limit.length === 0) return { all: messages.all, limit: [] }

    const lastIndex = messages.all.findIndex(item => item.messageID === messages.limit[messages.limit.length - 1].messageID)
    const newLimit = messages.all.slice(lastIndex + 1, Math.min(lastIndex + 49, messages.all.length))
    return { all: messages.all, limit: [].concat(messages.limit).concat(newLimit).slice(-100) }
}

export function getQuantityNoReadMessages(list: Message1[], currentId: string): NoReadMessagesType {

    let quantity = 0
    let targetIndex = list.length - 1
    if(list.length && list[list.length - 1].sender.uid !== currentId) {
        for (let i = list.length - 1; i >= 0; i--) {
            if(!list[i].read && list[i].sender.uid !== currentId) {               
                    quantity++
                    targetIndex = i
            }
        }
    }
    return {quantity, targetIndex}
}

// export function searchMessagesInList(list: Message1[], text: string) {
//     return [...list].filter(item => item.message.includes(text))
// }

export function searchMessagesInList(array: Message1[], substring: string): Set<number> {
    return array.reduce((indicesSet, str, index) => {
        if (str.message.includes(substring)) {
            indicesSet.add(index);
        }
        return indicesSet
    }, new Set<number>());
}

export function getChatType(isFavorites: boolean, selectedChat: Chat): DocumentReference {

    if(isFavorites) return doc(db, selectedChat.email, 'favorites')
    return doc(db, "chats", selectedChat.chatID)
}

