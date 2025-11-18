import { FC, useEffect, useRef, useState } from "react";
import styles from './HomePage.module.scss'
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { setSearchMessages, setTargetMessages } from "../../store/slices/appSlice";
import { searchMessagesInList } from "../../utils/utils";
import { useDebounce } from 'use-debounce';
import { useTypedTranslation } from "../../hooks/useTypedTranslation";
import InputComponent from "../../InputComponent/InputComponent";

const SearchMessages: FC = () => {

    const [text, setText] = useState('')
    // const isOpen = useAppSelector(state => state.app.isSearchMessage)
    const list = useAppSelector(state => state.messages.messages)
    const [debouncedText] = useDebounce(text, 1000);
    const inputRefContainer = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const {t} = useTypedTranslation()
    const dispatch = useAppDispatch()
    const show = () => {
        if (inputRefContainer.current && inputRef.current) {
            inputRef.current.focus()
            inputRefContainer.current.style.width = '100%'
        }
    }
    const hide = () => {
        if (inputRefContainer.current) inputRefContainer.current.style.width = '10px'
        setTimeout(() => {
            if (text.length) setText('')
            dispatch(setSearchMessages(false))
            dispatch(setTargetMessages([]))
        }, 400)
    }

    useEffect(() => {
        const delay = setTimeout(show, 100)
        return () => {
            setText('')
            dispatch(setTargetMessages([]))
            clearTimeout(delay)
        }
    }, []);

    useEffect(() => {
        if (debouncedText) {
            const result = searchMessagesInList(list, text)
            dispatch(setTargetMessages([...result]))
        } else {
            dispatch(setTargetMessages([]))
        }
    }, [debouncedText]);

    return (
        <div className={styles.inputNewMessage}>
            <div className={styles.searchMessages}>
                    <InputComponent 
                        returnValue={setText} 
                        isCleanIcon 
                        refInput={inputRef}
                        refContainer={inputRefContainer} 
                        classes={styles.searchMessages_input} 
                    />
                <div className={styles.searchMessages_button}>
                    <button onClick={hide}>{t('cancel')}</button>
                </div>
            </div>
        </div>
    )
}

export default SearchMessages;