import styles from './HomePage.module.scss'
import { createElement, FC, memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Message from './Messgae';
import { DocumentSnapshot, doc, onSnapshot } from "firebase/firestore";
import { db } from '../../firebase';
import { Chat, ListMessagesType, Message1 } from '../../types/types';
import { createMessageList, createNewDate, getChatType, getDatefromDate, getQuantityNoReadMessages } from '../../utils/utils';
import GetDateMessage from './GetDateMessage';
import { useAppDispatch, useAppSelector } from '../../hooks/hook';
import { setLoadChat } from '../../store/slices/appSlice';
import InfititeLoader from 'react-window-infinite-loader'
import Worker from 'web-worker';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache, ListRowRenderer } from 'react-virtualized'
import AdvancedContent from './AdvancedContent';
import SearchMessages from './SearchMessages';

type Props = {
    selectedChat: Chat
}

interface VariableHeightListProps {
    items: Message1[],
    assignElementToScroll: (element: List) => List,
    searchIndexes: Set<number>
}

const VariableHeightList: FC<VariableHeightListProps> = ({ items, assignElementToScroll, searchIndexes }) => {

    const currentUserID = useAppSelector(state => state.app.currentUser.uid)
    const cache = new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 57,
    })

    const listRef = useRef<List>(null);

    useEffect(() => {
        if (listRef.current && items.length) {
            const position = getQuantityNoReadMessages(items, currentUserID)
            listRef.current.scrollToRow(position.targetIndex)
        }
    }, [items.length])

    // useEffect(() => {
    //     if (listRef.current && items.length) {
    //         const position = getQuantityNoReadMessages(items, currentUserID);
    //         // Проверяем, является ли последний отрендеренный элемент последним в массиве items
    //         const lastRenderedIndex = listRef.current.Grid.state.scrollTop + listRef.current.props.height / cache.defaultHeight; // Пример вычисления
    //         if (lastRenderedIndex >= items.length - 1) {
    //             listRef.current.scrollToRow(position.targetIndex);
    //         }
    //     }
    // }, [items.length]);

    useEffect(() => {
        assignElementToScroll(listRef.current)
    }, []);

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

const ListMessages: FC<Props> = ({ selectedChat }) => {

    //const [list, setList] = useState<Message1[]>([])
    const list = useAppSelector(state => state.messages)
    const [targetMessages, setTargetMessages] = useState<Set<number>>(new Set())
    const dispatch = useAppDispatch()
    const isLoadChat = useAppSelector(state => state.app.loadChat)
    const isFavorites = useAppSelector(state => state.app.isFavorites)

    const scrollElementRef = useRef<List>(null)

    const assignElementToScroll = (element: List) => scrollElementRef.current = element 

    // useEffect(() => {
    //     //if (list.length) setList([])
    //     const reference = getChatType(isFavorites, selectedChat)
    //     const messages = onSnapshot(reference, (doc: DocumentSnapshot<Message1[]>) => {
    //         setList(createMessageList(doc.data()))
    //         if (isLoadChat) dispatch(setLoadChat(false))
    //     });
    //     return () => messages()
    // }, [selectedChat.uid]);

    console.log('render list messages')

    return (
        <div className={styles.contentWrapper}>
            <div className={styles.listMessages}>
                <SearchMessages list={list.messages} setTargetMessages={setTargetMessages}/>
                <ul id='listForMessages'>
                    <VariableHeightList items={list.messages} assignElementToScroll={assignElementToScroll} searchIndexes={targetMessages}/>
                </ul>
            </div>
            <AdvancedContent noRead={list.noRead} scrollElement={scrollElementRef.current} scrollIndexes={targetMessages}/>
        </div>
    );
}

export default memo(ListMessages);

//сделать скролл для выделеных сообщений, индексы брать из targetMessages