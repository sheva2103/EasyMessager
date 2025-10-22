import { DocumentData, QueryDocumentSnapshot, QuerySnapshot, deleteDoc, deleteField, doc, getDoc, setDoc, updateDoc, increment, arrayRemove, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import { UserInfo } from "firebase/auth";
import { CallMessageOptionsType, Chat, CurrentUser, Message1, SenderMessageType, TypeChannel, TypeCreateChannel } from "../types/types";
import { collection, getDocs, query, where } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { createChatList, createMessageList, createNewDate, createObjectChannel, getChatType } from "../utils/utils";
import { ADD_TO_LIST_SUBSCRIBERS, BLACKLIST, CHANNELS, CHANNELS_INFO, CHATLIST, CHATS, CONTACTS, FAVOTITES, REMOVE_FROM_LIST_SUBSCRIBERS, USERS } from "../constants/constants";


type ProfileApi = {
    createNewUserInDB: (e: UserInfo) => void,
    changeUserInfo: (data: CurrentUser) => void,
    getCurrentInfo: (uid: string) => Promise<CurrentUser | null>,
    //changeVisitingTime: (id: string) => Promise<void>
}

type SearchAPI = {
    searchUser: (name: string) => Promise<CurrentUser[]>,
    searchChannel: (name: string) => Promise<TypeChannel[]>
}



type MessagesAPI = {
    addChat: (user: CurrentUser, recipient: Chat, chatID?: string) => Promise<void>,
    sendMessage: (chat: Chat, sender: CurrentUser, message: string, isFavorites: boolean, replyToMessage?: Message1) => Promise<void>,
    getChatID: (name: string, searchName: string) => Promise<string | undefined>,
    sendEditMessage: (chat: Chat, message: Message1, isFavorites: boolean) => Promise<void>,
    deleteMessage: (chat: Chat, message: Message1, isFavorites: boolean) => Promise<void>,
    forwardedMessageFrom: (sender: CurrentUser, recipient: Chat, message: Message1) => Promise<void>,
    readMessage: (chatID: string, message: Message1) => Promise<void>,
    clearChat: (chat: Chat, isFavorites: boolean) => Promise<void[]>,
    deleteChat: (currentUser: CurrentUser, selectedChat: Chat) => Promise<void>,
    addToFavorites: (currentUser: string, message: Message1) => Promise<void>,
    sendCallInfoMessage: (options: CallMessageOptionsType) => Promise<void>,
}

type ContactsAPI = {
    addToContacts: (currentUser: string, newContact: Chat) => Promise<void>,
    removeFromContacts: (currentUser: string, contact: CurrentUser) => Promise<void>,
    addToBlacklist: (currentUser: string, contact: Chat) => Promise<void>,
    removeFromBlacklist: (currentUser: string, contact: CurrentUser) => Promise<void>
}


// const USERS = "users"
// const CHATLIST = "chatList"
// const CHATS = "chats"
// const FAVOTITES = "favorites"
// const BLACKLIST = "blacklist"
// const CONTACTS = "contacts"
// const CHANNELS = "channels"
// const ADD_TO_LIST_SUBSCRIBERS = 'ADD_TO_LIST_SUBSCRIBERS'
// const REMOVE_FROM_LIST_SUBSCRIBERS = 'REMOVE_FROM_LIST_SUBSCRIBERS'
// export const CHANNELS_INFO = "channelsInfo"


export const profileAPI: ProfileApi = {

    async createNewUserInDB(user) {
        await setDoc(doc(db, USERS, user.uid), {
            email: user.email,
            displayName: user.email.slice(0, user.email.indexOf('@')),
            uid: user.uid,
            registrationDate: new Date().toLocaleDateString()
        });
    },
    async changeUserInfo(data) {
        const userRef = doc(db, USERS, data.uid);
        await updateDoc(userRef, {
            photoURL: data.photoURL,
            displayName: data.displayName
        });
    },
    async getCurrentInfo(uid) {
        const userRef = doc(db, USERS, uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            const info: any = docSnap.data()
            return info
        } else {
            return null
        }
    },
    // async changeVisitingTime(id) {
    //     const userRef = doc(db, USERS, id);
    //     const date = new Date()
    //     await updateDoc(userRef, {
    //         visitingTime: JSON.stringify(date)
    //     });
    // }
}




export const searchAPI: SearchAPI = {
    async searchUser(name) {
        const chats: CurrentUser[] = []
        const q = query(collection(db, USERS));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc: QueryDocumentSnapshot<CurrentUser>) => {
            const displayName = doc.data().displayName.toLowerCase()
            if (displayName.includes(name.toLowerCase())) chats.push(doc.data())
        });
        return chats
    },
    async searchChannel(name) {
        const channels: TypeChannel[] = []
        const querySnapshot = await getDocs(collection(db, CHANNELS_INFO));
        querySnapshot.forEach((doc: QueryDocumentSnapshot<TypeChannel>) => {
            const displayName = doc.data().displayName.toLowerCase()
            if (displayName.includes(name.toLowerCase())) channels.push(doc.data())

        });
        return channels
    }
}




export const messagesAPI: MessagesAPI = {

    async addChat(user, recipient, chatID) {
        const dateOfChange = JSON.stringify(new Date())
        const chat: Chat = { chatID, displayName: recipient.displayName, email: recipient.email, uid: recipient.uid, dateOfChange }
        if (recipient?.channel) {
            chat.channel = { owner: recipient.channel.owner, channelID: recipient.channel.channelID, displayName: recipient.channel.displayName, isOpen: recipient.channel.isOpen }
            chat.chatID = recipient.channel.channelID
        }
        await setDoc(doc(db, user.email, CHATLIST), { [recipient.uid]: chat }, { merge: true });
        if (recipient?.channel) {
            //await channelAPI.changeSubscribers(chat.chatID, 1)
            await channelAPI.changeListSubscribers(ADD_TO_LIST_SUBSCRIBERS, chat.chatID, user)

        }
    },
    async sendMessage(chat, sender, message, isFavorites, replyToMessage) {
        const date = JSON.stringify(new Date())
        const reference = getChatType(isFavorites, chat)
        console.log('send message')
        const id = uuidv4()
        const messageObj: Message1 = { message: message, messageID: id, date: date, sender: { ...sender } }
        if (!isFavorites && !chat?.channel) messageObj.read = false
        if (chat?.channel) messageObj.sender.channel = chat.channel
        if (replyToMessage) messageObj.replyToMessage = replyToMessage

        return await setDoc(reference, { [id]: messageObj }, { merge: true });
    },
    async getChatID(name, searchName) {
        let id = undefined
        const docRef = doc(db, name, CHATLIST);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data: any = docSnap.data()
            createChatList(data).forEach(item => {
                if (item.email === searchName) id = item.chatID
            })
        }
        return id
    },
    async sendEditMessage(chat, message, isFavorites) {
        const messageRef = getChatType(isFavorites, chat)
        const date = JSON.stringify(new Date())
        const editMessage = { ...message, message: message.message, changed: date }
        await updateDoc(messageRef, {
            [message.messageID]: editMessage
        });
    },
    async deleteMessage(chat, message, isFavorites) {
        const messageRef = getChatType(isFavorites, chat)

        await updateDoc(messageRef, {
            [message.messageID]: deleteField()
        });
    },

    async forwardedMessageFrom(sender, recipient, message) {
        const id = uuidv4()
        const date = JSON.stringify(new Date())
        // const forwardedFrom = message.forwardedFrom?.channel ?  createObjectChannel(message.forwardedFrom?.channel) : message.sender
        const forwardedFrom = message.forwardedFrom?.channel ?
            createObjectChannel(message.forwardedFrom?.channel) 
            :
            message.sender?.channel ?
                createObjectChannel(message.sender.channel)
                :
                message.sender
        const messageObj: Message1 = { message: message.message, messageID: id, date, read: false, sender, forwardedFrom }
        const isID = await Promise.all([messagesAPI.getChatID(sender.email, recipient.email), messagesAPI.getChatID(recipient.email, sender.email)])
        if (isID[0] || isID[1]) {
            const currentID = isID[0] || isID[1]
            await setDoc(doc(db, CHATS, currentID), { [id]: messageObj }, { merge: true });
            await Promise.all([messagesAPI.addChat(sender, recipient, currentID), messagesAPI.addChat(recipient, sender, currentID)])
        }
        else {
            await Promise.all([messagesAPI.addChat(sender, recipient, id), messagesAPI.addChat(recipient, sender, id)])
            await setDoc(doc(db, CHATS, id), { [id]: messageObj }, { merge: true });
        }
    },

    async readMessage(chatID, message) {
        const messageRef = doc(db, CHATS, chatID);

        const editMessage = { ...message, read: true }
        await updateDoc(messageRef, {
            [message.messageID]: editMessage
        });
    },
    async clearChat(chat, isFavorites) {
        const docRef = getChatType(isFavorites, chat)
        const docSnap = await getDoc(docRef)
        const promises: Promise<void>[] = []
        const list: any = docSnap.data()
        createMessageList(list).forEach(message => {
            promises.push(messagesAPI.deleteMessage(chat, message, isFavorites))
        })
        return Promise.all(promises)
    },
    async deleteChat(currentUser, selectedChat) {
        const chatCurrentRef = doc(db, currentUser.email, CHATLIST);
        const chatGuestRef = doc(db, selectedChat.email, CHATLIST);
        const chatGuestSnap: any = await getDoc(chatGuestRef);

        await updateDoc(chatCurrentRef, {
            [selectedChat.uid]: deleteField()
        });
        if (!selectedChat?.channel && chatGuestSnap.exists() && !createChatList(chatGuestSnap.data()).some(item => item.chatID === selectedChat.chatID)) {
            await deleteDoc(doc(db, CHATS, selectedChat.chatID));
        }
        if (selectedChat?.channel) {
            //await channelAPI.changeSubscribers(selectedChat.channel.channelID, -1)
            await channelAPI.changeListSubscribers(REMOVE_FROM_LIST_SUBSCRIBERS, selectedChat.channel.channelID, currentUser)
        }
    },
    async addToFavorites(currentUser, message) {
        const date = JSON.stringify(new Date())
        let modMessage = { ...message }
        delete modMessage.read
        await setDoc(doc(db, currentUser, FAVOTITES), { [message.messageID]: { ...modMessage, date, forwardedFrom: message.sender, } }, { merge: true });
    },
    async sendCallInfoMessage(options) {
        const date = JSON.stringify(new Date())
        const reference = getChatType(false, options.callee)
        const messageID = uuidv4()
        const isRead = options?.callDuration !== '0:00'
        const messageObj: Message1 = { message: options.callDuration, messageID, date, sender: { ...options.caller }, read: isRead, callStatus: options.status }
        await setDoc(reference, { [messageID]: messageObj }, { merge: true });

        await messagesAPI.addChat(options.caller, options.callee, options.callee.chatID)
        await messagesAPI.addChat(options.callee, options.caller, options.callee.chatID)
    }
}




export const contactsAPI: ContactsAPI = {
    async addToContacts(currentUser, newContact) {
        await setDoc(doc(db, currentUser, CONTACTS), { [newContact.uid]: newContact }, { merge: true });
    },
    async removeFromContacts(currentUser, contact) {
        const contactsRef = doc(db, currentUser, CONTACTS);

        await updateDoc(contactsRef, {
            [contact.uid]: deleteField()
        });
    },
    async addToBlacklist(currentUser, contact) {
        await setDoc(doc(db, currentUser, BLACKLIST), { [contact.uid]: contact }, { merge: true });
    },
    async removeFromBlacklist(currentUser, contact) {
        const contactsRef = doc(db, currentUser, BLACKLIST);

        await updateDoc(contactsRef, {
            [contact.uid]: deleteField()
        });
    }
}

type ChannelAPI = {
    createChannel(owner: CurrentUser, data: TypeCreateChannel): Promise<TypeChannel>,
    checkName(name: string): Promise<boolean>,
    getCurrentInfo: (uid: string) => Promise<TypeChannel | null>,
    //changeSubscribers: (channelId: string, value: number) => Promise<void>,
    changeListSubscribers: (typeChange: string, channelId: string, user: CurrentUser) => Promise<void>,
    changeCannelInfo: (channel: TypeChannel, updateDateOfChange?: boolean) => Promise<void>,
    //addChannelToChatlist: (email: string, channel: TypeChannel) => Promise<void>,
    deleteChannel: (id: string) => Promise<[void, void]>,
    applyForMembership: (user: CurrentUser, channelID: string) => Promise<void>,
    getApplyForMembership: (channelID: string) => Promise<CurrentUser[]>,
    deleteApplication: (channelID: string, user: CurrentUser) => Promise<void>,
    changeAccessChannel: (channelID: string, action: boolean) => Promise<void>
}

export const channelAPI: ChannelAPI = {
    async createChannel(owner: CurrentUser, data: TypeCreateChannel) {
        const channelID = uuidv4()
        const info: TypeChannel = {
            owner,
            displayName: data.displayName,
            isOpen: data.isOpen,
            channelID,
            registrationDate: new Date().toLocaleDateString(),
            listOfSubscribers: []
        }
        await setDoc(doc(db, CHANNELS, channelID), {})
        await setDoc(doc(db, CHANNELS_INFO, channelID), info)
        await messagesAPI.addChat(owner, createObjectChannel(info))
        //Promise.all([chanel, chanelInfo])
        return info
    },
    async checkName(name: string) {
        const q = query(collection(db, CHANNELS_INFO), where("displayName", "==", name));
        const querySnapshot = await getDocs(q);
        const isFree = !Boolean(querySnapshot.size)
        return isFree
    },
    async getCurrentInfo(channelID) {
        const channelRef = doc(db, CHANNELS_INFO, channelID);
        const docSnap = await getDoc(channelRef);

        if (docSnap.exists()) {
            const info: TypeChannel = docSnap.data() as TypeChannel
            return info
        } else {
            return null
        }
    },
    // async changeSubscribers(channelId, value) {
    //     const ref = doc(db, CHANNELS_INFO, channelId);
    //     await updateDoc(ref, {
    //         subscribers: increment(value)
    //         // 1 || -1
    //     });
    // },
    async changeListSubscribers(typeChange, channelID, user) {
        const ref = doc(db, CHANNELS_INFO, channelID)

        if (typeChange === ADD_TO_LIST_SUBSCRIBERS) {
            await updateDoc(ref, {
                listOfSubscribers: arrayUnion(user)
            });
        }
        if (typeChange === REMOVE_FROM_LIST_SUBSCRIBERS) {
            await updateDoc(ref, {
                listOfSubscribers: arrayRemove(user)
            });
        }
    },
    async changeCannelInfo(channel, updateDateOfChange) {
        const channelRef = doc(db, CHANNELS_INFO, channel.channelID)
        const dateOfChange = JSON.stringify(new Date())
        const obj: any = {}
        if (updateDateOfChange) obj.dateOfChange = dateOfChange
        else {
            obj.photoURL = channel.photoURL
            obj.displayName = channel.displayName
        }

        await updateDoc(channelRef, obj);
    },
    async deleteChannel(id) {
        const infoChannelRef = doc(db, CHANNELS_INFO, id)
        const channelRef = doc(db, CHANNELS, id)
        return Promise.all([deleteDoc(infoChannelRef), deleteDoc(channelRef)])
    },
    async applyForMembership(user, channelID) {
        const ref = doc(db, CHANNELS_INFO, channelID)
        const list = await getDoc(ref);

        if (list.exists()) {
            const info: TypeChannel = list.data() as TypeChannel
            const targetUser = info.applyForMembership?.find(item => item.uid === user.uid)
            if(targetUser) return
            else {
                await updateDoc(ref, {
                    applyForMembership: arrayUnion(user)
                });
            }
        }
    },
    async getApplyForMembership(channelID) {
        const ref = doc(db, CHANNELS_INFO, channelID)
        const list = await getDoc(ref);
        if(list.exists()) {
            const info: TypeChannel = list.data() as TypeChannel
            return info.applyForMembership || []
        }
    },
    async deleteApplication(channelID, user) {
        const ref = doc(db, CHANNELS_INFO, channelID)
        await updateDoc(ref, {
                    applyForMembership: arrayRemove(user)
                });
    },
    async changeAccessChannel(channelID, action) {
        const ref = doc(db, CHANNELS_INFO, channelID)
        await updateDoc(ref, {
            isOpen: action
        })
    }
}