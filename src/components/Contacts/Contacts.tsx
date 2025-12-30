import { FC, useState } from "react";
import styles from './Contacts.module.scss'
import RemoveFromContacts from '../../assets/person-dash.svg'
import ChangeContactIcon from '../../assets/change.svg'
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { clearSelectedMessage, closeMenu, setIsFavorites, setTempChat } from "../../store/slices/appSlice";
import { Chat, CurrentUser } from "../../types/types";
import { contactsAPI, messagesAPI } from "../../API/api";
import InputComponent from "../../InputComponent/InputComponent";
import { useTypedTranslation } from "../../hooks/useTypedTranslation";
import Preloader from '../../assets/preloader.svg'
import pLimit from 'p-limit'
import DialogComponent from "../Settings/DialogComponent";
import AddContactForm from "../forms/AddContactForm";

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

const CONCURRENCY_LIMIT = 3;
const limit = pLimit(CONCURRENCY_LIMIT)


const Contacts: FC = () => {

    const [name, setName] = useState('')
    const [sending, setSending] = useState(false)
    const [isOpenDialog, setIsOpenDialog] = useState({isOpen: false, contact: null})
    const dispatch = useAppDispatch()
    const contactsList = useAppSelector(state => state.app.contacts)
    const isSend = useAppSelector(state => state.app.isSendMessage)
    const selectedMessageList = useAppSelector(state => state.app.selectedMessages)
    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const currentUser = useAppSelector(state => state.app.currentUser)
    const { t } = useTypedTranslation()

    const removeFromContacts = (e: React.MouseEvent, contact: Chat) => {
        e.stopPropagation()
        contactsAPI.removeFromContacts(currentUser.email, contact)
        console.log('удалён из контактов')
    }

    const handleClickName = (user: Chat) => {
        if (isSend) {
            setSending(true)

            const limitedPromises = selectedMessageList.map(item =>
                limit(() => messagesAPI.forwardedMessageFrom(currentUser, user, item))
            )

            Promise.all(limitedPromises)
                .then(() => setSending(false))
                .finally(() => {
                    dispatch(closeMenu())
                    dispatch(clearSelectedMessage())
                })
            return
        }
        if(selectedChat?.uid === user.uid) {
            dispatch(closeMenu())
            return
        }
        dispatch(setTempChat(user))
        dispatch(closeMenu())
    }

    const sendToFavorites = () => {
        if (!isSend) {
            dispatch(setIsFavorites(true))
            dispatch(closeMenu())
            return
        }

        const limitedPromises = selectedMessageList.map(item =>
            limit(() => messagesAPI.addToFavorites(currentUser, item))
        )

        setSending(true)
        Promise.all(limitedPromises)
            .then(() => setSending(false))
            .finally(() => {
                dispatch(closeMenu())
                dispatch(clearSelectedMessage())
            })
    }

    const changeContact = async(contact: Chat) => {
        contactsAPI.changeContact({myEmail: currentUser.email, contact})
            .then(() => setIsOpenDialog({isOpen: false, contact: null}))
            .catch(err => console.log('error change contact', err))
    }

    const changeDialogState = (action: boolean ,contact: Chat = null) => {
        setIsOpenDialog((prev) => ({
            contact,
            isOpen: action
        }))
    }

    const filter = contactsList.filter(item => item.displayName.includes(name))

    return (
        <div className={styles.container}>
            {sending && <div className={styles.container__preloader}><Preloader fontSize={'2rem'} /></div>}
            <div className={styles.item}>
                <span>{t('contacts')}</span>
            </div>
            <InputComponent classes={styles.item} returnValue={setName} />
            <div className={styles.item}>
                <ul className={styles.list}>
                    <li onClick={sendToFavorites}><span>{t('favorites')}</span></li>
                    {filter.map((item) => (
                        <li key={String(item.uid)} onClick={() => handleClickName(item)}>
                            <span >{item?.nameWasGiven || item.displayName}</span>
                            <div className={styles.buttonBlock}>
                                {!isSend &&
                                    <div title={t('change')} onClick={(e) => {
                                        e.stopPropagation()
                                        changeDialogState(true ,item)
                                    }}>
                                        <ChangeContactIcon />
                                    </div>
                                }
                                {!isSend && <div title={t('removeFromContacts')}
                                    onClick={(e) => removeFromContacts(e, item)}
                                >
                                    <RemoveFromContacts />
                                </div>}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <DialogComponent onClose={changeDialogState} isOpen={isOpenDialog.isOpen}>
                <AddContactForm functionPerformed={changeContact} user={isOpenDialog.contact} change/>
            </DialogComponent>
        </div>
    );
}

export default Contacts;