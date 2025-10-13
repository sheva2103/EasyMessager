import { configureStore } from '@reduxjs/toolkit'
import appSlice from './slices/appSlice'
import messagesSlice from './slices/messagesSlice'
import callsSlice from './slices/callsSlice'

export const store = configureStore({
    reducer: {
        app: appSlice,
        messages: messagesSlice,
        calls: callsSlice
    },
})


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch