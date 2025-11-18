import { FC } from "react";
import { useBlackList } from "../../hooks/useBlackList";
import { Chat } from "../../types/types";
import InputNewMessage from "./InputNewMessage";
import { useAppSelector } from "../../hooks/hook";
import SearchMessages from "./SearchMessages";

type Props = {
    selectedChat: Chat
}

//переписать inputnewmessage

const MessageInputField: FC<Props> = ({selectedChat}) => {

    const isSearchMessage = useAppSelector(state => state.app.isSearchMessage)
    const {myBlackList, guestBlackList} = useBlackList()

    if(isSearchMessage) return <SearchMessages />

    if(myBlackList || guestBlackList) return null

    return ( 
        <InputNewMessage chatInfo={selectedChat} />
    );
}

export default MessageInputField;