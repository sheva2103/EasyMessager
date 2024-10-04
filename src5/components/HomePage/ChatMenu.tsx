import { FC } from "react";
import { useAppSelector } from "../../hooks/hook";
import styles from './HomePage.module.scss'
import BlockControl from "./BlockControl";
import UserManagementMenu from "./UserManagementMenu";
import { Chat } from "../../types/types";

type Props = {
    selectedChat: Chat
}

const ChatMenu: FC<Props> = ({selectedChat}) => {

    const showCheckbox = useAppSelector(state => state.app.showCheckbox)

    return (
        <div className={styles.menu}>
            {showCheckbox ?
                <BlockControl />
                :
                <UserManagementMenu chatInfo={selectedChat} />
            }
        </div>
    )
}

export default ChatMenu;