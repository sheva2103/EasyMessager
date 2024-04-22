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

type Props = {
    chatInfo: Chat
}

const InputNewMessage: FC<Props> = ({ chatInfo }) => {



    const dispatch = useAppDispatch()
    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const currentUser = useAppSelector(state => state.app.currentUser)
    const isEditMessage = useAppSelector(state => state.app.changeMessage)

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
        console.log('send message', !newMessage.trim())
        if (!newMessage.trim()) return
        Promise.all([messagesAPI.addChat(currentUser.email, selectedChat, chatInfo.chatID), messagesAPI.addChat(selectedChat.email, currentUser, chatInfo.chatID)])
            .then(() => messagesAPI.sendMessage(chatInfo.chatID, currentUser, newMessage))
            .then(() => setNewMessage(''))
    }

    const sendEditMessage = () => {
        if (!editMessage.trim()) return
        messagesAPI.sendEditMessage(chatInfo.chatID, { ...isEditMessage, message: editMessage, changed: createNewDate() })
            .then(() => dispatch(changeMessage(null)))
    }

    const cancelEiting = () => {
        dispatch(changeMessage(null))
    }

    // const onKeyDown = (e: KeyboardEvent) => {
    //     console.log(e.key)
    //     if (e.key === 'Escape') dispatch(changeMessage(null))
    // }

    // useEffect(() => {
    //     if (isEditMessage) {
    //         window.addEventListener('keydown', onKeyDown)
    //         setEditMessage(isEditMessage.message)
    //         refTextarea.current.focus()
    //         return () => window.removeEventListener('keydown', onKeyDown)
    //     }

    // }, [isEditMessage]);

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isEditMessage) dispatch(changeMessage(null))
        if (document.activeElement === refTextarea.current && e.key === 'Enter' && !isEditMessage) {
            sendMessage()
            refTextarea.current.blur()
        }
        if (document.activeElement === refTextarea.current && e.key === 'Enter' && isEditMessage) {
            sendEditMessage()
            refTextarea.current.blur()
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown)
        return () => {
            //console.log('снимаю слушатель')
            return window.removeEventListener('keydown', onKeyDown)
        }
    }, [newMessage, editMessage, isEditMessage]);

    useEffect(() => {
        if (isEditMessage) {
            setEditMessage(isEditMessage.message)
            refTextarea.current.focus()
        }
    }, [isEditMessage]);

    useEffect(() => {
        dispatch(changeMessage(null))
    }, [selectedChat]);

    return (
        <div className={styles.inputNewMessage}>
            <div className={styles.inputNewMessage__textarea}>
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
                        ref={refTextarea}
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
            </div>
        </div>
    );
}

export default InputNewMessage;