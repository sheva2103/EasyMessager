import { FC } from "react";
import { useAppSelector } from "../../hooks/hook";

const ShowNameChat: FC = () => {
    
    const name = useAppSelector(state => {
        if(state.app.selectedChannel) return state.app.selectedChannel.displayName
        return state.app.selectedChat.displayName
    })

    return ( 
        <span>{name}</span>
    );
}

export default ShowNameChat;