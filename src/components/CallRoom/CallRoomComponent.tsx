import { FC, useState } from "react";
import styles from './Styles.module.scss'
import DialogComponent from "../Settings/DialogComponent";
import { CallRoom } from "./CallRoom";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { setIsCallRoom } from "../../store/slices/appSlice";

const CallRoomComponent: FC = () => {

    const isOpen = useAppSelector(state => state.app.isCallRoomOpen)
    const ownerID = useAppSelector(state => state.app.currentUser.uid)
    const guestID = useAppSelector(state => state.app?.selectedChat?.uid)
    const dispatch = useAppDispatch()
    const close = (action: boolean) => {
        dispatch(setIsCallRoom(action))
    }

    return ( 
        <div className={styles.container}>
            <DialogComponent isOpen={isOpen} onClose={close}>
                <CallRoom myUid={ownerID} calleeUid={guestID}/>
            </DialogComponent>
        </div>
    );
}

export default CallRoomComponent;