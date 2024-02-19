import { FC } from "react";
import styles from './HomePage.module.scss'
import Avatar from "../Avatar/Avatar";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { selectChat } from "../../store/slices/appSlice";

type Props = {
    name: string,
    url: string
}

const ChatInfo: FC<Props> = ({name, url}) => {

    const dispatch = useAppDispatch()
    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const handleClick = () => {
        dispatch(selectChat(name))
    }
    const isSelected = selectedChat === name

    return (  
        <li className={styles.chatInfo} onClick={handleClick}>
            {isSelected && 
                <div className={styles.selected}></div>
            }
            <Avatar url={url} name={name[0]}/>
            <span className={styles.name}>{name}</span>
        </li>
    );
}
export default ChatInfo;