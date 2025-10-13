import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit'
import { Chat, CurrentUser, CurrentUserData, Message1, OnlineStatusUserType, TypeChannel, UsePresenceReturn } from "../../types/types";
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
    chatsList: Chat[],
    loadChat: boolean,
    moreMessages: boolean,
    emojiIsOpen: boolean,
    selectedEmoji: string,
    isSearchMessage: boolean,
    replyToMessage: Message1 | null,
    isFavorites: boolean,
    selectedChannel: TypeChannel | null,
    clearGlobalSearchUser: boolean,
    onlineStatusSelectedUser: UsePresenceReturn,
    tempChat: Chat | null,
}

const resetChatState = (state: AppState) => {
    const isMobile = /Mobi|Android|iPhone/i.test(window.navigator.userAgent)

    if (state.selectedMessages?.length) state.selectedMessages = []
    if (state.showCheckbox) state.showCheckbox = false
    if (state.isFavorites) state.isFavorites = false
    if (isMobile) state.emojiIsOpen = false
    if (state.selectedChannel) state.selectedChannel = null
    if(state.isSearchMessage) state.isSearchMessage = false 
    state.onlineStatusSelectedUser = null
};

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
    loadChat: false,
    moreMessages: false,
    emojiIsOpen: false,
    selectedEmoji: '',
    isSearchMessage: false,
    replyToMessage: null,
    isFavorites: false,
    selectedChannel: null,
    clearGlobalSearchUser: false,
    onlineStatusSelectedUser: null,
    tempChat: null,

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
            if (state.selectedMessages.length) state.selectedMessages = []
        },
        closeBar(state, action: PayloadAction<string>) {
            state.menu.bar = false
            state.menu.menuChild = action.payload
            if (!state.menu.cover) state.menu.cover = true
        },
        // selectChat(state, action: PayloadAction<Chat>) {
        //     state.selectedChat = action.payload
        //     state.selectedMessages = []
        // },
        addSelectedMessage(state, action: PayloadAction<Message1>) {
            if (state.selectedMessages.some(item => item.messageID === action.payload.messageID)) return //изменил
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
            if (!action.payload) state.replyToMessage = null
            if(state.replyToMessage) state.replyToMessage = null
        },
        setReplyToMessage(state, action: PayloadAction<Message1 | null>) {
            state.replyToMessage = action.payload
            if(state.changeMessage) state.changeMessage = null
        },
        isSendMessage(state, action: PayloadAction<boolean>) {
            state.isSendMessage = action.payload
        },
        setShowCheckbox(state, action: PayloadAction<boolean>) {
            state.showCheckbox = action.payload
        },
        setUser(state, action: PayloadAction<CurrentUser | null>) {
            state.currentUser = action.payload
            if (!action.payload) {
                state.selectedChat = null
                state.menu = { cover: false, bar: false, menuChild: '' }
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
            state.loadChat = action.payload
        },
        setEmojiState(state, action: PayloadAction<boolean>) {
            state.emojiIsOpen = action.payload
        },
        setSelectedEmoji(state, action: PayloadAction<string>) {
            state.selectedEmoji = action.payload
        },
        setSearchMessages(state, action: PayloadAction<boolean>) {
            state.isSearchMessage = action.payload
        },
        setIsFavorites(state, action: PayloadAction<boolean>) {
            resetChatState(state)
            state.isFavorites = action.payload
            if (action.payload) state.selectedChat = state.currentUser
            else state.selectedChat = null
            state.menu.bar = false
            state.menu.cover = false
        },
        setSelectedChannel(state, action: PayloadAction<Chat | null>) {
            //state.selectedChannel = action.payload
            resetChatState(state)
            state.selectedChat = action.payload
        },
        updateSelectedChannel(state, action: PayloadAction<TypeChannel | null>) {
            state.selectedChannel = action.payload
        },
        setClearGlobalSearchUser(state, action: PayloadAction<boolean>) {
            state.clearGlobalSearchUser = action.payload
        },
        setOnlineStatusSelectedUser(state, action: PayloadAction<UsePresenceReturn>) {
            state.onlineStatusSelectedUser = action.payload
        },
        setTempChat(state, action: PayloadAction<Chat>) {
            state.tempChat = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(setChat.pending, (state) => {
                //if (state.isFavorites) state.isFavorites = false
                //state.loadChat = true
                //if (state.emojiIsOpen) state.emojiIsOpen = false
            })
            .addCase(setChat.rejected, (state, action) => {
                state.selectedChat = { ...action.payload, chatID: uuidv4() }
            })
            .addCase(setChat.fulfilled, (state, action) => {
                resetChatState(state)
                state.selectedChat = action.payload
                // if (state.selectedMessages) state.selectedMessages = []
                // if (state.showCheckbox) state.showCheckbox = false
            })
    }
})

export const { openMenu,
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
    setBlacklist,
    setEmojiState,
    setSelectedEmoji,
    setSearchMessages,
    setReplyToMessage,
    setIsFavorites,
    setSelectedChannel,
    updateSelectedChannel,
    setClearGlobalSearchUser,
    setOnlineStatusSelectedUser,
    setTempChat,
} = appSlice.actions
export default appSlice.reducer