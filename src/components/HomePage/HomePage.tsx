import styles from './HomePage.module.scss'
import MenuIcon from '../../assets/menu-icon.svg'
import classNames from 'classnames';
import MenuComponent from '../MenuComponent/MenuComponent';
import { useAppDispatch, useAppSelector } from '../../hooks/hook';
import { openMenu, setBlacklist, setContacts } from '../../store/slices/appSlice';
import ChatContent from './ChatContent';
import ChatList from './ChatList';
import { useEffect } from 'react';
import { DocumentSnapshot, doc, onSnapshot } from 'firebase/firestore';
import { CurrentUser } from '../../types/types';
import { createChatList } from '../../utils/utils';
import { db } from '../../firebase';

const HomaPage = () => {

    const dispatch = useAppDispatch()
    const currentUserEmail = useAppSelector(state => state.app.currentUser.email)

    const onKeyDown = (e: React.KeyboardEvent) => {
        if(e.key === 'Enter') dispatch(openMenu())
    }

    const handleClickMenu = () => {
        dispatch(openMenu())
    }

    useEffect(() => {
        const getContacts = onSnapshot(doc(db, currentUserEmail, "contacts"), (doc: DocumentSnapshot<CurrentUser[]>) => {
            //console.log("contacts: ", doc.data());
            if(doc.data()) dispatch(setContacts(createChatList(doc.data())))
        });
        return () => getContacts()
    }, [currentUserEmail]);

    useEffect(() => {
        const getBlacklist = onSnapshot(doc(db, currentUserEmail, "blacklist"), (doc: DocumentSnapshot<CurrentUser[]>) => {
            console.log("blacklist: ", doc.data());
            if(doc.data()) dispatch(setBlacklist(createChatList(doc.data())))
        });
        return () => getBlacklist()
    }, [currentUserEmail]);

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