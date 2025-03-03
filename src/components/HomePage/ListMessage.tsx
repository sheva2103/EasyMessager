import styles from './HomePage.module.scss'
import { createElement, FC, memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Message from './Messgae';
import { DocumentSnapshot, doc, onSnapshot } from "firebase/firestore";
import { db } from '../../firebase';
import { Chat, ListMessagesType, Message1 } from '../../types/types';
import { createMessageList, createNewDate, getDatefromDate, getQuantityNoReadMessages } from '../../utils/utils';
import GetDateMessage from './GetDateMessage';
import { useAppDispatch, useAppSelector } from '../../hooks/hook';
import { setLoadChat } from '../../store/slices/appSlice';
import Preloader from '../../assets/preloader.svg'
import InfititeLoader from 'react-window-infinite-loader'
import Worker from 'web-worker';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache, ListRowRenderer } from 'react-virtualized'
import AdvancedContent from './AdvancedContent';

type Props = {
    selectedChat: Chat
}

interface VariableHeightListProps {
    items: Message1[],
    assignElementToScroll: (element: List) => List
}

const VariableHeightList: FC<VariableHeightListProps> = ({ items, assignElementToScroll }) => {

    const currentUserID = useAppSelector(state => state.app.currentUser.uid)
    const cache = new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 100,
    }); //кэш для измерения высоты ячеек

    const listRef = useRef<List>(null);

    useEffect(() => {
        if (listRef.current && items.length) {
            const position = getQuantityNoReadMessages(items, currentUserID)
            listRef.current.scrollToRow(position.targetIndex)
        }
    }, [items.length]);

    useEffect(() => {
        assignElementToScroll(listRef.current)
    }, []);

    // Функция рендера строки списка
    const rowRenderer: ListRowRenderer = ({ index, key, parent, style }) => {

        return (
            <CellMeasurer
                key={key}
                cache={cache}
                parent={parent}
                columnIndex={0}
                rowIndex={index}
            >
                {({ measure, registerChild }) => (
                    <div ref={registerChild} style={style} onLoad={measure}>
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

    const [list, setList] = useState<Message1[]>([])
    const dispatch = useAppDispatch()
    const isLoadChat = useAppSelector(state => state.app.loadChat)
    //const listRef = useRef<HTMLDivElement>(null)
    const [firstRender, setFirstRender] = useState(true)

    const scrollElementRef = useRef<List>(null)

    const assignElementToScroll = (element: List) => scrollElementRef.current = element 

    useEffect(() => {
        if (list.length) setList([])
        if (!firstRender) setFirstRender(true)
        const messages = onSnapshot(doc(db, "chats", selectedChat.chatID), (doc: DocumentSnapshot<Message1[]>) => {
            setList(createMessageList(doc.data()))
            if (isLoadChat) dispatch(setLoadChat(false))
        });
        return () => messages()
    }, [selectedChat.uid]);

    console.log('render list messages')

    return (
        <div className={styles.contentWrapper}>
            <div className={styles.listMessages}>
                <ul id='listForMessages'>
                    <VariableHeightList items={list} assignElementToScroll={assignElementToScroll}/>
                </ul>
            </div>
            <AdvancedContent list={list} scrollElement={scrollElementRef.current}/>
        </div>
    );
}



export default memo(ListMessages);