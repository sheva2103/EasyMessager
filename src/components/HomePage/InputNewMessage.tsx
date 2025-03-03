import { ChangeEvent, FC, KeyboardEventHandler, useEffect, useMemo, useRef, useState } from "react";
import styles from './HomePage.module.scss'
import SendMessageIcon from '../../assets/send-fill.svg'
import CloseIcon from '../../assets/closeDesktop.svg'

import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { changeMessage, setEmojiState, setSelectedEmoji } from "../../store/slices/appSlice";
import { messagesAPI } from "../../API/api";
import { createNewDate } from "../../utils/utils";
import { Chat } from "../../types/types";
import EmojiIcon from '../../assets/emoji-smile-fill.svg'

type Props = {
    chatInfo: Chat
}

const EmojiControl: FC = () => {

    const dispatch = useAppDispatch()
    const isOpen = useAppSelector(state => state.app.emojiIsOpen)
    const handleClick = () => isOpen ? dispatch(setEmojiState(false)) : dispatch(setEmojiState(true))

    return (
        <div className={styles.inputNewMessage__activateEmoji} title='emoji'>
            <EmojiIcon fontSize={'1.2rem'} cursor={'pointer'} onClick={handleClick}/>
        </div>
    );
}


const InputNewMessage: FC<Props> = ({ chatInfo }) => {

    const dispatch = useAppDispatch()
    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const currentUser = useAppSelector(state => state.app.currentUser)
    const isEditMessage = useAppSelector(state => state.app.changeMessage)
    const selectedEmoji = useAppSelector(state => state.app.selectedEmoji)

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
        messagesAPI.sendEditMessage(chatInfo.chatID, { ...isEditMessage, message: editMessage })
            .then(() => dispatch(changeMessage(null)))
    }

    const cancelEiting = () => {
        dispatch(changeMessage(null))
    }

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

    useEffect(() => {
        if(selectedEmoji) {
            !isEditMessage ? setNewMessage(prev => prev + selectedEmoji) : setEditMessage(prev => prev + selectedEmoji)
            refTextarea.current.focus()
        }
        dispatch(setSelectedEmoji(''))
    }, [selectedEmoji]);

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
                <EmojiControl />
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