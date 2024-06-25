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
        const dateOneToSecond = Date.parse(String(new Date(JSON.parse(a.date))))
        const dateTwoToSecond = Date.parse(String(new Date(JSON.parse(b.date))))

        if (dateOneToSecond < dateTwoToSecond) return -1
        else if (dateOneToSecond > dateTwoToSecond) return 1
        else return 0
    })
    return sort
}


export function createLimitMessagesList(list: Message1[]): Message1[] {

    let targetIndex = list.findIndex(item => item.read === false)
    if(targetIndex > 0) {
        //console.log(targetIndex, '>>>', list.slice(targetIndex - 20, targetIndex + 21))
        return list.slice(targetIndex - 20, targetIndex + 21)
    }
    return list.slice(list.length - 40, list.length + 1)
}


// export function checkStartIndex(list: Message1[]): number {
//     console.log('checkStartIndex>>>', list)
//     const index = list.findIndex(item => item.read === false)
//     if (index === -1) return 0
//     return index
// }


export function scrollToElement(element: HTMLDivElement, list: Message1[], currentUserID: string, firstRender: boolean) {

    let targetID = list[list.length - 1].messageID
    if(firstRender) {
        for(let i = 0; i < list.length; i++) {
            if(list[i].sender.uid !== currentUserID && i && list[i + 1]?.read === false ) {
                targetID = list[i].messageID
                break
            }
        }
    }

    if (element) {
        const targetElement = element.querySelector(`label[data-id="${targetID}"]`)
        targetElement.scrollIntoView({ block: 'end' ,behavior: firstRender ? 'auto' : 'smooth' })
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