import { DocumentData, QueryDocumentSnapshot, QuerySnapshot, deleteDoc, deleteField, doc, getDoc, setDoc, updateDoc, increment, arrayRemove, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import { UserInfo } from "firebase/auth";
import { Chat, CurrentUser, Message1, TypeChannel, TypeCreateChannel } from "../types/types";
import { collection, getDocs, query, where } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { createChatList, createMessageList, createNewDate, getChatType } from "../utils/utils";


type ProfileApi = {
    createNewUserInDB: (e: UserInfo) => void,
    changeUserInfo: (data: CurrentUser) => void,
    getCurrentInfo: (uid: string) => Promise<CurrentUser | null>
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
    addToFavorites: (currentUser: string, message: Message1) => Promise<void>
}

type ContactsAPI = {
    addToContacts: (currentUser: string, newContact: Chat) => Promise<void>,
    removeFromContacts: (currentUser: string, contact: CurrentUser) => Promise<void>,
    addToBlacklist: (currentUser: string, contact: Chat) => Promise<void>,
    removeFromBlacklist: (currentUser: string, contact: CurrentUser) => Promise<void>
}



const USERS = "users"
const CHATLIST = "chatList"
const CHATS = "chats"
const FAVOTITES = "favorites"
const BLACKLIST = "blacklist"
const CONTACTS = "contacts"
const CHANNELS = "channels"
const ADD_TO_LIST_SUBSCRIBERS = 'ADD_TO_LIST_SUBSCRIBERS'
const REMOVE_FROM_LIST_SUBSCRIBERS = 'REMOVE_FROM_LIST_SUBSCRIBERS'
export const CHANNELS_INFO = "channelsInfo"

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
    }
}




export const searchAPI: SearchAPI = {
    async searchUser(name) {
        const chats: CurrentUser[] = []
        const q = query(collection(db, USERS));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc: QueryDocumentSnapshot<CurrentUser>) => {
            const displayName = doc.data().displayName
            if (displayName.includes(name)) chats.push(doc.data())
        });
        return chats
    },
    async searchChannel(name) {
        const channels: TypeChannel[] = []
        const querySnapshot = await getDocs(collection(db, CHANNELS_INFO));
        querySnapshot.forEach((doc: QueryDocumentSnapshot<TypeChannel>) => {
            const displayName = doc.data().displayName
            if (displayName.includes(name)) channels.push(doc.data())

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
            await channelAPI.changeSubscribers(chat.chatID, 1)
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
        const messageObj: Message1 = { message: message.message, messageID: id, date, read: false, sender, forwardedFrom: message.sender }
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
            await channelAPI.changeSubscribers(selectedChat.channel.channelID, -1)
            await channelAPI.changeListSubscribers(REMOVE_FROM_LIST_SUBSCRIBERS, selectedChat.channel.channelID, currentUser)
        }
    },
    async addToFavorites(currentUser, message) {
        const date = JSON.stringify(new Date())
        let modMessage = { ...message }
        delete modMessage.read
        await setDoc(doc(db, currentUser, FAVOTITES), { [message.messageID]: { ...modMessage, date, forwardedFrom: message.sender, } }, { merge: true });
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
    createChannel(owner: CurrentUser, data: TypeCreateChannel): Promise<[void, void]>,
    checkName(name: string): Promise<boolean>,
    getCurrentInfo: (uid: string) => Promise<TypeChannel | null>,
    changeSubscribers: (channelId: string, value: number) => Promise<void>,
    changeListSubscribers: (typeChange: string, channelId: string, user: CurrentUser) => Promise<void>
}

export const channelAPI: ChannelAPI = {
    async createChannel(owner: CurrentUser, data: TypeCreateChannel) {
        const channelID = uuidv4()
        const chanel = await setDoc(doc(db, CHANNELS, channelID), {})
        const chanelInfo = await setDoc(doc(db, CHANNELS_INFO, channelID), {
            owner,
            displayName: data.displayName,
            isOpen: data.isOpen,
            channelID,
            registrationDate: new Date().toLocaleDateString(),
            subscribers: 0
        })
        return Promise.all([chanel, chanelInfo])
    },
    async checkName(name: string) {
        const q = query(collection(db, CHANNELS_INFO), where("name", "==", name));
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
    async changeSubscribers(channelId, value) {
        const ref = doc(db, CHANNELS_INFO, channelId);
        await updateDoc(ref, {
            subscribers: increment(value)
        });
    },
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
    }
}