import { FC, useEffect, useRef, useState } from "react";
import styles from './HomePage.module.scss'
import Arrow from '../../assets/arrow-down-circle-fill.svg'
import Badge from '@mui/material/Badge';
import { Message1 } from "../../types/types";
import { getQuantityNoReadMessages } from "../../utils/utils";
import { List } from "react-virtualized";
import { useAppSelector } from "../../hooks/hook";
import EmojiComponent from "./EmojiComponent";

type Props = {
    list: Message1[],
    scrollElement?: List
}

const ScrollButton: FC<Props> = ({list,scrollElement}) => {

    const [noRead, setNoRead] = useState({quantity: 0, targetIndex: 0})
    const currentUserID = useAppSelector(state => state.app.currentUser.uid)

    useEffect(() => {
        const quantity = getQuantityNoReadMessages(list, currentUserID)
        setNoRead(quantity)
    }, [list]);

    const handleClick = () => scrollElement.scrollToRow(noRead.targetIndex)

    return (
        <div onClick={handleClick}>
            <Badge badgeContent={noRead.quantity} color="primary">
                <Arrow cursor={'pointer'}/>
            </Badge>
        </div>
    );
}

const AdvancedContent: FC<Props> = ({list, scrollElement}) => {

    const parentRef = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState(350)

    useEffect(() => {
        const handleResize = () => {
            setHeight(parentRef.current.clientHeight - 4)
        };
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, []);

    return (
        <>
            <div className={styles.contentWrapper__control}>
                <div className={styles.emojiControl} ref={parentRef}>
                    <EmojiComponent height={height}/>
                </div>
                <div className={styles.scrollControl}>
                    <ScrollButton list={list} scrollElement={scrollElement}/>
                </div>
            </div>
            {/* <div>emoji</div> */}
        </>
    );
}

export default AdvancedContent;