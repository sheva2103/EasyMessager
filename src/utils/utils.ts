import { Chat, ListMessagesType, Message1, size } from "../types/types"
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

export function searchNoReadMessage(list: Message1[], id: string): number {

    const targetIndex = list.findIndex(item => {
        if (item.sender.uid !== id) item.read === false
    })
    console.log('targetIndex>>>', targetIndex)
    if (targetIndex > 0) return targetIndex
    return list.length - 1
    //return targetIndex || list.length - 1
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

export function calculateHeightMessage(list: Message1[], size: size): number[] {
    console.log('пересчёт', size)
    return [...list]
        .map((item, index) => {
            const canvas: HTMLCanvasElement = document.querySelector('#canvas')
            const context = canvas.getContext('2d')
            context.font = '17.6px Roboto'
            const text = item.message
            const textWidth = context.measureText(text).width
            //console.log(`Длина текста = ${textWidth}`)

            const paddingMessage = 44
            //const widthUl = size.clientWidth >= 568 ? (size.clientWidth * 70 / 100) - paddingMessage : size.clientWidth - paddingMessage
            const widthUl = size.clientWidth >= 568 ? size.clientWidth - paddingMessage - 40 : size.clientWidth - paddingMessage
            let pixels = 0
            const heightDate = 33
            const forwardedFromHeight = 30
            const statusHeight = 28
            const fontSize = 17.6

            const lineHeight = 21
            const pixelLength = Number(textWidth)

            if (item.forwardedFrom) pixels += forwardedFromHeight
            if (index !== 0 && getDatefromDate(createNewDate(list[index].date)) !== getDatefromDate(createNewDate(list[index - 1].date))) pixels += heightDate
            if (index === 0) pixels += heightDate
            //console.log('количество строк >>>>', Math.ceil(Math.ceil(Number(textWidth)) / widthUl), widthUl, size.clientWidth, Number(textWidth))
            if ((widthUl - 4) >= (pixelLength + paddingMessage)) return statusHeight + 8 + pixels + lineHeight

            return (lineHeight * Math.ceil(Math.ceil(Number(textWidth)) / widthUl)) + pixels + statusHeight + 10  // не правильно чситается количество рядков

        })
}

export function createListLimitMessages(messages: ListMessagesType): ListMessagesType {
    
    if(messages.limit.length === 0) return
    const lastIndex = messages.all.findIndex(item => item.messageID === messages.limit[messages.limit.length - 1].messageID)
    const newLimit = messages.all.slice(lastIndex + 1, lastIndex + 10)
    const del = messages.limit.slice(newLimit.length, messages.limit.length + 1)
    console.log('new limit del', del)
    return {all: messages.all, limit: [].concat(del).concat(newLimit)}

}
