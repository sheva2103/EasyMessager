import { FC } from "react";
import { useBlackList } from "../../hooks/useBlackList";
import { Chat } from "../../types/types";
import InputNewMessage from "./InputNewMessage";
import styles from './HomePage.module.scss'
import MessagesAreProhibited from "./MessagesAreProhibited";

type Props = {
    selectedChat: Chat
}

//переписать inputnewmessage

const MessageInputField: FC<Props> = ({selectedChat}) => {

    const {myBlackList, guestBlackList} = useBlackList()

    if(myBlackList) return (
        <div className={styles.inputNewMessage}>
            <MessagesAreProhibited />
        </div>
    )

    if(guestBlackList) return (
        <div className={styles.inputNewMessage}>
            <MessagesAreProhibited />
        </div>
    )

    return ( 
        <InputNewMessage chatInfo={selectedChat} />
    );
}

export default MessageInputField;