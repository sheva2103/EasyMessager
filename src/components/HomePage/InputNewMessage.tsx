import { ChangeEvent, FC, useRef, useState } from "react";
import styles from './HomePage.module.scss'
import SendMessageIcon from '../../assets/send-fill.svg'

const InputNewMessage: FC = () => {

    const [message, setMessage] = useState('')
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)
    }

    const sendMessage = () => {
        console.log(message.trim())
    }

    return (  
        <div className={styles.inputNewMessage}>
            <textarea 
                value={message}
                onChange={handleChange}
                rows={2}
                ></textarea>
            <SendMessageIcon fontSize={'2rem'} onClick={sendMessage}/>
        </div>
    );
}

export default InputNewMessage;