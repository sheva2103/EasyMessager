import { DocumentData, DocumentSnapshot, QueryDocumentSnapshot, deleteField, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { UserInfo } from "firebase/auth";
import { Chat, CurrentUser, Message1 } from "../types/types";
import { collection, getDocs, query, where } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { createChatList, createNewDate } from "../utils/utils";


type ProfileApi = {
    createNewUserInDB: (e: UserInfo) => void,
    changeUserInfo: (data: CurrentUser) => void,
}

type SearchAPI = {
    searchUser: (name: string) => Promise<CurrentUser[]>
}



type MessagesAPI = {
    addChat: (user: string, recipient: CurrentUser, chatID?: string) => Promise<void>,
    sendMessage: (chatID: string, sender: CurrentUser, message: string) => void,
    getChatID: (name: string) => Promise<string | undefined>,
    sendEditMessage: (chatID: string, message: Message1) => Promise<void>,
    deleteMessage: (chatID: string, message: Message1) => Promise<void>,
    forwardedMessageFrom: (chatID: string, sender: CurrentUser, message: string, forwardedFrom: Chat) => Promise<void>
}

type ContactsAPI = {
    addToContacts: (currentUser: string, newContact: Chat) => Promise<void>,
    removeFromContacts: (currentUser: string, contact: CurrentUser) => Promise<void>,
    addToBlacklist: (currentUser: string, contact: Chat) => Promise<void>,
    removeFromBlacklist: (currentUser: string, contact: CurrentUser) => Promise<void>
}

export const profileAPI: ProfileApi = {

    async createNewUserInDB(user) {
        await setDoc(doc(db, "users", user.email), {
            email: user.email,
            displayName: user.email.slice(0, user.email.indexOf('@')),
            uid: user.uid,
            registrationDate: new Date().toLocaleDateString()
        });
    },
    async changeUserInfo(data) {
        const userRef = doc(db, "users", data.email);
        await updateDoc(userRef, {
            photoURL: data.photoURL,
            displayName: data.displayName
        });
    }
}

export const searchAPI: SearchAPI = {
    async searchUser(name) {
        const chats: CurrentUser[] = []
        const q = query(collection(db, "users"), where("displayName", "==", name));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc: QueryDocumentSnapshot<CurrentUser>) => {
            chats.push(doc.data())
            console.log(doc.id, " => ", doc.data());
        });
        return chats
    }
}

export const messagesAPI: MessagesAPI = {

    async addChat(user, recipient, chatID) {
        console.log('addchat>>>>', user)
        const chat: Chat = { chatID, displayName: recipient.displayName, email: recipient.email, uid: recipient.uid }
        await setDoc(doc(db, user, "chatList"), { [recipient.email]: chat }, { merge: true });
    },
    async sendMessage(chatID, sender, message) {
        console.log('api send message chatID:>>>>>', chatID, sender)
        const id = uuidv4()
        const messageObj: Message1 = { message: message, messageID: id, date: createNewDate(), read: false, sender: sender }
        await setDoc(doc(db, 'chats', chatID), { [id]: messageObj }, { merge: true });
    },
    async getChatID(name) {
        let id = undefined
        console.log('getchatID')
        const docRef = doc(db, name, "chatList");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data: any = docSnap.data()
            createChatList(data).forEach(item => {
                if (item.chatID) id = item.chatID
            })
        }
        return id
    },
    async sendEditMessage(chatID, message) {
        const messageRef = doc(db, "chats", chatID);

        const editMessage = { ...message, message: message.message, changed: message.changed }
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
    async forwardedMessageFrom(chatID, sender, message, forwardedFrom) {
        const id = uuidv4()
        const messageObj: Message1 = { message: message, messageID: id, date: createNewDate(), read: false, sender: sender, forwardedFrom}
        await setDoc(doc(db, 'chats', chatID), { [id]: messageObj }, { merge: true });
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