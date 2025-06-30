import { Dialog } from "@mui/material";
import { cloneElement, FC, ReactElement, ReactNode } from "react";
import styles from './Settings.module.scss'
import CloseMenuIcon from '../../assets/closeDesktop.svg'

type Props = {
    children: ReactElement
    isOpen: boolean,
    onClose: (value: boolean) => void
}

type ConfirmProps = {
    confirmFunc: () => void,
    handleClose?: () => void
}

const dialogStyle = styles.listStyle

export const ConfirmComponent: FC<ConfirmProps> = ({confirmFunc, handleClose}) => {

    return (
        <div className={styles.confirm}>
            <div className={styles.text}>
                <span>Вы уверены ?</span>
            </div>
            <div className={styles.buttons}>
                <button onClick={confirmFunc}>да</button>
                <button onClick={handleClose}>нет</button>
            </div>
        </div>
    )
}

export const NotFoundChannel: FC<{confirmFunc: () => void}> = ({confirmFunc}) => {

    return (
        <div className={styles.confirm}>
            <div className={styles.text}>
                <span>Канал больше недоступен</span>
            </div>
            <div className={styles.buttons}>
                <button onClick={confirmFunc}>да</button>
            </div>
        </div>
    )
}

const DialogComponent: FC<Props> = ({children, onClose, isOpen}) => {

    const handleClose = () => {
        onClose(false);
    };

    return (  
        <Dialog onClose={handleClose} open={isOpen} classes={{paper: dialogStyle}}>
            <div className={styles.close}><CloseMenuIcon cursor={'pointer'} fontSize={'1.3rem'} onClick={handleClose}/></div>
            {cloneElement(children, { handleClose })}
        </Dialog>
    );
}

export default DialogComponent;