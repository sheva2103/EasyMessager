import styles from './HomePage.module.scss'
import MenuIcon from '../../assets/menu-icon.svg'
import classNames from 'classnames';
import MenuComponent from '../MenuComponent/MenuComponent';
import { useAppDispatch, useAppSelector } from '../../hooks/hook';
import { openMenu, setBlacklist, setChatList, setContacts } from '../../store/slices/appSlice';
import ChatContent from './ChatContent';
import ChatList from './ChatList';
import { useEffect } from 'react';
import { DocumentSnapshot, doc, onSnapshot } from 'firebase/firestore';
import { CurrentUser, Message1 } from '../../types/types';
import { createChatList, createMessageList } from '../../utils/utils';
import { db } from '../../firebase';
import { setMessages } from '../../store/slices/messagesSlice';
import useUserPresence from '../../hooks/useUserPresence';

const HomaPage = () => {

    const dispatch = useAppDispatch()
    const currentUserEmail = useAppSelector(state => state.app.currentUser.email)
    const isFavorites = useAppSelector(state => state.app.isFavorites)

    useUserPresence()

    const onKeyDown = (e: React.KeyboardEvent) => {
        if(e.key === 'Enter') dispatch(openMenu())
    }

    const handleClickMenu = () => {
        dispatch(openMenu())
    }

    useEffect(() => {
        const getContacts = onSnapshot(doc(db, currentUserEmail, "contacts"), (doc: DocumentSnapshot<CurrentUser[]>) => {
            if(doc.data()) dispatch(setContacts(createChatList(doc.data())))
        });
        return () => getContacts()
    }, [currentUserEmail]);

    useEffect(() => {
        if(currentUserEmail) {
            const getChatList = onSnapshot(doc(db, currentUserEmail, "chatList"), (doc: DocumentSnapshot<CurrentUser[]>) => {
                if(doc.data()) dispatch(setChatList(createChatList(doc.data())))
            });
            return () => getChatList()
        }
    }, [currentUserEmail]);
    
    useEffect(() => {
        const getBlackList = onSnapshot(doc(db, currentUserEmail, "blacklist"), (doc: DocumentSnapshot<CurrentUser[]>) => {
            if(doc.data()) dispatch(setBlacklist(createChatList(doc.data())))
        });
        return () => getBlackList()
    }, [currentUserEmail]);

    useEffect(() => {
        let getFavorites: () => void
        if(isFavorites) {
            getFavorites = onSnapshot(doc(db, currentUserEmail, 'favorites'), (doc: DocumentSnapshot<Message1[]>) => {
                if(doc.data()) {
                    const list = createMessageList(doc.data())
                    dispatch(setMessages({messages: list, noRead: {quantity: 0, targetIndex: list.length}}))
                } else {
                    dispatch(setMessages({messages: [], noRead: {quantity: 0, targetIndex: 0}}))
                }
            });
        }
        return () => {
            if(getFavorites) getFavorites()
        }
    }, [isFavorites]);

    return (  
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.chatListContainer}>
                    <div className={classNames(styles.menuIcon, styles.item)}>
                        <MenuIcon 
                            fontSize={'28px'}
                            cursor={'pointer'}
                            onClick={handleClickMenu}
                            onKeyDown={onKeyDown}
                            tabIndex={2}
                        />
                        <div className={styles.title}>
                            <span>EasyMessager</span>
                        </div>
                    </div>
                    <ChatList />
                </div>
                <ChatContent />
                <MenuComponent />
            </div>
        </div>
    );
}

export default HomaPage;