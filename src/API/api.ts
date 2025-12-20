import { QueryDocumentSnapshot, deleteDoc, deleteField, doc, getDoc, setDoc, updateDoc, arrayRemove, arrayUnion, CollectionReference, DocumentReference, runTransaction } from "firebase/firestore";
import { db } from "../firebase";
import { deleteUser, EmailAuthProvider, getAuth, reauthenticateWithCredential, UserInfo } from "firebase/auth";
import { CallMessageOptionsType, Chat, CurrentUser, Message1, Reaction, SetReactionOptions, TypeChannel, TypeCreateChannel } from "../types/types";
import { collection, getDocs, query, where } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { createChatList, createMessageList, createObjectChannel, createObjectUser, getChatType, getFakeChat } from "../utils/utils";
import { ADD_TO_LIST_SUBSCRIBERS, BLACKLIST, CHANNELS, CHANNELS_INFO, CHATLIST, CHATS, CONTACTS, REMOVE_FROM_LIST_SUBSCRIBERS, USERS } from "../constants/constants";
import pLimit from "p-limit";
import { FirebaseError } from "firebase/app";

const CONCURRENCY_LIMIT = 3;
const limit = pLimit(CONCURRENCY_LIMIT)


type ProfileApi = {
    createNewUserInDB: (e: UserInfo) => Promise<CurrentUser>,
    changeUserInfo: (data: CurrentUser) => void,
    getCurrentInfo: (uid: string) => Promise<CurrentUser | null>,
    updateUserInMyChatList: (email: string, user: CurrentUser) => Promise<void>,
    deleteUserAndData: (password: string) => Promise<void>,
    deletUserInMyChatlist: (id: { myEmail: string, deleteId: string }) => Promise<void>
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
    readMessage: (chat: Chat, message: Message1) => Promise<void>,
    clearChat: (chat: Chat, isFavorites: boolean) => Promise<void[]>,
    deleteChat: (currentUser: CurrentUser, selectedChat: Chat) => Promise<void>,
    addToFavorites: (currentUser: Chat, message: Message1) => Promise<void>,
    sendCallInfoMessage: (options: CallMessageOptionsType) => Promise<void>,
    setReaction: (options: SetReactionOptions) => Promise<void>
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
        const userObj: CurrentUser = {
            email: user.email,
            displayName: user.email.slice(0, user.email.indexOf('@')),
            uid: user.uid,
            registrationDate: new Date().toLocaleDateString()
        }
        await setDoc(doc(db, USERS, user.uid), userObj);
        return userObj
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
    async updateUserInMyChatList(email, user) {
        const ref = doc(db, email, CHATLIST)
        await setDoc(ref, { [user.uid]: user }, { merge: true });
    },
    async deleteUserAndData(password) {
        const auth = getAuth();
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, password)
        if (!user) {
            console.error('Нет текущего пользователя');
            return;
        }

        try {
            await reauthenticateWithCredential(user, credential)
            console.log('Переаутентификация успешна')
        } catch (err) {
            const error = err as FirebaseError
            console.error('Ошибка переаутентификации:', error.message)
            throw err
        }

        try {
            const userColRef = collection(db, user.email);
            const snapshot = await getDocs(userColRef);
            await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
            console.log(`Коллекция "${user.email}" очищена.`);

            await deleteDoc(doc(db, USERS, user.uid));
            console.log('Документ пользователя удалён');

            await deleteUser(user);
            console.log('Пользователь удалён из Firebase Auth');
        } catch (err) {
            console.error('Ошибка при удалении пользователя:', err);
        }
    },
    async deletUserInMyChatlist(options) {
        const chatCurrentRef = doc(db, options.myEmail, CHATLIST);
        await updateDoc(chatCurrentRef, {
            [options.deleteId]: deleteField()
        });
    }
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

        const id = uuidv4()
        const messageObj: Message1 = { message: message, messageID: id, date: date, sender: { ...sender } }
        if (!isFavorites && !chat?.channel) messageObj.read = false
        if (chat?.channel) messageObj.sender.channel = chat.channel
        if (replyToMessage) messageObj.replyToMessage = replyToMessage

        if (chat.channel) {
            await channelAPI.changeCannelInfo(chat.channel, true)
        }
        //return await setDoc(reference, { [id]: messageObj }, { merge: true });
        const newDocRef = doc(reference, id);
        return await setDoc(newDocRef, messageObj, { merge: true });
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
        // await updateDoc(messageRef, {
        //     [message.messageID]: editMessage
        // });
        const docToUpdateRef = doc(messageRef, message.messageID);

        // 2. Обновляем поля ВНУТРИ Документа
        await updateDoc(docToUpdateRef, {
            message: message.message,
            changed: date
        });
    },
    async deleteMessage(chat, message, isFavorites) {
        const messageRef = getChatType(isFavorites, chat)

        // await updateDoc(messageRef, {
        //     [message.messageID]: deleteField()
        // });
        const docToDeleteRef = doc(messageRef, message.messageID);

        // 2. Используем deleteDoc()
        await deleteDoc(docToDeleteRef)
    },

    async forwardedMessageFrom(sender, recipient, message) {
        const id = uuidv4()
        const date = JSON.stringify(new Date())
        const forwardedFrom = message.forwardedFrom?.channel ?
            createObjectChannel(message.forwardedFrom?.channel)
            :
            message.sender?.channel ?
                createObjectChannel(message.sender.channel)
                :
                message.sender
        const messageObj: Message1 = { message: message.message, messageID: id, date, read: false, sender, forwardedFrom }
        if (message?.callStatus) messageObj.callStatus = message?.callStatus
        const isID = await Promise.all([messagesAPI.getChatID(sender.email, recipient.email), messagesAPI.getChatID(recipient.email, sender.email)])
        if (isID[0] || isID[1]) {
            const currentID = isID[0] || isID[1]
            const reference = getChatType(false, getFakeChat(currentID))
            const newDocRef = doc(reference, id)
            await setDoc(newDocRef, messageObj, { merge: true }); // !!!!!!!!!!!!!!!!!!!!!1111 возможно просто meesageObj
            await Promise.all([messagesAPI.addChat(sender, recipient, currentID), messagesAPI.addChat(recipient, sender, currentID)])
        }
        else {
            const reference = getChatType(false, getFakeChat(id))
            const newDocRef = doc(reference, id)
            await Promise.all([messagesAPI.addChat(sender, recipient, id), messagesAPI.addChat(recipient, sender, id)])
            await setDoc(newDocRef, messageObj, { merge: true }); // !!!!!!!!!!!!!!!!!!!!!1111 было { [id]: messageObj } стало { messageObj }
        }
    },

    async readMessage(chat, message) {
        // const messageRef = getChatType(false, chat)
        // const editMessage = { ...message, read: true }
        // await updateDoc(messageRef, {
        //     [message.messageID]: editMessage
        // });
        const messagesCollectionRef = getChatType(false, chat); // Всегда CollectionReference
        const messageDocRef = doc(messagesCollectionRef, message.messageID);
        await updateDoc(messageDocRef, {
            read: true
        });
    },
    async clearChat(chat, isFavorites) {
        // const docRef = getChatType(isFavorites, chat)
        // const docSnap = await getDoc(docRef)
        // const list: any = docSnap.data()
        // const limitedPromises = createMessageList(list).map(message =>
        //     limit(() => messagesAPI.deleteMessage(chat, message, isFavorites))
        // )
        // return Promise.all(limitedPromises)
        const collectionRef = getChatType(isFavorites, chat)
        const querySnapshot = await getDocs(collectionRef);

        // 2. Создаем список сообщений для удаления
        const messagesToDelete = querySnapshot.docs.map(doc => ({ //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
            ...doc.data(),
            messageID: doc.id
        })) as Message1[]

        const limitedPromises = messagesToDelete.map(message =>
            limit(() => messagesAPI.deleteMessage(chat, message, isFavorites))
        );

        return Promise.all(limitedPromises);
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
            await channelAPI.changeListSubscribers(REMOVE_FROM_LIST_SUBSCRIBERS, selectedChat.channel.channelID, currentUser)
        }
    },
    async addToFavorites(currentUser, message) {
        // const reference = getChatType(true, currentUser)
        // const date = JSON.stringify(new Date())
        // let modMessage = { ...message }
        // delete modMessage.read
        // if (modMessage?.reactions) delete modMessage.reactions
        // await setDoc(reference, { [message.messageID]: { ...modMessage, date, forwardedFrom: message.sender, } }, { merge: true });
        // 1. Получаем ссылку на Коллекцию 'message' (CollectionReference)
        const favoritesCollectionRef = getChatType(true, currentUser)
        const date = JSON.stringify(new Date());
        let modMessage = { ...message };
        delete modMessage.read;
        if (modMessage?.reactions) delete modMessage.reactions;
        const documentData = {
            ...modMessage,
            date,
            forwardedFrom: message.sender
        }
        const messageDocRef = doc(favoritesCollectionRef, message.messageID);
        await setDoc(messageDocRef, documentData, { merge: true });
    },
    async sendCallInfoMessage(options) {
        // const date = JSON.stringify(new Date())
        // const reference = getChatType(false, options.callee)
        // const messageID = uuidv4()
        // const isRead = options?.callDuration !== '0:00'
        // const messageObj: Message1 = { message: options.callDuration, messageID, date, sender: { ...options.caller }, read: isRead, callStatus: options.status }
        // await setDoc(reference, { [messageID]: messageObj }, { merge: true });

        // await messagesAPI.addChat(options.caller, options.callee, options.callee.chatID)
        // await messagesAPI.addChat(options.callee, options.caller, options.callee.chatID)
        const date = JSON.stringify(new Date());
        const messagesCollectionRef = getChatType(false, options.callee);

        const messageID = uuidv4();
        const isRead = options?.callDuration !== '0:00';
        const messageObj: Message1 = {
            message: options.callDuration,
            messageID,
            date,
            sender: { ...options.caller },
            read: isRead,
            callStatus: options.status
        };
        const messageDocRef = doc(messagesCollectionRef, messageID)
        await setDoc(messageDocRef, messageObj, { merge: true })

        await messagesAPI.addChat(options.caller, options.callee, options.callee.chatID)
        await messagesAPI.addChat(options.callee, options.caller, options.callee.chatID)
    },

    // async setReaction({ reaction, chat, isMine, messageID, isFavorites }) {
    //     const messageRef = getChatType(isFavorites, chat)
    //     const getMessage = await getDoc(messageRef)
    //     if (getMessage.exists()) {
    //         const message: Message1 = getMessage.data()[messageID]
    //         let updateMessage
    //         if (message?.reactions && message?.reactions.length > 0) {
    //             const newListReactions: Reaction[] = message.reactions.filter(item => item.sender.uid !== reaction.sender.uid)
    //             if (!isMine) newListReactions.push(reaction)
    //             updateMessage = { ...message, reactions: newListReactions }
    //         } else {
    //             updateMessage = { ...message, reactions: [reaction] }
    //         }
    //         await updateDoc(messageRef, {
    //             [message.messageID]: updateMessage
    //         })
    //     }
    // }
    async setReaction({ reaction, chat, isMine, messageID, isFavorites }: {
        reaction: Reaction,
        chat: Chat,
        isMine?: boolean,
        messageID: string,
        isFavorites: boolean
    }) {
        // 1. Получаем ссылку на Коллекцию 'messages' (CollectionReference)
        const messagesCollectionRef = getChatType(isFavorites, chat);

        // 2. Создаем ссылку на Документ сообщения (DocumentReference)
        const messageDocRef = doc(messagesCollectionRef as CollectionReference, messageID);

        // Используем транзакцию для безопасного атомарного обновления массива реакций
        try {
            await runTransaction(db, async (transaction) => {
                const messageSnap = await transaction.get(messageDocRef);

                if (!messageSnap.exists()) {
                    // Это предотвратит попытку поставить реакцию на несуществующее сообщение
                    throw new Error("Сообщение не найдено для установки реакции.");
                }

                const currentMessage = messageSnap.data() as Message1;
                let currentReactions: Reaction[] = currentMessage.reactions || [];

                // UID пользователя, который ставит/удаляет реакцию
                const senderUid = reaction.sender.uid;

                // Шаг 1: Удаляем старую реакцию текущего пользователя (если она была)
                // Мы фильтруем, чтобы оставить только реакции других пользователей.
                const reactionsWithoutCurrentSender = currentReactions.filter(
                    item => item.sender.uid !== senderUid
                );

                let updatedReactions: Reaction[];

                if (!isMine) {
                    // Шаг 2: Пользователь СТАВИТ или МЕНЯЕТ реакцию
                    // Мы добавляем новую реакцию к отфильтрованному списку.
                    updatedReactions = [...reactionsWithoutCurrentSender, reaction];
                } else {
                    // Шаг 2: Пользователь УДАЛЯЕТ реакцию (isMine === true)
                    // Мы просто оставляем отфильтрованный список (реакция удалена).
                    updatedReactions = reactionsWithoutCurrentSender;
                }

                // Шаг 3: Записываем обновленное сообщение обратно в транзакции
                transaction.update(messageDocRef, {
                    reactions: updatedReactions
                });
            });

        } catch (error) {
            console.error("Ошибка при установке/удалении реакции в транзакции:", error);
            // В зависимости от требований, вы можете перебросить ошибку или обработать ее тихо
            throw error;
        }
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
    changeListSubscribers: (typeChange: string, channelId: string, user: CurrentUser) => Promise<void>,
    changeCannelInfo: (channel: TypeChannel, updateDateOfChange?: boolean) => Promise<void>,
    deleteChannel: (id: string) => Promise<[void, void]>,
    applyForMembership: (user: CurrentUser, channelID: string) => Promise<void>,
    getApplyForMembership: (channelID: string) => Promise<CurrentUser[]>,
    deleteApplication: (channelID: string, user: CurrentUser) => Promise<void>,
    changeAccessChannel: (channelID: string, action: boolean) => Promise<void>,
    updateChannelInMyChatList: (myID: string, channel: Chat) => Promise<void>
}

export const channelAPI: ChannelAPI = {
    async createChannel(owner: CurrentUser, data: TypeCreateChannel) {
        const channelID = uuidv4()
        const dateOfChange = JSON.stringify(new Date())
        const info: TypeChannel = {
            owner,
            displayName: data.displayName,
            isOpen: data.isOpen,
            channelID,
            registrationDate: new Date().toLocaleDateString(),
            listOfSubscribers: [],
            dateOfChange
        }
        await setDoc(doc(db, CHANNELS, channelID), {})
        await setDoc(doc(db, CHANNELS_INFO, channelID), info)
        await messagesAPI.addChat(owner, createObjectChannel(info))
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
            const owner = await profileAPI.getCurrentInfo(info.owner.uid)
            return ({ ...info, owner })
        } else {
            return null
        }
    },
    async changeListSubscribers(typeChange, channelID, user) {
        const ref = doc(db, CHANNELS_INFO, channelID)

        if (typeChange === ADD_TO_LIST_SUBSCRIBERS) {
            await updateDoc(ref, {
                listOfSubscribers: arrayUnion(user)
            });
        }
        const toCurrentUser = createObjectUser(user)
        if (typeChange === REMOVE_FROM_LIST_SUBSCRIBERS) {
            await updateDoc(ref, {
                listOfSubscribers: arrayRemove(toCurrentUser)
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
            if (targetUser) return
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
        if (list.exists()) {
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
    },
    async updateChannelInMyChatList(email, channel) {
        const ref = doc(db, email, CHATLIST)
        await setDoc(ref, { [channel.channel.channelID]: channel }, { merge: true });
    }
}