import { ChangeEvent, FC, KeyboardEventHandler, useEffect, useState } from "react";
import styles from './HomePage.module.scss'
import SendMessageIcon from '../../assets/send-fill.svg'
import CloseIcon from '../../assets/closeDesktop.svg'

import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { changeMessage } from "../../store/slices/appSlice";


const InputNewMessage: FC = () => {

    const dispatch = useAppDispatch()
    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const isEditMessage = useAppSelector(state => state.app.changeMessage)
    const [newMessage, setNewMessage] = useState('')
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setNewMessage(e.target.value)
    }

    const [editMessage, setEditMessage] = useState('')
    const handleChangeEditMessage = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setEditMessage(e.target.value)
    }

    const sendMessage = () => {
        console.log(newMessage.trim())
    }

    const sendEditMessage = () => {
        console.log(editMessage.trim())
        dispatch(changeMessage(null))
    }

    const cancelEiting = () => {
        dispatch(changeMessage(null))
    }

    const onKeyDown = (e: KeyboardEvent) => {
        console.log(e.key)
        if(e.key === 'Escape') dispatch(changeMessage(null))
    }

    useEffect(() => {
        if(isEditMessage) {
            window.addEventListener('keydown', onKeyDown)
            setEditMessage(isEditMessage.message)
            return () => window.removeEventListener('keydown', onKeyDown)
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
                        />
                        :
                        <TextareaAutosize 
                            maxRows={3}
                            value={editMessage}
                            onChange={handleChangeEditMessage}
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