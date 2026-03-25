import { useEffect, useRef, useState } from "react";
import { Chat, MessageType } from "../types/types";
import { useAppDispatch, useAppSelector } from "./hook";
import { onSnapshot, orderBy, query } from "firebase/firestore";
import { setMessageChat, setMessages } from "../store/slices/messagesSlice";
import { getChatType } from "../utils/utils";
import { postTask, subscribe } from "../utils/workerSingleton";

export const useChatMessages = (selectedChat: Chat | null) => {
    const dispatch = useAppDispatch()
    const currentUserUid = useAppSelector(state => state.app.currentUser.uid)
    const [errorConnection, setErrorConnection] = useState(false)
    const errorRef = useRef(false)
    
    const isInitialSync = useRef(true)

    useEffect(() => {
        if (!selectedChat?.chatID) return;

        isInitialSync.current = true
        errorRef.current = false;
        setErrorConnection(false);

        const messagesRef = getChatType(false, selectedChat)
        const q = query(messagesRef, orderBy("date", "asc"))

        const unsubscribeFirestore = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {

            if (errorRef.current === true) {
                    errorRef.current = false
                    setErrorConnection(false)
                }
            
            if (isInitialSync.current && snapshot.metadata.fromCache) {
                return;
            }

            if (isInitialSync.current) {
                const rawMessagesArray = snapshot.docs.map(doc => doc.data())
                
                postTask(selectedChat.chatID, {
                    type: 'INITIAL',
                    currentUserUid,
                    rawMessagesArray
                })
                
                isInitialSync.current = false
            } else {
                const changes = snapshot.docChanges().map(change => ({
                    type: change.type,
                    data: change.doc.data()
                }))

                if (changes.length > 0) {
                    postTask(selectedChat.chatID, {
                        type: 'UPDATE',
                        currentUserUid,
                        changes
                    });
                }
            }
        }, (error) => {
            console.error("Firestore Error:", error)
            if (errorRef.current === false) {
                    errorRef.current = true
                    setErrorConnection(true)
                }
        })

        const unsubscribeWorker = subscribe(selectedChat.chatID, (data) => {
            if ('error' in data) {
                console.error("Worker Error:", data.error)
                return
            }

            dispatch(setMessageChat({
                messages: data.list,
                changes: data.changes,
                noRead: data.noRead
            }));
        });

        return () => {
            unsubscribeFirestore();
            unsubscribeWorker();
            dispatch(setMessages(null));
        };
    }, [selectedChat?.chatID, currentUserUid, dispatch]);

    return { errorConnection };
};