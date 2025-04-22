import { configureStore } from '@reduxjs/toolkit'
import appSlice from './slices/appSlice'
import messagesSlice from './slices/messagesSlice'

export const store = configureStore({
    reducer: {
        app: appSlice,
        messages: messagesSlice
    },
})


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch