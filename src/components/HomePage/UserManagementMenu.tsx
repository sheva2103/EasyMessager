import { FC, memo, useCallback, useMemo, useState } from "react";
import MenuIcon from '../../assets/menu.svg'
import styles from './HomePage.module.scss'
import classNames from "classnames";
import { Chat } from "../../types/types";
import { useAppSelector } from "../../hooks/hook";
import { contactsAPI } from "../../API/api";

type Props = {
    chatInfo: Chat
}

const UserManagementMenu: FC<Props> = ({chatInfo}) => {

    const [isOpen, setOpen] = useState(false)
    const currentUserEmail = useAppSelector(state => state.app.currentUser.email)
    const contactsList = useAppSelector(state => state.app.contacts)
    const blackList = useAppSelector(state => state.app.blackList)

    const addToContacts = () => {
        contactsAPI.addToContacts(currentUserEmail, chatInfo)
            .then(() => setOpen(false))
    }

    const deleteContact = () => {
        contactsAPI.removeFromContacts(currentUserEmail, chatInfo)
            .then(() => setOpen(false))
    }

    const addToBlacklist = () => {
        contactsAPI.addToBlacklist(currentUserEmail, chatInfo)
            .then(() => setOpen(false))
    }

    const removeFromBlacklist = () => {
        contactsAPI.removeFromBlacklist(currentUserEmail, chatInfo)
            .then(() => setOpen(false))
    }

    const isContact = useMemo(() => contactsList.some(item => item.email === chatInfo.email), [contactsList.length])
    const isBlackList = useMemo(() => blackList.some(item => item.email === chatInfo.email), [blackList.length])

    const onKeyDown = (e: React.KeyboardEvent) => {
        if(e.key === 'Enter') setOpen(!isOpen)
    }

    const setMenu = () => {
        setOpen(!isOpen)
    }

    return (  
        <>
            <div 
                className={classNames(styles.menu__cover, {[styles.menu_show]: isOpen})}
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
                <div className={classNames(styles.menu__list, {[styles.menu_show]: isOpen})}>
                    <ul>
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
                        
                    </ul>
                </div>
            </div>
        </>
    );
}

export default UserManagementMenu;