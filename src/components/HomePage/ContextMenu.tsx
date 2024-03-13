// import * as React from 'react';
// import Button from '@mui/material/Button';
// import Menu from '@mui/material/Menu';
// import MenuItem from '@mui/material/MenuItem';
import classNames from 'classnames';
import styles from './HomePage.module.scss'
import SendMessage from '../../assets/send-fill.svg'
import Copy from '../../assets/copy.svg'
import Delete from '../../assets/delete.svg'
import Select from '../../assets/check-all.svg'
import Change from '../../assets/change.svg'

import { FC, useEffect, useState } from "react";
import { useAppDispatch } from '../../hooks/hook';
import { Message } from '../../types/types';
import { changeMessage } from '../../store/slices/appSlice';

type Props = {
    element: {
        current: HTMLElement
    },
    isOpen: boolean,
    showCheckbox: boolean,
    isOwner: boolean,
    message: Message
    closeContextMenu: (e: React.MouseEvent) => void,
    selectSeveral: (e: React.MouseEvent<HTMLSpanElement>) => void
}

type Offset = {
    top: number,
    left: number
}

interface StyleMenu {
    position: 'relative';
    top: string;
    left: string;
}

const ContextMenu: FC<Props> = ({ element, isOpen, closeContextMenu, selectSeveral, showCheckbox, isOwner, message }) => {

    const [offset, setOffset] = useState<Offset>({ top: 0, left: 0 })
    const dispatch = useAppDispatch()

    const positionMenu: StyleMenu = {
        position: 'relative',
        top: offset.top + 5 + 'px',
        left: offset.left + 5 + 'px'
    }

    const setPositionMenu = (e: MouseEvent) => {
        const position = { top: 0, left: 0 }
        const windowHeight = document.documentElement.clientHeight
        const windowWidth = document.documentElement.clientWidth
        const positionClickTop = e.clientY
        const positionClickLeft = e.clientX
        windowHeight - positionClickTop > 200 ? position.top = positionClickTop : position.top = positionClickTop - 168
        windowWidth - positionClickLeft > 200 ? position.left = positionClickLeft : position.left = positionClickLeft - 168
        setOffset(position)
    }

    const copyMessage = () => {
        navigator.clipboard.writeText(element.current.innerText);
    }

    const change = () => {
        dispatch(changeMessage(message))
    }

    useEffect(() => {
        element.current.addEventListener('contextmenu', setPositionMenu)
        if (!element.current) return () => element.current.removeEventListener('contextmenu', setPositionMenu)
    }, []);

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