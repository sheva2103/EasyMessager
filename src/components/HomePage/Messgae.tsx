import { FC, useRef, useState } from "react";
import Avatar from "../Avatar/Avatar";
import classNames from "classnames";
import styles from './HomePage.module.scss'
import ContextMenu from "./ContextMenu";
import SelectMessageInput from "./SelectMessageInput";
import { Message } from "../../types/types";



type Props = {
    showCheckbox: boolean,
    item: Message,
    selectSeveral: (e: React.MouseEvent<HTMLSpanElement>) => void
}

const Message: FC<Props> = ({showCheckbox, item, selectSeveral}) => {

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
            {/* <input type="checkbox" className={classNames({ [styles.showCheckbox]: showCheckbox })} /> */}
            <SelectMessageInput showCheckbox={showCheckbox} message={item}/>
            <div className={styles.avatar}>
                <Avatar url={item.url} name={item.name} />
            </div>
            <span 
                className={classNames(styles.owner, { [styles.guest]: item.name === owner, [styles.noSelect]: contextMenuIsOpen })} 
                onContextMenu={openContextMenu} 
                ref={refSpan}
            >
                {item.message}
            </span>
            <ContextMenu 
                element={refSpan} 
                isOpen={contextMenuIsOpen} 
                closeContextMenu={closeContextMenu} 
                selectSeveral={selectSeveral}
                showCheckbox={showCheckbox}
                />
        </li>
    //     <li style={{justifyContent: item.name !== owner ? 'flex-start' : ''}}>
    //     <div className={styles.contentMessage}>
    //         <input type="checkbox" className={classNames({ [styles.showCheckbox]: showCheckbox })} />
    //         <div className={styles.avatar}>
    //             <Avatar url={item.url} name={item.name} />
    //         </div>
    //     </div>
    //     <div className={classNames(styles.textMessage, {[styles.guest]: item.name === owner, [styles.owner]: item.name !== owner})}>
    //         <span 
    //             className={classNames( { [styles.noSelect]: contextMenuIsOpen })} 
    //             onContextMenu={openContextMenu} 
    //             ref={refSpan}
    //         >
    //             {item.message}
    //         </span>
    //     </div>
    //     <ContextMenu 
    //         element={refSpan} 
    //         isOpen={contextMenuIsOpen} 
    //         closeContextMenu={closeContextMenu} 
    //         selectSeveral={selectSeveral}
    //         showCheckbox={showCheckbox}
    //         />
    // </li>
    );
}

export default Message;