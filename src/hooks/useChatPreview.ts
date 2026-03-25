import { useState, useEffect } from "react";
import { query, orderBy, limit, onSnapshot, where } from "firebase/firestore";
import { Chat, MessageType } from "../types/types";
import { getChatType } from "../utils/utils";

export const useChatPreview = (chat: Chat, currentUserUid: string) => {
    const [preview, setPreview] = useState<{ lastMessage: MessageType | null, unreadCount: number }>({ lastMessage: null, unreadCount: 0 })

    useEffect(() => {
        if (!chat.chatID) return;

        const messagesRef = getChatType(false, chat);

        const qLast = query(messagesRef, orderBy("date", "desc"), limit(1))
        const unsubLast = onSnapshot(qLast, (snapshot) => {
            const lastDoc = snapshot.docs[0]?.data() as MessageType
            setPreview(prev => ({ ...prev, lastMessage: lastDoc || null }))
        });

        const qUnread = query(
            messagesRef,
            where("read", "==", false),
            where("sender.uid", "!=", currentUserUid)
        );
        const unsubUnread = onSnapshot(qUnread, (snapshot) => {
            setPreview(prev => ({ ...prev, unreadCount: snapshot.size }));
        });

        return () => {
            unsubLast();
            unsubUnread();
        };
    }, [chat.chatID, currentUserUid]);

    return preview;
};