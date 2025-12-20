import { FC, memo, useEffect, useState } from "react";
import styles from './HomePage.module.scss'
import Avatar from "../Avatar/Avatar";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { Chat, Message1, NoReadMessagesType } from "../../types/types";
import { setChat } from "../../store/slices/setChatIDSlice";
import { messagesAPI, profileAPI } from "../../API/api";
import classNames from "classnames";
import { createMessageList, getChatType, getQuantityNoReadMessages } from "../../utils/utils";
import { DocumentSnapshot, onSnapshot, QuerySnapshot } from "firebase/firestore";
import { setMessages } from "../../store/slices/messagesSlice";
import { Badge } from "@mui/material";
import soundFile from '../../assets/sound.mp3';
import usePresenceStatus from "../../hooks/useCheckOnlineStatus";
import { setOnlineStatusSelectedUser } from "../../store/slices/appSlice";
import { useTypedTranslation } from "../../hooks/useTypedTranslation";
import CallIcon from '../../assets/telephone-fill.svg'
import DialogComponent, { NotFoundChat } from "../Settings/DialogComponent";




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

export const PreviewLastMessage: FC<{ message: Message1, currentUserId: string }> = ({ message, currentUserId }) => {

    const { t } = useTypedTranslation()
    const isErrorColor = (message?.callStatus === 'rejected' || message?.callStatus === 'unanswered') && message.sender.uid !== currentUserId

    const targetEl = () => {
        if (!message?.callStatus) return (
            <div className={styles.lastMessage}>
                <span>{message.message}</span>
            </div>
        )
        return (
            <div className={styles.lastMessage} style={{ color: isErrorColor ? 'hsla(0, 73.92%, 60.75%, 0.75)' : 'auto', display: 'flex', gap: "6px", alignItems: 'center' }}>
                <CallIcon />
                <span>{t(`call.${message.callStatus}`)}</span>
            </div>
        )
    }

    if (!message) return null

    return (
        <>{targetEl()}</>
    )
}

const ChatInfo: FC<Chat> = (user) => {

    const [updateUser, setUpdateUser] = useState<Chat>({ ...user })
    const [messages, setMessagesList] = useState<{ messages: Message1[], noRead: NoReadMessagesType }>({ messages: [], noRead: { quantity: 0, targetIndex: 0 } })
    const [fetchingCurrentInfo, setFetchingCurrentInfo] = useState(true)
    const [notFoundUser, setNotFoundUser] = useState(false)
    const dispatch = useAppDispatch()
    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const currentUser = useAppSelector(state => state.app.currentUser)
    const handleClick = () => {
        if (selectedChat?.uid === updateUser.uid) return
        dispatch(setChat({ currentUserEmail: currentUser.email, guestInfo: updateUser }))
    }
    const isSelected = selectedChat?.uid === user.uid
    const lastMessage = messages.messages[messages.messages.length - 1]
    const presence = usePresenceStatus(updateUser.uid)

    const unsubscribe = () => {
        profileAPI.deletUserInMyChatlist({ myEmail: currentUser.email, deleteId: user.uid })
            .finally(() => {
                setNotFoundUser(false)
                dispatch(setChat(null))
            })
    }

    useEffect(() => {
        if (isSelected) {
            dispatch(setOnlineStatusSelectedUser(presence))
        }
    }, [presence, isSelected]);

    useEffect(() => {
        const getInfo = async () => {
            try {

                const currentInfo = await profileAPI.getCurrentInfo(user.uid);
                if (!currentInfo) throw currentInfo
                const chatID = await Promise.all([messagesAPI.getChatID(currentUser.email, currentInfo.email), messagesAPI.getChatID(currentInfo.email, currentUser.email)])
                if (currentInfo) {
                    if (chatID[0] && (user.displayName !== currentInfo.displayName || user.photoURL !== currentInfo.photoURL)) {
                        await profileAPI.updateUserInMyChatList(currentUser.email, currentInfo)
                    }
                    setUpdateUser((prev) => {
                        const info: Chat = { ...currentInfo }
                        if (chatID[0] || chatID[1]) info.chatID = chatID[0] || chatID[1]
                        return { ...prev, ...info }
                    })
                }
            } catch (error) {
                console.error('Error fetching current info:', error);
                setNotFoundUser(true)
            } finally {
                setFetchingCurrentInfo(false);
            }
        }
        getInfo()
    }, []);

    // useEffect(() => {
    //     let unsubscribe: () => void
    //     if (updateUser.chatID) {
    //         const reference = getChatType(false, { ...updateUser });
    //         unsubscribe = onSnapshot(reference, (doc: DocumentSnapshot<Message1[]>) => {
    //             const list = createMessageList(doc.data())
    //             const noRead = getQuantityNoReadMessages(list, currentUser.uid)
    //             //handleAudioPlay()
    //             setMessagesList({ messages: list, noRead })
    //         });
    //     }
    //     return () => {
    //         if (unsubscribe) {
    //             unsubscribe();
    //         }
    //     };
    // }, [updateUser.chatID])

    // Предполагаем, что все ваши функции и типы определены

    useEffect(() => {
        let unsubscribe: () => void;

        if (updateUser.chatID) {
            // Получаем ссылку на Коллекцию 'messages' (CollectionReference)
            const messagesCollectionRef = getChatType(false, { ...updateUser} as Chat)

            // Используем onSnapshot для подписки на Коллекцию
            unsubscribe = onSnapshot(messagesCollectionRef, (querySnapshot: QuerySnapshot<Message1>) => {

                // 1. Преобразуем QuerySnapshot.docs в массив объектов сообщений (включая messageID = doc.id)
                const rawMessagesArray = querySnapshot.docs.map(doc => ({
                    ...doc.data(),
                    //messageID: doc.id
                }));

                // 2. Передаем массив объектов в вашу функцию сортировки/обработки
                const list = createMessageList(rawMessagesArray);
                console.log(list)

                // 3. Расчет непрочитанных сообщений
                const noRead = getQuantityNoReadMessages(list, currentUser.uid);

                // 4. Обновляем состояние
                //handleAudioPlay() // (Раскомментируйте, если нужно)
                setMessagesList({ messages: list, noRead });
            });
        }

        // Функция очистки
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };

    }, [updateUser.chatID]);

    useEffect(() => {
        if (isSelected) {
            dispatch(setMessages(messages))
        }
    }, [messages, selectedChat]);

    useEffect(() => {
        if (isSelected && !updateUser?.chatID) {
            setUpdateUser((prev) => ({ ...prev, chatID: selectedChat.chatID }))
        }
    }, [selectedChat?.chatID]);

    if (fetchingCurrentInfo) return <Skeleton />

    if (notFoundUser) return (
        <DialogComponent isOpen={notFoundUser} onClose={unsubscribe}>
            <NotFoundChat confirmFunc={unsubscribe} user />
        </DialogComponent>
    )

    return (
        <li className={styles.chatInfo} onClick={handleClick}>
            {isSelected &&
                <div className={styles.selected}></div>
            }
            <Avatar url={updateUser?.photoURL} name={updateUser.displayName[0]} isOnline={presence.isOnline} />
            <div className={styles.nameBlock}>
                <div className={styles.name}>
                    <span className={styles.name}>{updateUser.displayName}</span>
                </div>
                <PreviewLastMessage message={lastMessage} currentUserId={currentUser.uid} />
            </div>
            <div className={styles.chatInfo__noRead}>
                <Badge badgeContent={messages.noRead.quantity} color="primary" />
            </div>

        </li>
    );
}

function checkProps(prevProps: Chat, nextProps: Chat): boolean {
    return prevProps.displayName === nextProps.displayName
}
export default memo(ChatInfo, checkProps);

//пофиксить отправку сообщения когда саисок пуст