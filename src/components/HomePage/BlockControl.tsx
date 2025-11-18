import { FC, useEffect, useState } from "react";
import styles from './HomePage.module.scss'
import SendMessage from '../../assets/send-fill.svg'
import Delete from '../../assets/delete.svg'
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { clearSelectedMessage, closeBar, isSendMessage } from "../../store/slices/appSlice";
import { CONTACTS } from "../../constants/constants";
import { messagesAPI } from "../../API/api";
import Preloader from '../../assets/preloader.svg'
import { useTypedTranslation } from "../../hooks/useTypedTranslation";
import pLimit from "p-limit";

const CONCURRENCY_LIMIT = 3;
const limit = pLimit(CONCURRENCY_LIMIT)

const BlockControl: FC = () => {

    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState(false)
    const dispatch = useAppDispatch()
    const { t } = useTypedTranslation()
    const selectedMessage = useAppSelector(state => state.app.selectedMessages)
    const chat = useAppSelector(state => state.app.selectedChat)
    const isFavorites = useAppSelector(state => state.app.isFavorites)

    const handleClickSendMessages = () => {
        if (selectedMessage.length && !error) {
            dispatch(isSendMessage(true))
            dispatch(closeBar(CONTACTS))
            console.log('send')
        }
    }

    const handleClickDeleteMessages = () => {
        if (!selectedMessage.length) return
        setDeleting(true)

        const limitedPromises = selectedMessage.map(item =>
            limit(() => messagesAPI.deleteMessage(chat, item, isFavorites))
        )

        Promise.all(limitedPromises)
            .then(() => dispatch(clearSelectedMessage()))
            .catch(() => console.log('error deleting selected messages'))
            .finally(() => setDeleting(false))
    }

    const canselSelected = () => {
        dispatch(clearSelectedMessage())
    }

    useEffect(() => {
        const isError = selectedMessage.some(item => Boolean(item?.callStatus))
        if (isError) setError(true)
        if (!isError && error) setError(false)
    }, [selectedMessage])

    return (
        <div className={styles.blockControl}>
            <div className={styles.blockControl__item}>
                <button onClick={canselSelected}>
                    {t('cancel')}
                </button>
            </div>
            <div className={styles.blockControl__item} onClick={handleClickSendMessages} title={t("forward")}>
                <SendMessage
                    cursor={'pointer'}
                    fontSize={'1.4rem'}
                    color={error ? 'hsla(0, 73.92%, 60.75%, 0.75)' : undefined}
                />
            </div>
            <div className={styles.blockControl__item} onClick={handleClickDeleteMessages} title={t('deleteSelected')}>
                {!deleting ?
                    <Delete cursor={'pointer'} fontSize={'1.4rem'} />
                    :
                    <Preloader fontSize={'1.4rem'} />
                }
            </div>
            <div className={styles.blockControl__item}>
                <span>{selectedMessage.length}</span>
            </div>
        </div>
    );
}
export default BlockControl;