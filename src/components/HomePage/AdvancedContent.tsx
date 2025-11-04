import { FC, MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import styles from './HomePage.module.scss'
import Arrow from '../../assets/arrow-down-circle-fill.svg'
import Badge from '@mui/material/Badge';
import { NoReadMessagesType } from "../../types/types";
import EmojiComponent from "./EmojiComponent";
import { VirtuosoHandle } from "react-virtuoso";

type Props = {
    noRead: NoReadMessagesType,
    scrollElement?: MutableRefObject<VirtuosoHandle | null>,
    scrollIndexes: Set<number>
}

type IndexesNavigatorProps = {
    numbers: Set<number>,
    scrollElement: MutableRefObject<VirtuosoHandle | null>
}

const IndexesNavigator: React.FC<IndexesNavigatorProps> = ({ numbers, scrollElement }) => {

    const numberArray = useMemo(() => Array.from(numbers).sort((a, b) => a - b), [numbers]);    
    const [currentValue, setCurrentValue] = useState<number>(numberArray[0]);

    const goToNext = () => {
        const currentIndex = numberArray.indexOf(currentValue)
        const nextIndex = (currentIndex + 1) % numberArray.length; 
        const nextValue = numberArray[nextIndex]
        setCurrentValue(nextValue)
        scrollElement.current?.scrollToIndex({
            index: nextValue,
            align: 'center',
            behavior: 'smooth'
        })
    }

    const goToPrevious = () => {
        const currentIndex = numberArray.indexOf(currentValue)
        const prevIndex = (currentIndex - 1 + numberArray.length) % numberArray.length
        const prevValue = numberArray[prevIndex]
        setCurrentValue(prevValue)
        scrollElement.current?.scrollToIndex({
            index: prevValue,
            align: 'center',
            behavior: 'smooth'
        })
    }

    useEffect(() => {
        if(numberArray.length) {
            const lastValue = numberArray[numberArray.length - 1]
            setCurrentValue(lastValue)
            scrollElement.current?.scrollToIndex({
                index: lastValue,
                align: 'center',
                behavior: 'auto'
            })
        }
    }, [numberArray, scrollElement])

    const displayIndex = numberArray.length ? numberArray.indexOf(currentValue) + 1 : 0;

    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ transform: 'rotate(180deg)' }} onClick={goToPrevious}>
                    <Badge color="primary">
                        <Arrow cursor={'pointer'} />
                    </Badge>
                </div>
                <div>
                    <Badge badgeContent={displayIndex} />
                </div>
                <div onClick={goToNext}>
                    <Badge color="primary">
                        <Arrow cursor={'pointer'} />
                    </Badge>
                </div>
            </div>
        </div>
    );
}

const ScrollButton: FC<Props> = ({ noRead, scrollElement, scrollIndexes }) => {

    console.log('scrollbutton')

    const handleClick = () => {
        scrollElement.current?.scrollToIndex({
            index: noRead.targetIndex,
            align: 'start',
            behavior: 'smooth'
        })
    }

    if (!scrollElement) return null;

    if (scrollIndexes.size) {
        return <IndexesNavigator numbers={scrollIndexes} scrollElement={scrollElement} />
    }

    return (
        <div onClick={handleClick}>
            <Badge badgeContent={noRead.quantity} color="primary">
                <Arrow cursor={'pointer'} />
            </Badge>
        </div>
    );
}

const AdvancedContent: FC<Props> = ({ noRead, scrollElement, scrollIndexes }) => {

    const parentRef = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState(350)

    useEffect(() => {
        const handleResize = () => {
            if (parentRef.current) {
                setHeight(parentRef.current.clientHeight - 4)
            }
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
                    {scrollElement && (
                        <ScrollButton 
                            noRead={noRead} 
                            scrollElement={scrollElement} 
                            scrollIndexes={scrollIndexes} 
                        />
                    )}
                </div>
            </div>
        </>
    );
}

export default AdvancedContent;