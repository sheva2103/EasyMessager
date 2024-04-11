import { ChangeEvent, FC, KeyboardEventHandler, useEffect, useMemo, useRef, useState } from "react";
import styles from './HomePage.module.scss'
import SendMessageIcon from '../../assets/send-fill.svg'
import CloseIcon from '../../assets/closeDesktop.svg'

import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { changeMessage } from "../../store/slices/appSlice";
import { messagesAPI } from "../../API/api";
import { createNewDate } from "../../utils/utils";
import { Chat } from "../../types/types";
import MessagesAreProhibited from "./MessagesAreProhibited";

type Props = {
    chatInfo: Chat
}

const InputNewMessage: FC<Props> = ({ chatInfo }) => {



    const dispatch = useAppDispatch()
    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const currentUser = useAppSelector(state => state.app.currentUser)
    const isEditMessage = useAppSelector(state => state.app.changeMessage)
    const blackList = useAppSelector(state => state.app.blackList)

    const isBlackList = useMemo(() => blackList.some(item => item.email === chatInfo.email), [blackList.length])
    const [newMessage, setNewMessage] = useState('')
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setNewMessage(e.target.value)
    }
    const refTextarea = useRef<HTMLTextAreaElement>(null)

    const [editMessage, setEditMessage] = useState('')
    const handleChangeEditMessage = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setEditMessage(e.target.value)
    }

    const sendMessage = () => {
        if (!newMessage.trim()) return
        Promise.all([messagesAPI.addChat(currentUser.email, selectedChat, chatInfo.chatID), messagesAPI.addChat(selectedChat.email, currentUser, chatInfo.chatID)])
            .then(() => messagesAPI.sendMessage(chatInfo.chatID, currentUser, newMessage))
            .then(() => setNewMessage(''))
    }

    const sendEditMessage = () => {
        if (!editMessage.trim()) return
        //console.log(editMessage.trim())
        messagesAPI.sendEditMessage(chatInfo.chatID, { ...isEditMessage, message: editMessage, changed: createNewDate() })
            .then(() => dispatch(changeMessage(null)))
    }

    const cancelEiting = () => {
        dispatch(changeMessage(null))
    }

    const onKeyDown = (e: KeyboardEvent) => {
        console.log(e.key)
        if (e.key === 'Escape') dispatch(changeMessage(null))
    }

    useEffect(() => {
        if (isEditMessage) {
            window.addEventListener('keydown', onKeyDown)
            setEditMessage(isEditMessage.message)
            refTextarea.current.focus()
            return () => window.removeEventListener('keydown', onKeyDown)
        }

    }, [isEditMessage]);

    useEffect(() => {
        dispatch(changeMessage(null))
    }, [selectedChat]);

    return (
        <div className={styles.inputNewMessage}>
            {!isBlackList ?
                <><div className={styles.inputNewMessage__textarea}>
                    {isEditMessage &&
                        <div className={styles.textarea__isEdit}>
                            <span>Редактирование</span>
                            <CloseIcon onClick={cancelEiting} />
                        </div>
                    }
                    {!isEditMessage ?
                        <TextareaAutosize
                            maxRows={3}
                            value={newMessage}
                            onChange={handleChange}
                        />
                        :
                        <TextareaAutosize
                            maxRows={3}
                            value={editMessage}
                            onChange={handleChangeEditMessage}
                            ref={refTextarea}
                        />
                    }
                </div>
                    <div className={styles.inputNewMessage__button}>
                        <SendMessageIcon
                            fontSize={'2rem'}
                            cursor={'pointer'}
                            onClick={!isEditMessage ? sendMessage : sendEditMessage}
                        />
                    </div></>
                :
                <MessagesAreProhibited />
            }
        </div>
    );
}

export default InputNewMessage;