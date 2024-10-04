import { FC, useEffect, useState } from "react";
import styles from './HomePage.module.scss'
import Avatar from "../Avatar/Avatar";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { Chat, CurrentUser, CurrentUserData } from "../../types/types";
import { setChat } from "../../store/slices/setChatIDSlice";
import { profileAPI } from "../../API/api";
import classNames from "classnames";


interface Props extends Chat {
    globalSearch?: boolean
}

const Skeleton: FC = () => {

    return (
        <li className={classNames(styles.chatInfo, styles.skeleton)}>
            <div className={styles.skeleton__Avatar} />
            <div className={styles.skeleton__Name} />
        </li>
    )
}

const ChatInfo: FC<Props> = (user) => {

    const [updateUser, setUpdateUser] = useState<Chat>({ ...user })
    const [fetchingCurrentInfo, setFetchingCurrentInfo] = useState(false)
    const dispatch = useAppDispatch()
    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const currentUserEmail = useAppSelector(state => state.app.currentUser.email)
    const handleClick = () => {
        if (selectedChat?.uid === updateUser.uid) return
        dispatch(setChat({ currentUserEmail: currentUserEmail, guestInfo: updateUser }))
    }
    const isSelected = selectedChat?.email === user.email

    useEffect(() => {
        if (!user.globalSearch) {
            setFetchingCurrentInfo(true)
            profileAPI.getCurrentInfo(user.uid)
                .then(data => {
                    if (data) return setUpdateUser((prev) => ({ ...prev, ...data }))
                })
                .finally(() => setFetchingCurrentInfo(false))
        }
    }, []);

    if (fetchingCurrentInfo) return <Skeleton />

    return (
        <li className={styles.chatInfo} onClick={handleClick}>
            {isSelected &&
                <div className={styles.selected}></div>
            }
            <Avatar url={updateUser?.photoURL} name={updateUser.displayName[0]} />
            <span className={styles.name}>{updateUser.displayName}</span>
        </li>
    );
}
export default ChatInfo;