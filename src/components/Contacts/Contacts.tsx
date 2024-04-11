import { FC, useState } from "react";
import styles from './Contacts.module.scss'
import RemoveFromContacts from '../../assets/person-dash.svg'
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { clearSelectedMessage, closeMenu } from "../../store/slices/appSlice";
import { Chat, CurrentUser } from "../../types/types";
import { messagesAPI } from "../../API/api";
import { setChat } from "../../store/slices/setChatIDSlice";

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }

    const removeFromContacts = (e: React.MouseEvent) => {
        e.stopPropagation()
        console.log('удалён из контактов')
    }

    //настроить прелоадер для загрузки и отображение пересланых сообщений


    const handleClickName = (user: Chat) => {

        if (isSend) {
            console.log('переслал несколько')
            const allMessages: Promise<void>[] = []
            selectedMessageList.forEach(item => allMessages.push(messagesAPI.forwardedMessageFrom(user.chatID, currentUser,item.message, item.sender)))
            setSending(true)
            Promise.all(allMessages)
                .then(() => {
                    dispatch(closeMenu())
                    dispatch(clearSelectedMessage())
                })
                .finally(() => setSending(false))
            //dispatch(closeMenu())
            //dispatch(clearSelectedMessage())
            return
        }
        //dispatch(selectChat(user))
        dispatch(setChat({currentUserEmail: user.email, guestInfo: user}))
        dispatch(closeMenu())
    }

    //const filter = test.filter(item => item.displayName.includes(name))
    const filter = contactsList.filter(item => item.displayName.includes(name))

    return (
        <div className={styles.container}>
            <div className={styles.item}>
                <span>Контакты</span>
            </div>
            <div className={styles.item}>
                <input type="text"
                    value={name}
                    onChange={handleChange}
                />
            </div>
            <div className={styles.item}>
                <ul className={styles.list}>
                    {!contactsList.length && <span>Контакты не найдены</span>}
                    {filter.map((item, index) => (
                        <li key={String(item.uid)} onClick={() => handleClickName(item)}>
                            <span >{item.displayName}</span>
                            {!isSend && <div title="Удалить из друзей"
                                onClick={removeFromContacts}
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