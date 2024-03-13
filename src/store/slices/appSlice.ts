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
    changeMessage: Message | null
}

const initialState: AppState = {
    menu: {
        cover: false,
        bar: false,
        menuChild: ''
    },
    selectedChat: null,
    selectedMessages: [],
    changeMessage: null

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
        },
        selectChat(state, action: PayloadAction<string>) {
            state.selectedChat = action.payload
        },
        addSelectedMessage(state, action: PayloadAction<Message>) {
            state.selectedMessages.push(action.payload)
        },
        deleteSelectedMessage(state, action: PayloadAction<Message>) {
            state.selectedMessages = state.selectedMessages.filter(message => message.id !== action.payload.id)
        },
        changeMessage(state, action: PayloadAction<Message | null>) {
            state.changeMessage = action.payload
        }
    }
})

export const {openMenu, closeMenu, closeBar, selectChat, addSelectedMessage, deleteSelectedMessage, changeMessage} = appSlice.actions
export default appSlice.reducer