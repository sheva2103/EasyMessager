import { FC, memo, useCallback, useEffect, useMemo, useState } from "react";
import MenuIcon from '../../assets/menu.svg'
import styles from './HomePage.module.scss'
import classNames from "classnames";
import { Chat, CurrentUser } from "../../types/types";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { channelAPI, contactsAPI, messagesAPI } from "../../API/api";
import { closeBar, setLoadChat, setSearchMessages } from "../../store/slices/appSlice";
import { setChat } from "../../store/slices/setChatIDSlice";
import { ADD_TO_LIST_SUBSCRIBERS, SETTINGS, SHOW_CHANNEL_INFO } from "../../constants/constants";
import { Badge } from "@mui/material";
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";
import DialogComponent from "../Settings/DialogComponent";

type Props = {
    chatInfo: Chat
}

const ListItem: FC<{ user: CurrentUser }> = ({ user }) => {

    const channelId = useAppSelector(state => state.app.selectedChannel.channelID)
    const add = async() => {
        //await channelAPI.changeListSubscribers(ADD_TO_LIST_SUBSCRIBERS, channelId, user) - вместо этого вызвать addChat
        await channelAPI.deleteApplication(channelId, user)
    }
    const deleteRequest = () => {
        channelAPI.deleteApplication(channelId, user)
    }

    return (
        <li>
            <span>{user.displayName}</span>
            <div style={{display: 'flex', gap: '6px'}}>
                <button onClick={add} style={{minWidth: '28px', fontWeight: 'bold'}} title="Добавить">+</button>
                <button onClick={deleteRequest} style={{minWidth: '28px', fontWeight: 'bold'}} title="Удалить">--</button>
            </div>
        </li>
    );
}

const ListRequests: FC<{quantity: CurrentUser[]}> = ({quantity}) => {
    return (
        <ul>
            {quantity.map(item => <ListItem user={item} key={item.uid} />)}
        </ul>
    )
}

const MembershipApplications: FC<{ quantity: CurrentUser[] }> = ({ quantity }) => {

    const [isOpen, setOpen] = useState(false)
    const openList = () => setOpen(true)

    if (quantity) return (
        <li style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
            <span onClick={openList}>Заявки</span>
            <div><Badge badgeContent={quantity.length} color="error" /></div>
            {isOpen &&
                <DialogComponent isOpen={isOpen} onClose={setOpen}>
                    <ListRequests quantity={quantity}/>
                </DialogComponent>
            }
        </li>
    )
}

const selectApplyForMembership = createSelector(
    [(state: RootState) => state.app.selectedChannel?.applyForMembership],
    (applyForMembership) => applyForMembership ?? []
)


const UserManagementMenu: FC<Props> = ({ chatInfo }) => {

    const [isOpen, setOpen] = useState(false)
    const currentUser = useAppSelector(state => state.app.currentUser)
    const contactsList = useAppSelector(state => state.app.contacts)
    const blackList = useAppSelector(state => state.app.blackList)
    const myChatList = useAppSelector(state => state.app.chatsList)
    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const isFavorites = useAppSelector(state => state.app.isFavorites)
    const quantity = useAppSelector(selectApplyForMembership)

    const dispatch = useAppDispatch()
    const [animationOpen, setAnimationOpen] = useState(false)
    const isOwner = currentUser.uid === chatInfo?.channel?.owner.uid

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
                    !isOwner && <li onClick={unsubscribe}>Покинуть канал</li>
                    :
                    <li onClick={subscribe}>Подписаться</li>
                }
                <li onClick={showInformation}>Информация</li>
                {isOwner && <MembershipApplications quantity={quantity} />}

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

    console.log(quantity)


    return (
        <>
            <div
                className={classNames(styles.menu__cover, { [styles.menu_show]: isOpen }, { [styles.animationCover]: animationOpen })}
                onClick={setMenu}
            ></div>
            <div className={styles.menu__button}>
                <div className={styles.menu__icon}>
                    <MenuIcon
                        cursor={'pointer'}
                        fontSize={'1.3rem'}
                        onClick={() => setOpen(!isOpen)}
                        onKeyDown={onKeyDown}
                        tabIndex={8}
                    />
                    {Boolean(quantity.length) && isOwner && <div className={styles.menu__indicator}></div>}
                </div>
                <div className={classNames(styles.menu__list, { [styles.menu_show]: isOpen }, { [styles.animationMenu]: animationOpen })}>
                    {targetNode()}
                </div>
            </div>
        </>
    );
}

export default UserManagementMenu;