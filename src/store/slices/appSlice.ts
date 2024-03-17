import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit'
import { Message } from "../../types/types";


type Menu = {
    // isOpen: boolean,
    // menuChild: MenuContent
    cover: boolean,
    bar: boolean,
    menuChild: string
}

type AppState = {
    // menuIsOpen: boolean
    menu: Menu,
    selectedChat: string | null,
    selectedMessages: Message[],
    changeMessage: Message | null,
    isSendMessage: boolean,
    showCheckbox: boolean
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
    showCheckbox: false

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
        }
    }
})

export const {openMenu, closeMenu, closeBar, selectChat, addSelectedMessage, deleteSelectedMessage, changeMessage, clearSelectedMessage, isSendMessage, setShowCheckbox} = appSlice.actions
export default appSlice.reducer