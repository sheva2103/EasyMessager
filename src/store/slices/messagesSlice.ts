import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MessageType, NoReadMessagesType } from "../../types/types";


interface IInitialState {
    messages: MessageType[],
    noRead: NoReadMessagesType
}

const initialState: IInitialState = {
    messages: [],
    noRead: { quantity: 0, targetIndex: 0 }
}

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        setMessages(state, action: PayloadAction<{ messages: MessageType[], noRead: NoReadMessagesType } | null>) {
            if (action.payload) {
                state.messages = action.payload.messages
                state.noRead = action.payload.noRead
            } else {
                state.messages = []
                state.noRead = { quantity: 0, targetIndex: 0 }
            }
        },
        setMessageChat(state, action: PayloadAction<{messages?: MessageType[], changes?: { type: string, data: MessageType }[], noRead: { quantity: number, targetIndex: number } }>) {
            const { messages, changes, noRead } = action.payload;

            if (messages) {
                state.messages = messages;
            }
            else if (changes) {
                changes.forEach(change => {
                    const { type, data } = change;
                    const id = data.messageID;

                    if (type === "added") {
                        if (!state.messages.some(m => m.messageID === id)) {
                            state.messages.push(data);
                        }
                    } else if (type === "modified") {
                        const idx = state.messages.findIndex(m => m.messageID === id);
                        if (idx !== -1) state.messages[idx] = data;
                    } else if (type === "removed") {
                        state.messages = state.messages.filter(m => m.messageID !== id);
                    }
                });
            }

            state.noRead = noRead;
        }
    }
})

export const {
    setMessages, setMessageChat

} = messagesSlice.actions
export default messagesSlice.reducer