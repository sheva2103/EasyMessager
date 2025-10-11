import { doc, DocumentReference } from "firebase/firestore"
import { Chat, CheckMessageType, ListMessagesType, Message1, NoReadMessagesType, OnlineStatusUserType, size, TypeChannel } from "../types/types"
import { format } from "@formkit/tempo"
import { db } from "../firebase"
import { searchAPI } from "../API/api";
import { CHANNELS, CHANNELS_INFO, CHATS, FAVOTITES, USERS } from "../constants/constants";
import { useTypedTranslation } from "../hooks/useTypedTranslation";
import { TranslationKeys } from "../types/locales";
import { i18n } from "i18next";


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





// export function checkMessage(str: string): string {
//     const reg = /(https?:\/\/|ftps?:\/\/|www\.)((?![.,?!;:()]*(\s|$))[^\s]){2,}/gim
//     if (!reg.test(str)) return str
//     const message = str.split(' ')
//     let newStr = message.map(item => {
//         if (reg.test(item)) return `<a href='${item}' target='blank'>${item}</a>`
//         return item
//     })
//     return newStr.join(' ')
// }

export function checkMessage(str: string): CheckMessageType {
    const reg = /(https?:\/\/|ftps?:\/\/|www\.)((?![.,?!;:()]*(\s|$))[^\s]){2,}/gim;
    const imageExtReg = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i;
    let imgUrl = null
    const message = str.split(' ');
    const newStr = message.map((item) => {
        if (reg.test(item)) {
            if (imageExtReg.test(item)) imgUrl = item
            const url = item.startsWith('www.') ? `http://${item}` : item;
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${item}</a>`;
        }
        return item
    });
    return ({ message: newStr.join(' '), imgUrl })
    //return newStr.join(' ')
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
    if (list.length && list[list.length - 1].sender.uid !== currentId) {
        for (let i = list.length - 1; i >= 0; i--) {
            if (!list[i].read && list[i].sender.uid !== currentId) {
                quantity++
                targetIndex = i
            }
        }
    }
    if(list[list.length - 1].sender.uid === currentId) targetIndex = list.length 
    return { quantity, targetIndex }
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

export function getChatType(isFavorites: boolean, selectedChat: Chat | null): DocumentReference {

    if (isFavorites) return doc(db, selectedChat.email, FAVOTITES)
    if (selectedChat?.channel) return doc(db, CHANNELS, selectedChat.channel.channelID)
    return doc(db, CHATS, selectedChat.chatID)
}


export async function globalSearch(name: string, currentUserID: string) {

    const response = await Promise.all([searchAPI.searchUser(name), searchAPI.searchChannel(name)])
    const chats: Chat[] = response[0].filter(item => item.uid !== currentUserID)
    const channel: TypeChannel[] = response[1]
    const channelToChat: Chat[] = channel.map(item => ({ uid: item.channelID, displayName: item.displayName, email: item.owner.email, channel: item, chatID: item.channelID }))
    return [...chats, ...channelToChat].sort((a, b) => String(a.displayName).localeCompare(String(b.displayName)))
}

export function createObjectChannel(chat: TypeChannel): Chat {
    return ({
        displayName: chat.displayName,
        email: chat.owner.email,
        chatID: chat.channelID,
        uid: chat.channelID,
        channel: chat
    })
}

export function createOnlineStatusUser(date: number): OnlineStatusUserType {
    const currentDate = Date.now()
    const isOnline = currentDate - date < 60000 ? true : false
    return ({ isOnline, last_seen: date })
}


// export const formatStyle = (timestamp: number): string => {
//     const now = Date.now();
//     const diff = now - timestamp;

//     const seconds = Math.floor(diff / 1000);
//     const minutes = Math.floor(diff / 60000);
//     const hours = Math.floor(diff / 3600000);
//     const days = Math.floor(diff / 86400000);

//     if (seconds < 60) return "только что";
//     if (minutes < 60) return `${minutes} ${pluralize(minutes, "минуту", "минуты", "минут")} назад`;
//     if (hours < 24) return `${hours} ${pluralize(hours, "час", "часа", "часов")} назад`;
//     if (days === 1) return "вчера";
//     if (days < 7) return `${days} ${pluralize(days, "день", "дня", "дней")} назад`;

//     const date = new Date(timestamp);
//     return `${date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`;
// };

export const formatStyle = (timestamp: number, t: (key: TranslationKeys, options?: Record<string, unknown>) => string, i18n: i18n): string => {
    //const {t, i18n} = useTypedTranslation()

    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (seconds < 60) return t("time.justNow");
    if (minutes < 60)
        return t("time.minutesAgo", {
            count: minutes,
        });
    if (hours < 24)
        return t("time.hoursAgo", {
            count: hours,
        });
    if (days === 1) return t("time.yesterday");
    if (days < 7)
        return t("time.daysAgo", {
            count: days,
        });

    const date = new Date(timestamp);
    return date.toLocaleDateString(i18n.language, {
        day: "numeric",
        month: "long",
    });
};


const pluralize = (count: number, one: string, few: string, many: string): string => {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return few;
    return many;
};

