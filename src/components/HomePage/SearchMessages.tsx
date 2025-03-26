import { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import { Message1 } from "../../types/types";
import styles from './HomePage.module.scss'
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { setSearchMessages } from "../../store/slices/appSlice";
import { searchMessagesInList } from "../../utils/utils";
import { useDebounce } from 'use-debounce';

type Props = {
    list: Message1[],
    setList: (list: Message1[]) => void
}

const SearchMessages: FC<Props> = ({ list, setList }) => {

    const [text, setText] = useState('')
    const isOpen = useAppSelector(state => state.app.isSearchMessage)
    const [cache, setCache] = useState([])
    const [debouncedText] = useDebounce(text, 1000);
    const inputRefContainer = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const dispatch = useAppDispatch()
    const show = () => {
        if (inputRefContainer.current) {
            inputRef.current.focus()
            inputRefContainer.current.style.width = '100%'
        }
    }
    const hide = () => {
        if (inputRefContainer.current) inputRefContainer.current.style.width = '10px'
        //setList(cache)
        setTimeout(() => {
            if (text.length) setText('')
            dispatch(setSearchMessages(false))
        }, 500)
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value)
    }

    // useEffect(() => {
    //     setCache(list)
    // }, []);

    useEffect(() => {
        const delay = setTimeout(show, 100)
        return () => clearTimeout(delay)
    }, [isOpen]);

    // useEffect(() => {
    //     if (debouncedText) {
    //         console.log('Поиск по:');
    //         const result = searchMessagesInList(list, text)
    //         if(result.length) setList(result)
    //     }
    // }, [debouncedText]);

    if (!isOpen) return null

    return (
        <div className={styles.searchMessages}>
            <div className={styles.searchMessages_container}>
                <div className={styles.searchMessages_input} ref={inputRefContainer}>
                    <input
                        type="text"
                        ref={inputRef}
                        value={text}
                        onChange={handleChange}
                    />
                </div>
                <div className={styles.searchMessages_button}>
                    <button onClick={hide}>cancel</button>
                </div>
            </div>
        </div>
    )
}

export default SearchMessages;