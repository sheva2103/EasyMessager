import { FC } from "react";
import styles from './HomePage.module.scss'
import Avatar from "../Avatar/Avatar";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { Chat } from "../../types/types";
import { setChat } from "../../store/slices/setChatIDSlice";


const ChatInfo: FC<Chat> = (user) => {

    const dispatch = useAppDispatch()
    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const currentUserEmail = useAppSelector(state => state.app.currentUser.email)
    const handleClick = () => {
        dispatch(setChat({currentUserEmail: currentUserEmail, guestInfo: user}))
    }
    const isSelected = selectedChat?.email === user.email

    return (  
        <li className={styles.chatInfo} onClick={handleClick}>
            {isSelected && 
                <div className={styles.selected}></div>
            }
            <Avatar url={user?.photoURL} name={user.displayName[0]}/>
            <span className={styles.name}>{user.displayName}</span>
        </li>
    );
}
export default ChatInfo;