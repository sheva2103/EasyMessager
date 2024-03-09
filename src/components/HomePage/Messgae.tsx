import { FC, useRef, useState } from "react";
import Avatar from "../Avatar/Avatar";
import classNames from "classnames";
import styles from './HomePage.module.scss'
import ContextMenu from "./ContextMenu";

type Message = {
    name: string,
    url: string,
    id: number,
    message: string
}

type Props = {
    showCheckbox: boolean,
    handleContextMenu: (e: React.MouseEvent) => void,
    item: Message
}

const Message: FC<Props> = ({showCheckbox, handleContextMenu, item}) => {

    const owner = 'alex'

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

    return (
        <li>
            <input type="checkbox" className={classNames({ [styles.showCheckbox]: showCheckbox })} />
            <Avatar url={item.url} name={item.name} />
            <span 
                className={classNames(styles.owner, { [styles.guest]: item.name === owner, [styles.noSelect]: contextMenuIsOpen })} 
                onContextMenu={openContextMenu} 
                ref={refSpan}
            >
                {item.message}
            </span>
            <ContextMenu element={refSpan} isOpen={contextMenuIsOpen} closeContextMenu={closeContextMenu}/>
        </li>
    );
}

export default Message;