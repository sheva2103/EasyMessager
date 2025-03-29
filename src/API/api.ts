import { QueryDocumentSnapshot, deleteDoc, deleteField, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { UserInfo } from "firebase/auth";
import { Chat, CurrentUser, Message1 } from "../types/types";
import { collection, getDocs, query, where } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { createChatList, createMessageList, createNewDate } from "../utils/utils";


type ProfileApi = {
    createNewUserInDB: (e: UserInfo) => void,
    changeUserInfo: (data: CurrentUser) => void,
    getCurrentInfo: (uid: string) => Promise<CurrentUser | null>
}

type SearchAPI = {
    searchUser: (name: string) => Promise<CurrentUser[]>
}



type MessagesAPI = {
    addChat: (user: string, recipient: CurrentUser, chatID?: string) => Promise<void>,
    sendMessage: (chatID: string, sender: CurrentUser, message: string, replyToMessage?: Message1) => void,
    getChatID: (name: string, searchName: string) => Promise<string | undefined>,
    sendEditMessage: (chatID: string, message: Message1) => Promise<void>,
    deleteMessage: (chatID: string, message: Message1) => Promise<void>,
    forwardedMessageFrom: (sender: CurrentUser, recipient: Chat, message: Message1) => Promise<void>,
    readMessage: (chatID: string, message: Message1) => Promise<void>,
    clearChat: (chatID: string) => Promise<void[]>,
    deleteChat: (currentUser: string, selectedChat: Chat) => Promise<void>,
    addToFavorites: (currentUser: string, message: Message1) => Promise<void>
}

type ContactsAPI = {
    addToContacts: (currentUser: string, newContact: Chat) => Promise<void>,
    removeFromContacts: (currentUser: string, contact: CurrentUser) => Promise<void>,
    addToBlacklist: (currentUser: string, contact: Chat) => Promise<void>,
    removeFromBlacklist: (currentUser: string, contact: CurrentUser) => Promise<void>
}

export const profileAPI: ProfileApi = {

    async createNewUserInDB(user) {
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            displayName: user.email.slice(0, user.email.indexOf('@')),
            uid: user.uid,
            registrationDate: new Date().toLocaleDateString()
        });
    },
    async changeUserInfo(data) {
        const userRef = doc(db, "users", data.uid);
        await updateDoc(userRef, {
            photoURL: data.photoURL,
            displayName: data.displayName
        });
    },
    async getCurrentInfo(uid) {
        const userRef = doc(db, "users", uid);
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
        const q = query(collection(db, "users"), where("displayName", "==", name));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc: QueryDocumentSnapshot<CurrentUser>) => {
            chats.push(doc.data())
            //console.log(doc.id, " => ", doc.data());
        });
        return chats
    }
}




export const messagesAPI: MessagesAPI = {

    async addChat(user, recipient, chatID) {
        const chat: Chat = { chatID, displayName: recipient.displayName, email: recipient.email, uid: recipient.uid }
        await setDoc(doc(db, user, "chatList"), { [recipient.uid]: chat }, { merge: true });
    },
    async sendMessage(chatID, sender, message, replyToMessage) {
        const date = JSON.stringify(new Date())
        console.log('send message')
        const id = uuidv4()
        const messageObj: Message1 = { message: message, messageID: id, date: date, read: false, sender: sender }
        if(replyToMessage) messageObj.replyToMessage = replyToMessage
        await setDoc(doc(db, 'chats', chatID), { [id]: messageObj }, { merge: true });
    },
    async getChatID(name, searchName) {
        let id = undefined
        console.log('getchatID')
        const docRef = doc(db, name, "chatList");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data: any = docSnap.data()
            createChatList(data).forEach(item => {
                if (item.email === searchName) id = item.chatID
            })
        }
        return id
    },
    async sendEditMessage(chatID, message) {
        const messageRef = doc(db, "chats", chatID);
        const date = JSON.stringify(new Date())
        const editMessage = { ...message, message: message.message, changed: date }
        await updateDoc(messageRef, {
            [message.messageID]: editMessage
        });
    },
    async deleteMessage(chatID, message) {
        const messageRef = doc(db, "chats", chatID);

        await updateDoc(messageRef, {
            [message.messageID]: deleteField()
        });
    },
    
    async forwardedMessageFrom(sender, recipient, message) {
        const id = uuidv4()
        const date = JSON.stringify(new Date())
        const messageObj: Message1 = { message: message.message, messageID: id, date, read: false, sender, forwardedFrom: message.sender }
        const isID = await Promise.all([messagesAPI.getChatID(sender.email, recipient.email), messagesAPI.getChatID(recipient.email, sender.email)])
        if(isID[0] || isID[1]) {
            const currentID = isID[0] || isID[1]
            await setDoc(doc(db, 'chats', currentID), { [id]: messageObj }, { merge: true });
            await Promise.all([messagesAPI.addChat(sender.email, recipient, currentID), messagesAPI.addChat(recipient.email, sender, currentID)])
        }
        else {
            await Promise.all([messagesAPI.addChat(sender.email, recipient, id), messagesAPI.addChat(recipient.email, sender, id)])
            await setDoc(doc(db, 'chats', id), { [id]: messageObj }, { merge: true });
        }
    },
    async readMessage(chatID, message) {
        const messageRef = doc(db, "chats", chatID);

        const editMessage = { ...message, read: true }
        await updateDoc(messageRef, {
            [message.messageID]: editMessage
        });
    },
    async clearChat(chatID) {
        const docRef = doc(db, "chats", chatID);
        const docSnap = await getDoc(docRef)
        const promises: Promise<void>[] = []
        const list: any = docSnap.data()
        createMessageList(list).forEach(message => {
            promises.push(messagesAPI.deleteMessage(chatID, message))
        })
        return Promise.all(promises)
    },
    async deleteChat(currentUser, selectedChat) {
        const chatCurrentRef = doc(db, currentUser, 'chatList');
        const chatGuestRef = doc(db, selectedChat.email, 'chatList');
        const chatGuestSnap: any = await getDoc(chatGuestRef);
        
        await updateDoc(chatCurrentRef, {
            [selectedChat.uid]: deleteField()
        });
        if(chatGuestSnap.exists() && !createChatList(chatGuestSnap.data()).some(item => item.chatID === selectedChat.chatID)) {
            await deleteDoc(doc(db, "chats", selectedChat.chatID));
        }
    },
    async addToFavorites(currentUser, message) {
        const id = uuidv4()
        await setDoc(doc(db, currentUser, "favorites"), { [id]: message }, { merge: true });
    }
}




export const contactsAPI: ContactsAPI = {
    async addToContacts(currentUser, newContact) {
        await setDoc(doc(db, currentUser, "contacts"), { [newContact.uid]: newContact }, { merge: true });
    },
    async removeFromContacts(currentUser, contact) {
        const contactsRef = doc(db, currentUser, 'contacts');

        await updateDoc(contactsRef, {
            [contact.uid]: deleteField()
        });
    },
    async addToBlacklist(currentUser, contact) {
        await setDoc(doc(db, currentUser, "blacklist"), { [contact.uid]: contact }, { merge: true });
    },
    async removeFromBlacklist(currentUser, contact) {
        const contactsRef = doc(db, currentUser, 'blacklist');

        await updateDoc(contactsRef, {
            [contact.uid]: deleteField()
        });
    }
}