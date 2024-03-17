import { FC, useState } from "react";
import styles from './Contacts.module.scss'
import RemoveFromContacts from '../../assets/person-dash.svg'
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { clearSelectedMessage, closeMenu, selectChat } from "../../store/slices/appSlice";

const test = [
    { name: 'alex' },
    { name: 'alex1' },
    { name: 'alex2' },
    { name: 'alex3' },
    { name: 'alex4' },
    { name: 'alex5' },
    { name: 'alex6' },
    { name: 'alex7' },
    { name: 'alex8' },
    { name: 'alex9' },
    { name: 'alex10' },
    { name: 'alex11mmmmmmmmmmmmmm' },
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

    const handleClickName = (name: string) => {

        if (isSend) {
            console.log('переслал несколько')
            dispatch(closeMenu())
            dispatch(clearSelectedMessage())
            return
        }
        dispatch(selectChat(name))
        dispatch(closeMenu())
    }

    const filter = test.filter(item => item.name.includes(name))

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
                        <li key={String(item.name + index)} onClick={() => handleClickName(item.name)}>
                            <span >{item.name}</span>
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