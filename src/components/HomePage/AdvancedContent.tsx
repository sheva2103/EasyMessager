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
    scrollElement?: List,
    scrollIndexes: Set<number>
}

type IndexesNavigatorProps = {
    numbers: Set<number>,
    scrollElement: List,
}

const IndexesNavigator: React.FC<IndexesNavigatorProps> = ({ numbers, scrollElement }) => {

    const numberArray = Array.from(numbers).sort((a, b) => a - b)
    const [currentValue, setCurrentValue] = useState<number>(numberArray[0])

    const goToNext = () => {
        const currentIndex = numberArray.indexOf(currentValue)
        const nextIndex = (currentIndex + 1) % numberArray.length; 
        const nextValue = numberArray[nextIndex]
        setCurrentValue(nextValue)
        scrollElement.scrollToRow(nextValue)
    }

    const goToPrevious = () => {
        const currentIndex = numberArray.indexOf(currentValue)
        const prevIndex = (currentIndex - 1 + numberArray.length) % numberArray.length
        const prevValue = numberArray[prevIndex]
        setCurrentValue(prevValue)
        scrollElement.scrollToRow(prevValue)
    }

    useEffect(() => {
        console.log(numberArray)
        if(numberArray.length) scrollElement.scrollToRow(numberArray[numberArray.length - 1])
    }, [numbers])

    const currentIndex = numberArray.indexOf(currentValue) ? numberArray.indexOf(currentValue) : numberArray.length

    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ transform: 'rotate(180deg)' }} onClick={goToPrevious}>
                    <Badge color="primary">
                        <Arrow cursor={'pointer'} />
                    </Badge>
                </div>
                <div>
                    <Badge badgeContent={currentIndex}/>
                </div>
                <div onClick={goToNext}>
                    <Badge color="primary">
                        <Arrow cursor={'pointer'} />
                    </Badge>
                </div>
            </div>
        </div>
    );
};

const ScrollButton: FC<Props> = ({ list, scrollElement, scrollIndexes }) => {

    console.log('scrollbutton')

    const [noRead, setNoRead] = useState({ quantity: 0, targetIndex: 0 })
    const currentUserID = useAppSelector(state => state.app.currentUser.uid)

    useEffect(() => {
        const quantity = getQuantityNoReadMessages(list, currentUserID)
        setNoRead(quantity)
    }, [list]);

    const handleClick = () => scrollElement.scrollToRow(noRead.targetIndex)

    if (scrollIndexes.size) return <IndexesNavigator numbers={scrollIndexes} scrollElement={scrollElement} />

    return (
        <div onClick={handleClick}>
            <Badge badgeContent={noRead.quantity} color="primary">
                <Arrow cursor={'pointer'} />
            </Badge>
        </div>
    );
}

const AdvancedContent: FC<Props> = ({ list, scrollElement, scrollIndexes }) => {

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

    console.log('advanced content')

    return (
        <>
            <div className={styles.contentWrapper__control}>
                <div className={styles.emojiControl} ref={parentRef}>
                    <EmojiComponent height={height} />
                </div>
                <div className={styles.scrollControl}>
                    <ScrollButton list={list} scrollElement={scrollElement} scrollIndexes={scrollIndexes} />
                </div>
            </div>
        </>
    );
}

export default AdvancedContent;