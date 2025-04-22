import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message1, NoReadMessagesType } from "../../types/types";


interface IInitialState {
    messages: Message1[],
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
        setMessages(state, action: PayloadAction<{messages: Message1[], noRead: NoReadMessagesType}>) {
            state.messages = action.payload.messages
            state.noRead = action.payload.noRead
        }
    }
})

export const {
    setMessages,
    
} = messagesSlice.actions
export default messagesSlice.reducer