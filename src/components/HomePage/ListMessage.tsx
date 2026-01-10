import styles from './HomePage.module.scss'
import { FC, memo, useEffect, useLayoutEffect, useRef } from 'react';
import Message from './Messgae';
import { MessageType, NoReadMessagesType } from '../../types/types';
import { createNewDate, getDatefromDate } from '../../utils/utils';
import GetDateMessage from './GetDateMessage';
import { useAppDispatch, useAppSelector } from '../../hooks/hook';
import AdvancedContent from './AdvancedContent';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { setIsAtBottomScroll } from '../../store/slices/appSlice';



interface VariableHeightListProps {
    items: MessageType[],
    noRead: NoReadMessagesType,
    assignElementToScroll: (handle: VirtuosoHandle | null) => void,
}

const VariableHeightList: FC<VariableHeightListProps> = ({ 
    items, 
    noRead, 
    assignElementToScroll, 
}) => {

    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const dispatch = useAppDispatch()
    const searchIndexes = useAppSelector(state => state.app.targetMessages)
    const setAtBottomScroll = (isBottom: boolean) => {
        dispatch(setIsAtBottomScroll(isBottom))
    }

    useLayoutEffect(() => {
        if (virtuosoRef.current && items.length) {
            setTimeout(() => {
                virtuosoRef.current?.scrollToIndex({
                    index: noRead.targetIndex,
                    align: 'center', 
                    behavior: 'auto' 
                });
            }, 100);
        }
    }, [items.length]); 

    useEffect(() => {
        assignElementToScroll(virtuosoRef.current)
        return () => assignElementToScroll(null)
    }, [assignElementToScroll]);

    const renderRow = (index: number, item: MessageType) => {
        const isHighlighted = new Set(searchIndexes).has(index);
        const rowStyle: React.CSSProperties = {
            borderRadius: '16px',
            backgroundColor: isHighlighted ? "#53525270" : "transparent",
            borderBottom: isHighlighted ? "2px solid #2368af7a" : "transparent",
            transition: "background-color 0.3s ease",
            padding: '2px 0'
        }

        const showDate = index === 0 || 
            (getDatefromDate(createNewDate(item.date)) !== getDatefromDate(createNewDate(items[index - 1].date)));

        return (
            <div style={rowStyle}>
                {showDate && <GetDateMessage date={item.date} />}
                <Message 
                    messageInfo={item}
                    key={item.messageID}    
                />
            </div>
        );
    };

    return (
        <Virtuoso
            ref={virtuosoRef}
            data={items}
            itemContent={renderRow}
            overscan={800}
            increaseViewportBy={300}
            atBottomStateChange={setAtBottomScroll} 
        />
    );
}

const ListMessages: FC = () => {

    const list = useAppSelector(state => state.messages)
    const scrollElementRef = useRef<VirtuosoHandle | null>(null) 
    const assignElementToScroll = (element: VirtuosoHandle | null) => {
        scrollElementRef.current = element 
    }

    console.log('render list messages')

    return (
        <div className={styles.contentWrapper}>
            <div className={styles.listMessages}>
                <ul id='listForMessages'>
                    <VariableHeightList 
                        items={list.messages}
                        noRead={list.noRead} 
                        assignElementToScroll={assignElementToScroll} 
                    />
                </ul>
            </div>
            <AdvancedContent 
                noRead={list.noRead} 
                scrollElement={scrollElementRef}
            />
        </div>
    );
}

export default memo(ListMessages);
