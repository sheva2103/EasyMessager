import { MessageType } from '../types/types';
import { createMessageList, getQuantityNoReadMessages } from './utils';

type InMsg = {
    taskId: string
    rawMessagesArray: any[]
    currentUserUid: string
};

type OutMsg =
    | { taskId: string; list:  MessageType[]; noRead: { quantity: number; targetIndex: number } }
    | { taskId: string; error: string };

addEventListener('message', (e: MessageEvent<InMsg>) => {
    const { taskId, rawMessagesArray, currentUserUid } = e.data;
    try {
        const list = createMessageList(rawMessagesArray);
        const noRead = getQuantityNoReadMessages(list, currentUserUid);
        postMessage({ taskId, list, noRead } as OutMsg);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        postMessage({ taskId, error: message } as OutMsg);
    }
});