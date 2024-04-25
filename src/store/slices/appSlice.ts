import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit'
import { Chat, CurrentUser, CurrentUserData, Message1 } from "../../types/types";
import { setChat } from "./setChatIDSlice";
import { v4 as uuidv4 } from 'uuid';


type Menu = {
    cover: boolean,
    bar: boolean,
    menuChild: string
}



type AppState = {
    menu: Menu,
    selectedChat: Chat | null,
    selectedMessages: Message1[],
    changeMessage: Message1 | null,
    isSendMessage: boolean,
    showCheckbox: boolean,
    currentUser: null | CurrentUser,
    blackList: CurrentUser[],
    contacts: Chat[],
    chatsList: CurrentUser[],
    loadChat: boolean
}

const initialState: AppState = {
    menu: {
        cover: false,
        bar: false,
        menuChild: ''
    },
    selectedChat: null,
    selectedMessages: [],
    changeMessage: null,
    isSendMessage: false, 
    showCheckbox: false,
    currentUser: null,
    blackList: [],
    contacts: [],
    chatsList: [],
    loadChat: false

}

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        openMenu(state) {
            state.menu.cover = !state.menu.cover
            state.menu.bar = !state.menu.bar
        },
        closeMenu(state) {
            state.menu.bar = false
            state.menu.cover = false
            state.menu.menuChild = ''
        },
        closeBar(state, action: PayloadAction<string>) {
            state.menu.bar = false
            state.menu.menuChild = action.payload
            if(!state.menu.cover) state.menu.cover = true
        },
        // selectChat(state, action: PayloadAction<Chat>) {
        //     state.selectedChat = action.payload
        //     state.selectedMessages = []
        // },
        addSelectedMessage(state, action: PayloadAction<Message1>) {
            if(state.selectedMessages.some(item => item.messageID === action.payload.messageID)) return //изменил
            state.selectedMessages.push(action.payload)
        },
        clearSelectedMessage(state) {
            state.selectedMessages = []
            state.isSendMessage = false,
            state.showCheckbox = false
        },
        deleteSelectedMessage(state, action: PayloadAction<Message1>) {
            state.selectedMessages = state.selectedMessages.filter(message => message.messageID !== action.payload.messageID)
        },
        changeMessage(state, action: PayloadAction<Message1 | null>) {
            state.changeMessage = action.payload
        },
        isSendMessage(state, action: PayloadAction<boolean>) {
            state.isSendMessage = action.payload
        },
        setShowCheckbox(state, action: PayloadAction<boolean>) {
            state.showCheckbox = action.payload
        },
        setUser(state, action: PayloadAction<CurrentUser | null>) {
            state.currentUser = action.payload
            if(!action.payload) {
                state.selectedChat = null
                state.menu = {cover: false, bar: false, menuChild: ''}
                state.isSendMessage = null
                state.changeMessage = null
                state.showCheckbox = false
                state.selectedMessages = null
                state.blackList = []
                state.chatsList = []
                state.contacts = []
            }
        },
        setUserData(state, action: PayloadAction<CurrentUserData>) {
            state.currentUser.displayName = action.payload.displayName
            state.currentUser.photoURL = action.payload.photoURL || ''
        },
        setChatList(state, action: PayloadAction<CurrentUser[]>) {
            state.chatsList = action.payload
        },
        setContacts(state, action: PayloadAction<CurrentUser[]>) {
            state.contacts = action.payload
        },
        setBlacklist(state, action: PayloadAction<CurrentUser[]>) {
            state.blackList = action.payload
        },
        setLoadChat(state, action: PayloadAction<boolean>) {
            state.loadChat = false
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(setChat.pending, (state) => {
                state.loadChat = true
            })
            .addCase(setChat.rejected, (state, action) => {
                state.selectedChat = {...action.payload, chatID: uuidv4()}
            })
            .addCase(setChat.fulfilled, (state, action) => {
                state.selectedChat = action.payload
                if(state.selectedMessages) state.selectedMessages = []
                if(state.showCheckbox) state.showCheckbox = false
            })
    }
})

export const {openMenu,
                closeMenu,
                closeBar, 
                //selectChat, 
                addSelectedMessage, 
                deleteSelectedMessage, 
                changeMessage, 
                clearSelectedMessage, 
                isSendMessage, 
                setShowCheckbox,
                setUser,
                setUserData,
                setChatList,
                setLoadChat,
                setContacts,
                setBlacklist
            } = appSlice.actions
export default appSlice.reducer