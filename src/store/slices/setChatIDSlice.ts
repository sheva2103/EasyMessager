import { createAsyncThunk } from "@reduxjs/toolkit";
import { Chat } from "../../types/types";
import { messagesAPI } from "../../API/api";

type UserData = {
    currentUserEmail: string,
    guestInfo: Chat
}


export const setChat = createAsyncThunk<Chat, UserData | null, {rejectValue: Chat}>(
    'app/getChatId',
    async (users, {rejectWithValue}) => {

        if(users === null) return null
        
        if(users.guestInfo?.chatID) return users.guestInfo

        const id = await Promise.all([messagesAPI.getChatID(users.currentUserEmail, users.guestInfo.email), messagesAPI.getChatID(users.guestInfo.email, users.currentUserEmail)])
        console.log(id)

        if( id[0] === undefined && id[1] === undefined) return rejectWithValue(users.guestInfo)
        if(id[0]) return {...users.guestInfo, chatID: id[0]}
        if(id[1]) return {...users.guestInfo, chatID: id[1]}

    }
)