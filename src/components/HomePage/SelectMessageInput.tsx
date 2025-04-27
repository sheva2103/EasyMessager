import { FC, memo, useCallback } from "react";
import { Message1 } from "../../types/types";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { addSelectedMessage, deleteSelectedMessage } from "../../store/slices/appSlice";
import { Checkbox } from "@mui/material";
import { createSelector } from "@reduxjs/toolkit";

type Props = {
    messageInfo: Message1
}

const selectIsMessageSelected = createSelector(
    (state: any) => state.app.selectedMessages,
    (_: any, messageID: string) => messageID,
    (selectedMessages: Message1[], messageID) => selectedMessages.some(msg => msg.messageID === messageID)
);


const SelectMessageInput: FC<Props> = ({ messageInfo }) => {

    const dispatch = useAppDispatch()
    const checked = useAppSelector(state => selectIsMessageSelected(state, messageInfo.messageID))

    const handleChange = useCallback(() => {
        if (checked) {
            dispatch(deleteSelectedMessage(messageInfo));
        } else {
            dispatch(addSelectedMessage(messageInfo));
        }
    }, [checked, dispatch, messageInfo])
    
    console.log('render checkbox')

    return (
        <Checkbox checked={checked} onChange={handleChange} />  
    );
}

export default memo(SelectMessageInput);