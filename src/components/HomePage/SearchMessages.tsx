import { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import { Message1 } from "../../types/types";
import styles from './HomePage.module.scss'
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { setSearchMessages } from "../../store/slices/appSlice";
import { searchMessagesInList } from "../../utils/utils";
import { useDebounce } from 'use-debounce';
import { useTypedTranslation } from "../../hooks/useTypedTranslation";

type Props = {
    list: Message1[],
    setTargetMessages: (indexes: Set<number>) => void
}

const SearchMessages: FC<Props> = ({ list, setTargetMessages }) => {

    const [text, setText] = useState('')
    const isOpen = useAppSelector(state => state.app.isSearchMessage)
    const [debouncedText] = useDebounce(text, 1000);
    const inputRefContainer = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const {t} = useTypedTranslation()
    const dispatch = useAppDispatch()
    const show = () => {
        if (inputRefContainer.current) {
            inputRef.current.focus()
            inputRefContainer.current.style.width = '100%'
        }
    }
    const hide = () => {
        if (inputRefContainer.current) inputRefContainer.current.style.width = '10px'
        setTimeout(() => {
            if (text.length) setText('')
            dispatch(setSearchMessages(false))
            setTargetMessages(new Set())
        }, 500)
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value)
    }

    useEffect(() => {
        const delay = setTimeout(show, 100)
        return () => {
            setText('')
            setTargetMessages(new Set())
            clearTimeout(delay)
        }
    }, [isOpen]);

    useEffect(() => {
        if (debouncedText) {
            const result = searchMessagesInList(list, text)
            setTargetMessages(result)
        }
    }, [debouncedText]);

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
                    <button onClick={hide}>{t('cancel')}</button>
                </div>
            </div>
        </div>
    )
}

export default SearchMessages;