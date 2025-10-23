import styles from './HomePage.module.scss'
import { FC, memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Message from './Messgae';
import { Chat, Message1, NoReadMessagesType } from '../../types/types';
import { createNewDate, getDatefromDate, getQuantityNoReadMessages } from '../../utils/utils';
import GetDateMessage from './GetDateMessage';
import { useAppSelector } from '../../hooks/hook';
import Worker from 'web-worker';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache, ListRowRenderer } from 'react-virtualized'
import AdvancedContent from './AdvancedContent';
import SearchMessages from './SearchMessages';


interface VariableHeightListProps {
    items: Message1[],
    noRead: NoReadMessagesType
    assignElementToScroll: (element: List) => List,
    searchIndexes: Set<number>
}

const VariableHeightList: FC<VariableHeightListProps> = ({ items, noRead, assignElementToScroll, searchIndexes }) => {

    const cache = new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 49,
    })

    const listRef = useRef<List>(null);

    useLayoutEffect(() => {
        if (listRef.current && items.length) {
            setTimeout(() => {
                listRef.current.scrollToRow(noRead.targetIndex)
            }, 100)
        }
    }, [items.length])

    useEffect(() => {
        assignElementToScroll(listRef.current)
    }, [listRef]);

    const rowRenderer: ListRowRenderer = ({ index, key, parent, style }) => {

        const isHighlighted = searchIndexes.has(index)
        const rowStyle = {
            ...style,
            borderRadius: '16px',
            backgroundColor: isHighlighted ? "#53525270" : "transparent",
            borderBottom: isHighlighted ? "2px solid #2368af7a" : "transparent",
            transition: "background-color 0.3s ease",
        };

        return (
            <CellMeasurer
                key={key}
                cache={cache}
                parent={parent}
                columnIndex={0}
                rowIndex={index}
            >
                {({ measure, registerChild }) => (
                    <div ref={registerChild} style={rowStyle} onLoad={measure}>
                        {index !== 0 && getDatefromDate(createNewDate(items[index].date)) === getDatefromDate(createNewDate(items[index - 1].date)) ?
                            <Message messageInfo={items[index]} />
                            :
                            <div key={items[index].messageID}>
                                <GetDateMessage date={items[index].date} />
                                <Message messageInfo={items[index]} key={items[index].messageID} />
                            </div>
                        }
                    </div>
                )}
            </CellMeasurer>
        );
    };

    return (
        <AutoSizer>
            {({ height, width }) => (
                <List
                    width={width}
                    height={height}
                    rowCount={items.length}
                    rowHeight={cache.rowHeight}
                    deferredMeasurementCache={cache}
                    rowRenderer={rowRenderer}
                    overscanRowCount={3}
                    ref={listRef}
                />
            )}
        </AutoSizer>
    );
};

const ListMessages: FC = () => {

    const list = useAppSelector(state => state.messages)
    const [targetMessages, setTargetMessages] = useState<Set<number>>(new Set())
    const scrollElementRef = useRef<List>(null)
    const assignElementToScroll = (element: List) => scrollElementRef.current = element 

    console.log('render list messages')

    return (
        <div className={styles.contentWrapper}>
            <div className={styles.listMessages}>
                <SearchMessages list={list.messages} setTargetMessages={setTargetMessages}/>
                <ul id='listForMessages'>
                    <VariableHeightList 
                        items={list.messages}
                        noRead={list.noRead} 
                        assignElementToScroll={assignElementToScroll} 
                        searchIndexes={targetMessages}/>
                </ul>
            </div>
            <AdvancedContent noRead={list.noRead} scrollElement={scrollElementRef} scrollIndexes={targetMessages}/>
        </div>
    );
}

export default memo(ListMessages);
