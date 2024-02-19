import { ChangeEvent, FC, useRef, useState } from "react";
import styles from './HomePage.module.scss'
import SendMessageIcon from '../../assets/send-fill.svg'


const InputNewMessage: FC = () => {

    const [message, setMessage] = useState('')
    //const numberOfLines = message.split('\n').length;
    const [rows, amountRows] = useState(1)
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)
    }

    const ref = useRef<HTMLTextAreaElement | null>(null)

    const setRows = () => {

        if(rows === 3) return rows

        if (ref.current?.scrollTop) {
            amountRows(prev => prev + 1)
        }
        return rows
    }


    return (  
        <div className={styles.inputNewMessage}>
            {/* <input type="text" /> */}
            <textarea 
                value={message}
                onChange={handleChange}
                ref={ref}
                rows={setRows()}
                ></textarea>
            <SendMessageIcon fontSize={'2rem'}/>
        </div>
    );
}
 
export default InputNewMessage;