import { FC, memo, useEffect, useState } from "react";
import styles from './HomePage.module.scss'
import Avatar from "../Avatar/Avatar";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { Chat, MessageType } from "../../types/types";
import { setChat } from "../../store/slices/setChatIDSlice";
import { profileAPI } from "../../API/api";
import classNames from "classnames";
import { makeChatId } from "../../utils/utils";
import { Alert, Badge, Snackbar } from "@mui/material";
import soundFile from '../../assets/sound.mp3';
import usePresenceStatus from "../../hooks/useCheckOnlineStatus";
import { setOnlineStatusSelectedUser } from "../../store/slices/appSlice";
import { useTypedTranslation } from "../../hooks/useTypedTranslation";
import CallIcon from '../../assets/telephone-fill.svg'
import DialogComponent, { NotFoundChat } from "../Settings/DialogComponent";
import { useChatPreview } from "../../hooks/useChatPreview";




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

export const PreviewLastMessage: FC<{ message: MessageType, currentUserId: string }> = ({ message, currentUserId }) => {

    const { t } = useTypedTranslation()
    const isErrorColor = (message?.callStatus === 'rejected' || message?.callStatus === 'unanswered') && message.sender.uid !== currentUserId

    const targetEl = () => {
        if(message?.shareChat) return (
            <div className={styles.lastMessage} style={{color: "#8774e1"}}>
                <span>{t('contacts')}</span>
            </div>
        )
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
    const [fetchingCurrentInfo, setFetchingCurrentInfo] = useState(true)
    const [notFoundUser, setNotFoundUser] = useState(false)
    const dispatch = useAppDispatch()
    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const currentUser = useAppSelector(state => state.app.currentUser)
    const isContact = useAppSelector(state => state.app.contacts.find(c => c.uid === user.uid))
    const handleClick = () => {
        if (selectedChat?.uid === updateUser.uid) return
        dispatch(setChat({ currentUser: currentUser, guestInfo: updateUser }))
    }
    const isSelected = selectedChat?.uid === user.uid
    const presence = usePresenceStatus(updateUser.uid)

    const { lastMessage, unreadCount } = useChatPreview(user, currentUser.uid)

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
                const chatID = makeChatId({currentUser, guestInfo: updateUser})
                if (currentInfo) {
                    if (chatID && (user.displayName !== currentInfo.displayName || user.photoURL !== currentInfo.photoURL)) {
                        await profileAPI.updateUserInMyChatList(currentUser.email, currentInfo)
                    }
                    setUpdateUser(() => {
                        const user: Chat = {...currentInfo, chatID}
                        if(isContact && isContact?.nameWasGiven) user.nameWasGiven = isContact.nameWasGiven
                        return user
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
                    <span className={styles.name}>{updateUser?.nameWasGiven || updateUser.displayName}</span>
                </div>
                <PreviewLastMessage message={lastMessage} currentUserId={currentUser.uid} />
            </div>
            <div className={styles.chatInfo__noRead}>
                <Badge badgeContent={unreadCount} color="primary" />
            </div>

        </li>
    );
}

function checkProps(prevProps: Chat, nextProps: Chat): boolean {
    return prevProps.displayName === nextProps.displayName
}
export default memo(ChatInfo, checkProps);