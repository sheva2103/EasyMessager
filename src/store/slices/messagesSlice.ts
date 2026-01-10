import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MessageType, NoReadMessagesType } from "../../types/types";


interface IInitialState {
    messages: MessageType[],
    noRead: NoReadMessagesType
}

const initialState: IInitialState = {
    messages: [],
    noRead: {quantity: 0, targetIndex: 0}
}

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        setMessages(state, action: PayloadAction<{messages: MessageType[], noRead: NoReadMessagesType}>) {
            state.messages = action.payload.messages
            state.noRead = action.payload.noRead
        }
    }
})

export const {
    setMessages,
    
} = messagesSlice.actions
export default messagesSlice.reducer