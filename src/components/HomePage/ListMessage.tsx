import styles from './HomePage.module.scss'
import { createElement, FC, memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Message from './Messgae';
import { DocumentSnapshot, doc, onSnapshot } from "firebase/firestore";
import { db } from '../../firebase';
import { Chat, ListMessagesType, Message1 } from '../../types/types';
import { calculateHeightMessage, createLimitMessagesList, createListLimitMessages, createMessageList, createNewDate, getDatefromDate, searchPositionNoReadMessage } from '../../utils/utils';
import GetDateMessage from './GetDateMessage';
import { useAppDispatch, useAppSelector } from '../../hooks/hook';
import { setLoadChat, setMoreMessages } from '../../store/slices/appSlice';
import Preloader from '../../assets/preloader.svg'
import InfititeLoader from 'react-window-infinite-loader'
import Worker from 'web-worker';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache, ListRowRenderer } from 'react-virtualized'

type Props = {
    selectedChat: Chat
}

interface VariableHeightListProps {
    items: Message1[]
}

const VariableHeightList: FC<VariableHeightListProps> = ({ items }) => {

    const currentUserID = useAppSelector(state => state.app.currentUser.uid)
    const cache = new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 100,
    }); //кэш для измерения высоты ячеек

    const listRef = useRef<List>(null);

    useEffect(() => {
        if (listRef.current && items.length) {
            const targetIndex = searchPositionNoReadMessage(items, currentUserID)
            console.log('uuuueeeeeefffff >>>>', targetIndex, items.length)
            if(targetIndex === items.length) listRef.current.scrollToRow(targetIndex)
            else listRef.current.scrollToRow(targetIndex - 12)
        }
    }, [items.length]);

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
    const listRef = useRef<HTMLDivElement>(null)
    const [firstRender, setFirstRender] = useState(true)


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
        <div className={styles.listMessages} ref={listRef}>
            <ul id='listForMessages'>
                <VariableHeightList items={list} />
            </ul>
        </div>
    );
}



export default memo(ListMessages);