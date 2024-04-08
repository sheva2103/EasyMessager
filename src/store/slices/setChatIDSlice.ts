import { createAsyncThunk } from "@reduxjs/toolkit";
import { Chat } from "../../types/types";
import { messagesAPI } from "../../API/api";

type UserData = {
    currentUserEmail: string,
    guestInfo: Chat
}


export const setChat = createAsyncThunk<Chat, UserData, {rejectValue: Chat}>(
    'app/getChatId',
    async (users, {rejectWithValue}) => {
        
        if(users.guestInfo?.chatID) return users.guestInfo

        const id = await Promise.all([messagesAPI.getChatID(users.currentUserEmail), messagesAPI.getChatID(users.guestInfo.email)])

        if( id[0] === undefined && id[1] === undefined) return rejectWithValue(users.guestInfo)
        if(id[0]) return {...users.guestInfo, chatID: id[0]}
        if(id[1]) return {...users.guestInfo, chatID: id[1]}

    }
)