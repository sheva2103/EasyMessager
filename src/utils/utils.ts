import { collection, CollectionReference } from "firebase/firestore"
import { Chat, CheckMessageType, CurrentUser, Message1, NoReadMessagesType, OnlineStatusUserType, Reaction, TypeChannel, UsersData } from "../types/types"
import { format } from "@formkit/tempo"
import { db } from "../firebase"
import { searchAPI } from "../API/api";
import { CHANNELS, CHATS, FAVOTITES } from "../constants/constants";
import { TranslationKeys } from "../types/locales";
import { i18n } from "i18next";
import { v4 as uuidv4 } from 'uuid';


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


function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function checkMessage(str: string): CheckMessageType {
    const reg = /(https?:\/\/|ftps?:\/\/|www\.)((?![.,?!;:()]*(\s|$))[^\s]){2,}/im;
    const imageExtReg = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i;
    const youtubeRegex =
        /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})(?:\S+)?/i;

    const imgUrls: string[] = [];
    const YTUrls: string[] = [];
    let hasLink = false;

    const lines = str.split('\n');

    const processedLines = lines.map((line) => {
        const words = line.split(/\s+/);
        const processedWords = words.map((item) => {
            const escaped = escapeHtml(item);

            if (reg.test(item)) {
                hasLink = true;
                const isYTlink = item.match(youtubeRegex);
                if (isYTlink && isYTlink[1]) {
                    const videoId = isYTlink[1];
                    const YTUrl = `https://www.youtube.com/embed/${videoId}`;
                    YTUrls.push(YTUrl);
                }

                if (
                    imageExtReg.test(item) &&
                    YTUrls.indexOf(`https://www.youtube.com/embed/${item.match(youtubeRegex)?.[1]}`) === -1
                ) {
                    imgUrls.push(item);
                }

                const url = item.startsWith('www.') ? `http://${item}` : item;
                return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escaped}</a>`;
            }

            return escaped;
        });

        return processedWords.join(' ');
    });

    const finalMessage = processedLines.join('<br />');

    return { message: finalMessage, imgUrls, YTUrls, hasLink };
}




export function getQuantityNoReadMessages(messages: Message1[], currentId: string): NoReadMessagesType {
    let quantity = 0;
    let targetIndex = -1;

    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const isUnread = msg.read === false;
        const isFromOtherUser = msg.sender.uid !== currentId;

        if (isUnread && isFromOtherUser) {
            quantity++;
            if (targetIndex === -1) {
                targetIndex = i;
            }
        }
    }

    if (quantity === 0) {
        targetIndex = messages.length > 0 ? messages.length - 1 : -1;
    }

    return { targetIndex, quantity };
}

export function searchMessagesInList(array: Message1[], substring: string): Set<number> {
    const lowerSubstring = substring.toLowerCase();

    return array.reduce((indicesSet, item, index) => {
        if (item.message.toLowerCase().includes(lowerSubstring)) {
            indicesSet.add(index);
        }
        return indicesSet;
    }, new Set<number>());
}

export function getChatType(isFavorites: boolean, selectedChat: Chat | null): CollectionReference {

    if (isFavorites) return collection(db, selectedChat.email, FAVOTITES, 'message')
    if (selectedChat?.channel) return collection(db, CHANNELS, selectedChat.channel.channelID, 'messages')
    return collection(db, CHATS, selectedChat.chatID, 'messages')
}

export function makeChatId(users: UsersData) {
    return [users.currentUser.uid, users.guestInfo.uid].sort().join('_');
}

export function getFakeChat(id: string): Chat {
    return ({
        displayName: '',
        uid: '',
        email: '',
        chatID: id
    })
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
        dateOfChange: chat.dateOfChange,
        channel: chat
    })
}

export function createOnlineStatusUser(date: number): OnlineStatusUserType {
    const currentDate = Date.now()
    const isOnline = currentDate - date < 60000 ? true : false
    return ({ isOnline, last_seen: date })
}

type Position = { top: number; left: number };

export function getContextMenuPosition(options: { clickX: number, clickY: number, menuWidth: number, menuHeight: number }): Position {

    const { clickX, clickY, menuWidth, menuHeight } = options
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let left: number;
    let top: number;

    if (clickX + menuWidth <= screenWidth) {
        left = clickX
    } else {
        left = clickX - menuWidth
        if (left < 0) left = screenWidth - menuWidth
    }

    if (clickY + menuHeight <= screenHeight) {
        top = clickY
    } else {
        top = clickY - menuHeight
        if (top < 0) top = screenHeight - menuHeight
    }

    return { top, left };
}

type AggregatedReaction = {
    reaction: string;
    count: number;
    users: CurrentUser[];
    isMine: boolean;
}


export function aggregateReactions(reactions: Reaction[], currentUser: CurrentUser): AggregatedReaction[] {
    const reactionMap = new Map<string, AggregatedReaction>();

    if (!reactions) return []

    for (const { reaction, sender } of reactions) {
        const isMine = sender.uid === currentUser.uid;

        if (!reactionMap.has(reaction)) {
            reactionMap.set(reaction, {
                reaction,
                count: 1,
                users: [sender],
                isMine,
            });
        } else {
            const entry = reactionMap.get(reaction)!;
            entry.count += 1;
            entry.users.push(sender);
            if (isMine) entry.isMine = true;
        }
    }

    return Array.from(reactionMap.values());
}

export const formatStyle = (timestamp: number, t: (key: TranslationKeys, options?: Record<string, unknown>) => string, i18n: i18n): string => {

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

export function truncateText(text: string, maxLength: number = 25): string {
    return text.length > maxLength
        ? text.slice(0, maxLength) + '...'
        : text;
}

export function createObjectUser(user: Chat) {
    return ({
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid,
        email: user.email
    })
}

export function insertPipeBetweenLinks(str: string): string {
    const urlPattern = '(https?:\\/\\/[^\\s]+)';


    const gluedRegex = new RegExp(urlPattern + '(?=' + urlPattern + ')', 'g');
    str = str.replace(gluedRegex, '$1 | ');


    const spacedRegex = new RegExp(urlPattern + '(\\s+)(?=' + urlPattern + ')', 'g');
    str = str.replace(spacedRegex, '$1 | ');

    return str;
}

export function createShareChatObj (options : {sender: CurrentUser, shareChat: Chat}): Message1 {
    const messageID = uuidv4()
    const date = JSON.stringify(new Date())
    const {sender, shareChat} = options
    const message: Message1 = {
        shareChat: {
            displayName: shareChat.displayName,
            email: shareChat.email,
            uid: shareChat.uid,
            photoURL: shareChat.photoURL || ""
        },
        message: 'Контакт',
        messageID, 
        date, 
        sender
    }
    if(shareChat?.channel) message.shareChat.channel = shareChat?.channel
    return message
}

