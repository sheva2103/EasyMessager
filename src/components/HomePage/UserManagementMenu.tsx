import { FC, memo, useCallback, useEffect, useMemo, useState } from "react";
import MenuIcon from '../../assets/menu.svg'
import styles from './HomePage.module.scss'
import classNames from "classnames";
import { Chat } from "../../types/types";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { contactsAPI, messagesAPI } from "../../API/api";
import { closeBar, setLoadChat, setSearchMessages } from "../../store/slices/appSlice";
import { setChat } from "../../store/slices/setChatIDSlice";
import { SETTINGS, SHOW_CHANNEL_INFO } from "../../constants/constants";

type Props = {
    chatInfo: Chat
}

const UserManagementMenu: FC<Props> = ({ chatInfo }) => {

    const [isOpen, setOpen] = useState(false)
    const currentUser = useAppSelector(state => state.app.currentUser)
    const contactsList = useAppSelector(state => state.app.contacts)
    const blackList = useAppSelector(state => state.app.blackList)
    const myChatList = useAppSelector(state => state.app.chatsList)
    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const isFavorites = useAppSelector(state => state.app.isFavorites)
    const dispatch = useAppDispatch()
    const [animationOpen, setAnimationOpen] = useState(false)

    const addToContacts = () => {
        contactsAPI.addToContacts(currentUser.email, chatInfo)
            .then(() => setOpen(false))
    }

    const deleteContact = () => {
        contactsAPI.removeFromContacts(currentUser.email, chatInfo)
            .then(() => setOpen(false))
    }

    const addToBlacklist = () => {
        contactsAPI.addToBlacklist(currentUser.email, chatInfo)
            .then(() => setOpen(false))
    }

    const removeFromBlacklist = () => {
        contactsAPI.removeFromBlacklist(currentUser.email, chatInfo)
            .then(() => setOpen(false))
    }

    const clearChat = () => {
        dispatch(setLoadChat(true))
        messagesAPI.clearChat(selectedChat, isFavorites)
            .then(() => setOpen(false))
            .catch(error => console.log(error))
            .finally(() => dispatch(setLoadChat(false)))
    }

    const deleteChat = () => {
        messagesAPI.deleteChat(currentUser, selectedChat)
            .then(() => {
                setOpen(false)
                dispatch(setChat(null))
            })
            .catch(error => console.log('ошибка удаления чата >>>>>', error))
    }

    const subscribe = () => {
        messagesAPI.addChat(currentUser, selectedChat)
            .then(() => setOpen(false))
            .catch((err) => console.log('Произошла ошибка', err))
    }

    const unsubscribe = () => {
        messagesAPI.deleteChat(currentUser, selectedChat)
            .then(() => setOpen(false))
            .catch((err) => console.log('Произошла ошибка', err))
    }

    const showSearchMessages = () => {
        dispatch(setSearchMessages(true))
        setOpen(false)
    }

    const showInformation = () => {
        setOpen(false)
        dispatch(closeBar(SHOW_CHANNEL_INFO))
    }

    const isContact = useMemo(() => contactsList.some(item => item.email === chatInfo.email), [selectedChat, contactsList.length])
    const isBlackList = useMemo(() => blackList.some(item => item.email === chatInfo.email), [blackList.length, selectedChat])
    const isMyChat = useMemo(() => myChatList.some(item => item.uid === chatInfo.channel?.channelID), [myChatList.length, selectedChat])

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') setOpen(!isOpen)
    }

    const setMenu = () => {
        setAnimationOpen(false)
        // setTimeout(() => setOpen(!isOpen), 180)
        setOpen(!isOpen)
    }

    useEffect(() => {
        //setTimeout(() => setAnimationOpen(true), 10000)
        if (isOpen) setAnimationOpen(true)
        return () => setAnimationOpen(false)
    }, [isOpen]);

    const targetNode = () => {
        if (isFavorites) return (
            <ul>
                <li onClick={showSearchMessages}>Поиск</li>
                <li onClick={clearChat}>Очистить историю</li>
            </ul>
        )
        else if (selectedChat?.channel) return (
            <ul>
                <li onClick={showSearchMessages}>Поиск</li>
                {isMyChat ?
                    <li onClick={unsubscribe}>Покинуть канал</li>
                    :
                    <li onClick={subscribe}>Подписаться</li>
                }
                <li onClick={showInformation}>Информация</li>
                
            </ul>
        )
        else return (
            <ul>
                <li onClick={showSearchMessages}>Поиск</li>
                {isContact ?
                    <li onClick={deleteContact}>Удалить из контактов</li>
                    :
                    <li onClick={addToContacts}>Добавить в контакты</li>
                }
                {isBlackList ?
                    <li onClick={removeFromBlacklist}>Удалить из ЧС</li>
                    :
                    <li onClick={addToBlacklist}>Добавить в ЧС</li>
                }
                <li onClick={clearChat}>Очистить историю</li>
                <li onClick={deleteChat}>Удалить чат</li>
            </ul>
        )
    }


    return (
        <>
            <div
                className={classNames(styles.menu__cover, { [styles.menu_show]: isOpen }, { [styles.animationCover]: animationOpen })}
                onClick={setMenu}
            ></div>
            <div className={styles.menu__button}>
                <MenuIcon
                    cursor={'pointer'}
                    fontSize={'1.3rem'}
                    onClick={() => setOpen(!isOpen)}
                    onKeyDown={onKeyDown}
                    tabIndex={8}
                />
                <div className={classNames(styles.menu__list, { [styles.menu_show]: isOpen }, { [styles.animationMenu]: animationOpen })}>
                    {targetNode()}
                </div>
            </div>
        </>
    );
}

export default UserManagementMenu;