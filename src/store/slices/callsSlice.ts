import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialStateType = {
    isOpen: boolean;
    mode: 'incoming' | 'outgoing' | null;
    callerUid: string | null;
    roomId: string | null;
};

type ModalState = {
    mode: 'incoming' | 'outgoing' | null;
    callerUid: string | null;
    roomId: string | null;
}

const initialState: InitialStateType = {
    isOpen: false,
    mode: null,
    callerUid: null,
    roomId: null,
    
}

export const callsSlice = createSlice({
    name: 'calls',
    initialState,
    reducers: {
        openModalCalls(state, action: PayloadAction<ModalState>) {
            state.isOpen = true
            state.callerUid = action.payload.callerUid
            state.mode = action.payload.mode
            state.roomId = action.payload.roomId
        },
        closeModalCalls(state) {
            state.isOpen = false
            state.callerUid = null
            state.mode = null
            state.roomId = null
        },
    }
})

export const {openModalCalls, closeModalCalls} = callsSlice.actions
export default callsSlice.reducer