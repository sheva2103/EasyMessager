import { FC, memo, useEffect, useState } from "react";
import styles from './HomePage.module.scss'
import Avatar from "../Avatar/Avatar";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { Chat, Message1, NoReadMessagesType } from "../../types/types";
import { setChat } from "../../store/slices/setChatIDSlice";
import { messagesAPI, profileAPI } from "../../API/api";
import classNames from "classnames";
import { createMessageList, getChatType, getQuantityNoReadMessages } from "../../utils/utils";
import { onSnapshot, QuerySnapshot } from "firebase/firestore";
import { setMessages } from "../../store/slices/messagesSlice";
import { Alert, Badge, Snackbar } from "@mui/material";
import soundFile from '../../assets/sound.mp3';
import usePresenceStatus from "../../hooks/useCheckOnlineStatus";
import { setOnlineStatusSelectedUser } from "../../store/slices/appSlice";
import { useTypedTranslation } from "../../hooks/useTypedTranslation";
import CallIcon from '../../assets/telephone-fill.svg'
import DialogComponent, { NotFoundChat } from "../Settings/DialogComponent";
import { postTask, subscribe } from "../../utils/workerSingleton";




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
    const [errorConnection, setErrorConnection] = useState(false)
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

    const closeErrorConnection = () => {
        setErrorConnection(false)
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
    //     let unsubscribe: () => void;

    //     if (updateUser.chatID) {
    //         const messagesCollectionRef = getChatType(false, { ...updateUser } as Chat)
    //         unsubscribe = onSnapshot(messagesCollectionRef, (querySnapshot: QuerySnapshot<Message1>) => {
    //             const rawMessagesArray = querySnapshot.docs.map(doc => ({
    //                 ...doc.data()
    //             }))
    //             const list = createMessageList(rawMessagesArray);
    //             const noRead = getQuantityNoReadMessages(list, currentUser.uid);
    //             //handleAudioPlay()
    //             setMessagesList({ messages: list, noRead });
    //         },
    //             (error) => {
    //                 console.log('error connection', error)
    //                 setErrorConnection(true)
    //             }
    //         )
    //     }

    //     return () => {
    //         if (unsubscribe) {
    //             unsubscribe()
    //         }
    //     };

    // }, [updateUser.chatID]); // вариант без воркера !!!!!!!!!!!!!!!!!!!!!

    useEffect(() => {
        let unsubscribeFirestore: (() => void) | undefined;
        let unsubscribeWorker: (() => void) | undefined;

        if (updateUser.chatID) {
            unsubscribeWorker = subscribe(updateUser.chatID, (data) => {
                if ('error' in data) {
                    console.error('Ошибка воркера:', data.error);
                    setErrorConnection(true);
                } else {
                    setMessagesList({ messages: data.list, noRead: data.noRead });
                }
            });

            const messagesCollectionRef = getChatType(false, { ...updateUser } as Chat);
            unsubscribeFirestore = onSnapshot(
                messagesCollectionRef,
                (querySnapshot: QuerySnapshot<Message1>) => {
                    const rawMessagesArray = querySnapshot.docs.map((doc) => ({ ...doc.data() }))
                    postTask(updateUser.chatID!, {
                        rawMessagesArray,
                        currentUserUid: currentUser.uid,
                    });
                },
                (error) => {
                    console.log('error connection', error);
                    setErrorConnection(true);
                }
            );
        }

        return () => {
            if (unsubscribeFirestore) unsubscribeFirestore();
            if (unsubscribeWorker) unsubscribeWorker();
        };
    }, [updateUser.chatID, currentUser.uid])

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

    if (isSelected && errorConnection) return (
        <Snackbar open={errorConnection} autoHideDuration={6000} onClose={closeErrorConnection}>
            <Alert
                onClose={closeErrorConnection}
                severity='error'
                variant="filled"
                sx={{ width: '100%' }}
            >
                Ошибка подключения. Попробуйте позже.
            </Alert>
        </Snackbar>
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