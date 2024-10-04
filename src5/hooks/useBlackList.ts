import { useEffect, useState } from "react";
import { CurrentUser } from "../types/types";
import { useAppSelector } from "./hook";
import { DocumentSnapshot, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { createChatList } from "../utils/utils";


export function useBlackList(): {myBlackList: boolean, guestBlackList: boolean} {

    const guest = useAppSelector(state => state.app?.selectedChat)
    const currentUser = useAppSelector(state => state.app.currentUser)
    const myBlackList = useAppSelector(state => state.app?.blackList).some(item => item?.uid === guest?.uid)
    const [guestBlackList, setGuestBlackList] = useState(false)

    useEffect(() => {
        if(guest) {
            const getGuestBlackList = onSnapshot(doc(db, guest.email, "blacklist"), (doc: DocumentSnapshot<CurrentUser[]>) => {
                if(doc.data()) {
                    const isBan = createChatList(doc.data()).some(item => item.uid === currentUser.uid)
                    isBan ? setGuestBlackList(true) : setGuestBlackList(false)
                } 
            });
            return () => getGuestBlackList()
        }
    }, [guest]);
    
    return {myBlackList, guestBlackList}
}