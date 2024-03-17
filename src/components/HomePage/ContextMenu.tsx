import classNames from 'classnames';
import styles from './HomePage.module.scss'
import SendMessage from '../../assets/send-fill.svg'
import Copy from '../../assets/copy.svg'
import Delete from '../../assets/delete.svg'
import Select from '../../assets/check-all.svg'
import Change from '../../assets/change.svg'

import { FC } from "react";
import { useAppDispatch, useAppSelector } from '../../hooks/hook';
import { Message, StyleContextMenu } from '../../types/types';
import { changeMessage, setShowCheckbox } from '../../store/slices/appSlice';


type Props = {
    isOpen: boolean,
    isOwner: boolean,
    message: Message
    closeContextMenu: (e: React.MouseEvent) => void,
    positionMenu: StyleContextMenu
}



const ContextMenu: FC<Props> = ({ isOpen, closeContextMenu, isOwner, message, positionMenu }) => {

    const dispatch = useAppDispatch()
    const showCheckbox = useAppSelector(state => state.app.showCheckbox)

    const copyMessage = () => {
        navigator.clipboard.writeText(message.message);
    }

    const change = () => {
        dispatch(changeMessage(message))
    }

    const selectSeveral = () => {
        dispatch(setShowCheckbox(true))
    }

    return (
        <div
            className={classNames(styles.cover, { [styles.showContextMenu]: isOpen })}
            onClick={closeContextMenu}
            onContextMenu={closeContextMenu}
        >
            <div style={positionMenu} className={styles.contextMenu}>
                <ul >
                    <li onClick={(e) => e.stopPropagation()}><SendMessage /><span>Переслать</span></li>
                    <li onClick={copyMessage}><Copy /><span>Копировать текст</span></li>
                    {isOwner && !showCheckbox &&
                        <li onClick={change}><Change/><span>Изменить</span></li>
                    }
                    <li><Delete /><span>Удалить</span></li>
                    {!showCheckbox &&
                        <li
                            onClick={selectSeveral}
                            className={classNames(styles.selectSeveral)}
                        >
                            <Select />
                            <span>Выбрать несколько</span>
                        </li>
                    }
                </ul>
            </div>
        </div>
    );
}

export default ContextMenu;