import { FC, useState } from "react";
import styles from './Contacts.module.scss'
import RemoveFromContacts from '../../assets/person-dash.svg'
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { clearSelectedMessage, closeMenu, setIsFavorites } from "../../store/slices/appSlice";
import { Chat, CurrentUser } from "../../types/types";
import { contactsAPI, messagesAPI } from "../../API/api";
import { setChat } from "../../store/slices/setChatIDSlice";
import InputComponent from "../../InputComponent/InputComponent";
import { useTypedTranslation } from "../../hooks/useTypedTranslation";

const test: CurrentUser[] = [
    { displayName: 'alexdb', photoURL: '', email: 'test1rt@test.com', uid: 'uhrtugjfghdhc' },
    { displayName: 'alexcbc55555555555555', photoURL: '', email: 'test1fg@test.com', uid: 'uhugjfgfghdhc' },
    { displayName: 'alexvbcx', photoURL: '', email: 'test1cv@test.com', uid: 'uhugjfgcvhdhc' },
    { displayName: 'alexfgdh', photoURL: '', email: 'test1nb@test.com', uid: 'uhugjfgbnhdhc' },
    { displayName: 'alexzzzzc', photoURL: '', email: 'test1sd@test.com', uid: 'usdhugjfghdhc' },
    { displayName: 'alexds', photoURL: '', email: 'test1io@test.com', uid: 'uhugjfghiodhc' },
    { displayName: 'alexvxv', photoURL: '', email: 'test1ti@test.com', uid: 'uhugjfghdtihc' },
    { displayName: 'alexbbbb', photoURL: '', email: 'test1hh@test.com', uid: 'uhugjfghdhhhc' },
    { displayName: 'alexcvxv', photoURL: '', email: 'test1ddg@test.com', uid: 'uhudgdgjfghdhc' },
    { displayName: 'alexxv', photoURL: '', email: 'test1jr@test.com', uid: 'uhugjfghdgdhjdhc' },
    { displayName: 'alexzzzzs', photoURL: '', email: 'test1rw@test.com', uid: 'uhugjwqqfghdhc' },
    { displayName: 'alexvvcvbbb', photoURL: '', email: 'test1dhhj@test.com', uid: 'uhugjddghfghdhc' },
    { displayName: 'alexdgsd', photoURL: '', email: 'test1qqq@test.com', uid: 'uhuqqqgjfghdhc' },
    { displayName: 'alexbbb', photoURL: '', email: 'test1fhfr@test.com', uid: 'uhugjfgjfghdhc' },
    { displayName: 'test1', photoURL: '', email: 'test1dete@test.com', uid: 'uhuhjhggjfghdhc' },
]


const Contacts: FC = () => {

    const [name, setName] = useState('')
    const [sending, setSending] = useState(false)
    const dispatch = useAppDispatch()
    const contactsList = useAppSelector(state => state.app.contacts)
    const isSend = useAppSelector(state => state.app.isSendMessage)
    const selectedMessageList = useAppSelector(state => state.app.selectedMessages)
    const currentUser = useAppSelector(state => state.app.currentUser)
    const {t} = useTypedTranslation()

    const removeFromContacts = (e: React.MouseEvent, contact: Chat) => {
        e.stopPropagation()
        contactsAPI.removeFromContacts(currentUser.email, contact)
        console.log('удалён из контактов')
    }

    const handleClickName = (user: Chat) => {
        if (isSend) {
            const allMessages: Promise<void>[] = []
            selectedMessageList.forEach(item => allMessages.push(messagesAPI.forwardedMessageFrom(currentUser, user, item)))
            setSending(true)
            Promise.all(allMessages)
                .then(() => {
                    dispatch(closeMenu())
                    dispatch(clearSelectedMessage())
                })
                .finally(() => setSending(false))
            return
        }
        dispatch(setChat({currentUserEmail: user.email, guestInfo: user}))
        dispatch(closeMenu())
    }

    const sendToFavorites = () => {
        if(!isSend) {
            dispatch(setIsFavorites(true))
            dispatch(closeMenu())
            return
        }
        const allMessages: Promise<void>[] = []
        selectedMessageList.forEach(item => allMessages.push(messagesAPI.addToFavorites(currentUser.email, item)))
        setSending(true)
            Promise.all(allMessages)
                .then(() => {
                    dispatch(closeMenu())
                    dispatch(clearSelectedMessage())
                })
                .finally(() => setSending(false))
    }

    const filter = contactsList.filter(item => item.displayName.includes(name))

    return (
        <div className={styles.container}>
            <div className={styles.item}>
                <span>{t('contacts')}</span>
            </div>
            <InputComponent classes={styles.item} returnValue={setName}/>
            <div className={styles.item}>
                <ul className={styles.list}>
                    <li onClick={sendToFavorites}><span>{t('favorites')}</span></li>
                    {filter.map((item) => (
                        <li key={String(item.uid)} onClick={() => handleClickName(item)}>
                            <span >{item.displayName}</span>
                            {!isSend && <div title={t('removeFromContacts')}
                                onClick={(e) => removeFromContacts(e, item)}
                            >
                                <RemoveFromContacts />
                            </div>}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Contacts;