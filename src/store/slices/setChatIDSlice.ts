import { createAsyncThunk } from "@reduxjs/toolkit";
import { Chat, UsersData } from "../../types/types";
import { messagesAPI } from "../../API/api";
import { makeChatId } from "../../utils/utils";




export const setChat = createAsyncThunk<Chat, UsersData | null, {rejectValue: UsersData}>(
    'app/getChatId',
    async (users, {rejectWithValue}) => {

        if(users === null) return null
        
        if(users.guestInfo?.chatID) return users.guestInfo

        const getID = makeChatId(users)
        const id = await messagesAPI.getChatID(getID) 
        console.log(id)

        if(!getID) return rejectWithValue(users)
        return ({...users.guestInfo, chatID: getID})
    }
)