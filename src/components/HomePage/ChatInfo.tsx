import { FC, memo, useEffect, useState } from "react";
import styles from './HomePage.module.scss'
import Avatar from "../Avatar/Avatar";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { Chat, Message1, NoReadMessagesType } from "../../types/types";
import { setChat } from "../../store/slices/setChatIDSlice";
import { messagesAPI, profileAPI } from "../../API/api";
import classNames from "classnames";
import { createMessageList, getChatType, getQuantityNoReadMessages } from "../../utils/utils";
import { DocumentSnapshot, onSnapshot } from "firebase/firestore";
import { setMessages } from "../../store/slices/messagesSlice";
import { Badge } from "@mui/material";
import soundFile from '../../assets/sound.mp3';



interface Props extends Chat {
    globalSearch?: boolean
}

const handleAudioPlay = () => {
    const audio = new Audio(soundFile);
    audio.play().catch(error => {
        console.error('Ошибка воспроизведения:', error);
    });
};


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
    const [messages, setMessagesList] = useState<{ messages: Message1[], noRead: NoReadMessagesType }>({ messages: [], noRead: { quantity: 0, targetIndex: 0 } })
    const [fetchingCurrentInfo, setFetchingCurrentInfo] = useState(false)
    const dispatch = useAppDispatch()
    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const currentUser = useAppSelector(state => state.app.currentUser)
    const handleClick = () => {
        if (selectedChat?.uid === updateUser.uid) return
        dispatch(setChat({ currentUserEmail: currentUser.email, guestInfo: updateUser }))
    }
    const isSelected = selectedChat?.email === user.email

    useEffect(() => {
            setFetchingCurrentInfo(true);
            const getInfo = async () => {
                try {
                    const currentInfo = await profileAPI.getCurrentInfo(user.uid);
                    const chatID = await Promise.all([messagesAPI.getChatID(currentUser.email, currentInfo.email), messagesAPI.getChatID(currentInfo.email, currentUser.email)])
                    if (currentInfo) {
                        setUpdateUser((prev) => {
                            const info: Chat = { ...currentInfo }
                            if (chatID[0] || chatID[1]) info.chatID = chatID[0] || chatID[1]
                            return { ...prev, ...info }
                        })
                    }
                } catch (error) {
                    console.error('Error fetching current info:', error);
                } finally {
                    setFetchingCurrentInfo(false);
                }
            }
            getInfo()
    }, []);

    useEffect(() => {
        let unsubscribe: () => void
        if (updateUser.chatID) {
            const reference = getChatType(false, { ...updateUser });
            unsubscribe = onSnapshot(reference, (doc: DocumentSnapshot<Message1[]>) => {
                const list = createMessageList(doc.data())
                const noRead = getQuantityNoReadMessages(list, currentUser.uid)
                //handleAudioPlay()
                setMessagesList({ messages: list, noRead })
            });
        }
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [updateUser])

    useEffect(() => {
        if (selectedChat?.uid === updateUser.uid) dispatch(setMessages(messages))
    }, [messages, selectedChat]);

    if (fetchingCurrentInfo) return <Skeleton />

    return (
        <li className={styles.chatInfo} onClick={handleClick}>
            {isSelected &&
                <div className={styles.selected}></div>
            }
            <Avatar url={updateUser?.photoURL} name={updateUser.displayName[0]} />
            <span className={styles.name}>{updateUser.displayName}</span>
            <div className={styles.chatInfo__noRead}>
                <Badge badgeContent={messages.noRead.quantity} color="primary" />
            </div>

        </li>
    );
}

function checkProps(prevProps: Props, nextProps: Props): boolean {
    return prevProps.displayName === nextProps.displayName
}
export default memo(ChatInfo, checkProps);