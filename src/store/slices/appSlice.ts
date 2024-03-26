import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit'
import { CurrentUser, CurrentUserData, Message } from "../../types/types";


type Menu = {
    cover: boolean,
    bar: boolean,
    menuChild: string
}



type AppState = {
    menu: Menu,
    selectedChat: string | null,
    selectedMessages: Message[],
    changeMessage: Message | null,
    isSendMessage: boolean,
    showCheckbox: boolean,
    currentUser: null | CurrentUser
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
    currentUser: null

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
        selectChat(state, action: PayloadAction<string>) {
            state.selectedChat = action.payload
            state.selectedMessages = []
        },
        addSelectedMessage(state, action: PayloadAction<Message>) {
            state.selectedMessages.push(action.payload)
        },
        clearSelectedMessage(state) {
            state.selectedMessages = []
            state.isSendMessage = false,
            state.showCheckbox = false
        },
        deleteSelectedMessage(state, action: PayloadAction<Message>) {
            state.selectedMessages = state.selectedMessages.filter(message => message.id !== action.payload.id)
        },
        changeMessage(state, action: PayloadAction<Message | null>) {
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
            }
        },
        setUserData(state, action: PayloadAction<CurrentUserData>) {
            state.currentUser.displayName = action.payload.displayName
            state.currentUser.photoURL = action.payload.photoURL
        }
    }
})

export const {openMenu,
                closeMenu,
                closeBar, 
                selectChat, 
                addSelectedMessage, 
                deleteSelectedMessage, 
                changeMessage, 
                clearSelectedMessage, 
                isSendMessage, 
                setShowCheckbox,
                setUser,
                setUserData
            } = appSlice.actions
export default appSlice.reducer