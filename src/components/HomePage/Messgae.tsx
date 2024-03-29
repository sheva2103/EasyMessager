import { FC, memo, useEffect, useRef, useState } from "react";
import Avatar from "../Avatar/Avatar";
import classNames from "classnames";
import styles from './HomePage.module.scss'
import ContextMenu from "./ContextMenu";
import SelectMessageInput from "./SelectMessageInput";
import { Message, StyleContextMenu } from "../../types/types";
import { useAppSelector } from "../../hooks/hook";



type Props = {
    item: Message,
}

function checkMessage(str: string): string {

    const reg = /(https?:\/\/|ftps?:\/\/|www\.)((?![.,?!;:()]*(\s|$))[^\s]){2,}/gim

    if (!reg.test(str)) return str

    const message = str.split(' ')
    let newStr = message.map(item => {
        if (reg.test(item)) return `<a href='${item}' target='blank'>${item}</a>`
        return item
    })
    return newStr.join(' ')
}

type Offset = {
    top: number,
    left: number
}


const Message: FC<Props> = ({ item }) => {

    const owner = 'alex'
    const [offset, setOffset] = useState<Offset>({ top: 0, left: 0 })
    const positionMenu: StyleContextMenu = {
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

    useEffect(() => {
        refSpan.current.addEventListener('contextmenu', setPositionMenu)
        if (!refSpan.current) return () => refSpan.current.removeEventListener('contextmenu', setPositionMenu)
    }, []);

    const [contextMenuIsOpen, setContextMenu] = useState(false)
    const openContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        setContextMenu(true)
    }
    const closeContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        setContextMenu(false)
    }

    const refSpan = useRef<HTMLElement>(null)

    console.log('message render')

    return (
        <li>
            <SelectMessageInput  message={item} />
            <div className={styles.avatar}>
                <Avatar url={item.url} name={item.name} />
            </div>
            <span
                className={classNames(styles.owner, { [styles.guest]: item.name !== owner, [styles.noSelect]: contextMenuIsOpen })}
                onContextMenu={openContextMenu}
                ref={refSpan}
                dangerouslySetInnerHTML={{ __html: checkMessage(item.message) }}
            >
                {/* {item.message} */}
            </span>
            {contextMenuIsOpen &&
                <ContextMenu
                    isOpen={contextMenuIsOpen}
                    closeContextMenu={closeContextMenu}
                    
                    isOwner={owner === item.name}
                    message={item}
                    positionMenu={positionMenu}
                />}
        </li>
    );
}

export default memo(Message);