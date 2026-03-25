// import { MessageType } from '../types/types';
// import { createMessageList, getQuantityNoReadMessages } from './utils';

// type InMsg = {
//     taskId: string
//     rawMessagesArray: any[]
//     currentUserUid: string
// };

// type OutMsg =
//     | { taskId: string; list:  MessageType[]; noRead: { quantity: number; targetIndex: number } }
//     | { taskId: string; error: string };

// addEventListener('message', (e: MessageEvent<InMsg>) => {
//     const { taskId, rawMessagesArray, currentUserUid } = e.data;
//     try {
//         const list = createMessageList(rawMessagesArray);
//         const noRead = getQuantityNoReadMessages(list, currentUserUid);
//         postMessage({ taskId, list, noRead } as OutMsg);
//     } catch (err) {
//         const message = err instanceof Error ? err.message : String(err);
//         postMessage({ taskId, error: message } as OutMsg);
//     }
// });

// messagesWorker.ts
import { MessageType } from '../types/types';
import { getQuantityNoReadMessages } from './utils';

let activeChatId: string | null = null;
let localMessages: MessageType[] = [];


addEventListener('message', (e: MessageEvent<any>) => {
    const { taskId, type, rawMessagesArray, changes, currentUserUid } = e.data;

    try {
        if (type === 'INITIAL') {
            activeChatId = taskId;
            localMessages = rawMessagesArray || [];
        } 
        
        else if (type === 'UPDATE') {
            if (activeChatId !== taskId) return;

            changes.forEach((change: any) => {
                const { type: changeType, data } = change;
                const id = data.messageID;

                if (changeType === 'added') {
                    localMessages.push(data);
                } else if (changeType === 'modified') {
                    const idx = localMessages.findIndex(m => m.messageID === id);
                    if (idx !== -1) localMessages[idx] = data;
                } else if (changeType === 'removed') {
                    localMessages = localMessages.filter(m => m.messageID !== id);
                }
            });
        }
        const noRead = getQuantityNoReadMessages(localMessages, currentUserUid);

        postMessage({
            taskId,
            list: type === 'INITIAL' ? localMessages : undefined,
            changes: type === 'UPDATE' ? changes : undefined,
            noRead
        });

    } catch (err) {
        postMessage({ taskId, error: String(err) });
    }
});