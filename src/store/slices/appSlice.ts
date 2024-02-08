import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit'


type Menu = {
    // isOpen: boolean,
    // menuChild: MenuContent
    cover: boolean,
    bar: boolean,
    menuChild: string
}

type AppState = {
    // menuIsOpen: boolean
    menu: Menu
}

const initialState: AppState = {
    menu: {
        cover: false,
        bar: false,
        menuChild: ''
    }
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
        }
    }
})

export const {openMenu, closeMenu, closeBar} = appSlice.actions
export default appSlice.reducer