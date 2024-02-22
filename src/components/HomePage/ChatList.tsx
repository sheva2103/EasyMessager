import { FC, useState } from "react";
import styles from './HomePage.module.scss'
import ChatInfo from "./ChatInfo";


const chats = [
    {name: 'alexdb', url: ''},
    {name: 'alexcbc', url: ''},
    {name: 'alexvbcx', url: ''},
    {name: 'alexzzzzc', url: ''},
    {name: 'alexfgdh', url: ''},
    {name: 'alexds', url: ''},
    {name: 'alexvxv', url: ''},
    {name: 'alexbbbb', url: ''},
    {name: 'alexcvxv', url: ''},
    {name: 'alexxv', url: ''},
    {name: 'alexzzzzs', url: ''},
    {name: 'alexvvcvbbb', url: ''},
    {name: 'alexdgsd', url: ''},
    {name: 'alexbbb', url: ''},
]

const ChatList1: FC = () => {

    const [name, setName] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }

    const filter = chats.filter(item => item.name.includes(name))

    console.log('filter')

    return (
        <>
            <div className={styles.item}>
                <div className={styles.blockInput}>
                    <input type="text" value={name} onChange={handleChange}/>
                </div>
            </div>
            <div style={{ height: 'calc(100% - 134px)' }}>
                <ul className={styles.chatList}>
                    {filter.map((item, index) => (
                        <ChatInfo key={String(item.name + index)}
                            name={item.name}
                            url={item.url} />
                    ))}
                </ul>
            </div>
        </>
    );
}

export default ChatList1;