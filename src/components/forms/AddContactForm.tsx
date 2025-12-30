import { FC, useEffect, useState } from "react";
import styles from './Styles.module.scss'
import { Chat } from "../../types/types";


const AddContactForm: FC<{ functionPerformed: (user: Chat) => Promise<void>, user: Chat, add?: boolean, change?: boolean }> = ({ functionPerformed, user, add, change }) => {

    const [name, setName] = useState(user?.displayName)
    const [fetching, setFetching] = useState(false)

    useEffect(() => {
        if (change && user.nameWasGiven) setName(user.nameWasGiven)
    }, []);

    const submitContact = () => {
        if (name.length === 0) return
            setFetching(true)
            const contact = { ...user }
            if (user.displayName !== name) contact.nameWasGiven = name
            else delete contact.nameWasGiven
            functionPerformed(contact)
                .catch(() => console.log('error add contact'))
                .finally(() => setFetching(false))
    }

    return (
        <div className={styles.group} style={{ padding: '16px 8px', gap: '8px' }}>
            <div className={styles.item}>
                <input type='text'
                    minLength={1}
                    maxLength={24}
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className={styles.item} style={{ textAlign: 'center' }}>
                <button onClick={submitContact} disabled={fetching}>Добавить</button>
            </div>
        </div>
    );
}

export default AddContactForm;