import { FC, useState } from "react";
import styles from './Contacts.module.scss'
import RemoveFromContacts from '../../assets/person-dash.svg'
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { clearSelectedMessage, closeMenu, selectChat } from "../../store/slices/appSlice";
import { CurrentUser } from "../../types/types";

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
    const dispatch = useAppDispatch()
    const isSend = useAppSelector(state => state.app.isSendMessage)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }

    const removeFromContacts = (e: React.MouseEvent) => {
        e.stopPropagation()
        console.log('удалён из контактов')
    }

    const handleClickName = (name: CurrentUser) => {

        if (isSend) {
            console.log('переслал несколько')
            dispatch(closeMenu())
            dispatch(clearSelectedMessage())
            return
        }
        dispatch(selectChat(name))
        dispatch(closeMenu())
    }

    const filter = test.filter(item => item.displayName.includes(name))

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