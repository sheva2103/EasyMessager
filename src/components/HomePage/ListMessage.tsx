import styles from './HomePage.module.scss'
import { createElement, FC, memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Message from './Messgae';
import { DocumentSnapshot, doc, onSnapshot } from "firebase/firestore";
import { db } from '../../firebase';
import { Chat, ListMessagesType, Message1 } from '../../types/types';
import { calculateHeightMessage, createLimitMessagesList, createListLimitMessages, createMessageList, createNewDate, getDatefromDate, searchNoReadMessage } from '../../utils/utils';
import GetDateMessage from './GetDateMessage';
import { useAppDispatch, useAppSelector } from '../../hooks/hook';
import { setLoadChat, setMoreMessages } from '../../store/slices/appSlice';
import Preloader from '../../assets/preloader.svg'
//import { VariableSizeList as List } from 'react-window';
//import { FixedSizeList as List } from 'react-window';
import InfititeLoader from 'react-window-infinite-loader'
<<<<<<< HEAD
//import { VariableSizeList as List } from 'react-window';
//import { useWebWorker } from '../../hooks/useWebWorker';
//import { useWebWorker } from '../../hooks/useWebWorker';
import Worker from 'web-worker';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache, ListRowRenderer } from 'react-virtualized'
=======
import AutoSizer from 'react-virtualized-auto-sizer'
import { VariableSizeList as List } from 'react-window';
//import { useWebWorker } from '../../hooks/useWebWorker';
//import { useWebWorker } from '../../hooks/useWebWorker';
import Worker from 'web-worker';
>>>>>>> 19a3a81be0391c019f7f5108d3849b7c48a8f707

type Props = {
    selectedChat: Chat
}

interface ListForRenderProps {
    list: Message1[],
    listRef: HTMLDivElement

}

// const ListForRender: FC<ListForRenderProps> = ({ list, listRef }) => {

//     const [size, setSize] = useState({ clientWidth: listRef?.clientWidth, clientHeight: listRef?.clientHeight })

//     const resizeHandler = () => {
//         const { clientHeight, clientWidth } = listRef || {};
//         setSize({ clientHeight, clientWidth: clientWidth - 8 });
//     };

//     useEffect(() => {
//         window.addEventListener("resize", resizeHandler);
//         resizeHandler();
//         return () => {
//             window.removeEventListener("resize", resizeHandler);
//         };
//     }, []);
//     //////////////////
//     // const computedStyles = window.getComputedStyle(listRef);
//     // const fontSize = computedStyles.fontSize;
//     // const letterSpacing = computedStyles.letterSpacing
//     // const wordSpacing = computedStyles.wordSpacing
//     // const fontFamily = computedStyles.fontFamily
//     // const style = {font: `${fontSize} ${fontFamily}`, letterSpacing: `${letterSpacing}`, wordSpacing: `${wordSpacing}`}
//     // console.log('fontSize>>', style)


//     const rowHeights = calculateHeightMessage(list, size)

//     const getItemSize = (index: number) => rowHeights[index];

//     const Row = ({ index, style }: { index: number, style: Object }) => (
//         <div style={style}>
// {index !== 0 && getDatefromDate(createNewDate(list[index].date)) === getDatefromDate(createNewDate(list[index - 1].date)) ?
//     <Message messageInfo={list[index]} />
//     :
//     <div key={list[index].messageID}>
//         <GetDateMessage date={list[index].date} />
//         <Message messageInfo={list[index]} key={list[index].messageID} />
//     </div>
// }
//         </div>
//     );

//     return (
//         <ul>
//             <List
//                 height={size.clientHeight + 10}
//                 itemCount={list.length}
//                 itemSize={getItemSize}
//                 width={size.clientWidth - 4}
//             >
//                 {Row}
//             </List>
//         </ul>
//     );
// }


// const ListMessages: FC<Props> = ({ selectedChat }) => {

//     const [list, setList] = useState<ListMessagesType>({ all: [], limit: [] })
//     const dispatch = useAppDispatch()
//     const isLoadChat = useAppSelector(state => state.app.loadChat)
//     const currentUserID = useAppSelector(state => state.app.currentUser.uid)
//     const listRef = useRef<HTMLDivElement>(null)
//     const [firstRender, setFirstRender] = useState(true)

//     useEffect(() => {
//         if (list.all.length) setList({ all: [], limit: [] })
//         if (!firstRender) setFirstRender(true)
//         const messages = onSnapshot(doc(db, "chats", selectedChat.chatID), (doc: DocumentSnapshot<Message1[]>) => {
//             setList((prev) => {
//                 const all = createMessageList(doc.data())
//                 return { all, limit: createLimitMessagesList({ all, limit: prev.limit }) }
//             })
//             if (isLoadChat) dispatch(setLoadChat(false))
//         });
//         return () => messages()
//     }, [selectedChat.uid]);

//     // useLayoutEffect(() => {
//     //     listRef.current?.addEventListener('scroll', scrollListener)
//     //     return () => {
//     //         console.log('снимаю слушатель с >', listRef.current)
//     //         listRef.current.removeEventListener('scroll', scrollListener)
//     //     }
//     // }, [list]);

//     ///////////////////////////для авто прокрутки

//     useEffect(() => {
//         if (firstRender && list.all.length) {
//             setList((prev) => ({ all: prev.all, limit: prev.all.slice(0, 50) }))
//             // const targetIndex = searchNoReadMessage(list.all, currentUserID)
//             // setList((prev) => ({all: prev.all, limit: prev.all.slice(targetIndex - 25, targetIndex + 25)}))
//             setFirstRender(false)
//         }
//         //if(list.length) scrollToElement(listRef.current, list, currentUserID, firstRender)
//     }, [list.all]);

//     //////////////////////////////
//     console.log('render list messages')

//     return (
//         <div className={styles.listMessages} ref={listRef}>
//             {isLoadChat ?
//                 <div className={styles.contentContainer}>
//                     <div className={styles.preloaderBlock}>
//                         <Preloader fontSize={'2.4rem'} />
//                     </div>
//                 </div>
//                 :
//                 <ListForRender list={list.all} listRef={listRef.current} />
//             }
//         </div>
//     );
// }

// 

// const ListMessages: FC<Props> = ({ selectedChat }) => {

//     const [list, setList] = useState<ListMessagesType>({ all: [], limit: [] })
//     const dispatch = useAppDispatch()
//     const isLoadChat = useAppSelector(state => state.app.loadChat)
//     const currentUserID = useAppSelector(state => state.app.currentUser.uid)
//     const listRef = useRef<HTMLDivElement>(null)
//     const [firstRender, setFirstRender] = useState(true)
//     const moreMessages = list.all.length && list.limit.length && list.all[list.all.length - 1].messageID !== list.limit[list.limit.length - 1].messageID

//     const downloadMoreMessages = () => {
//         const url = new URL('../../utils/worker.js', import.meta.url);
//         const worker = new Worker(url);

//         worker.addEventListener('message', e => {
//             console.log(e.data)  // "hiya!"
//             worker.terminate()
//             setList(e.data)
//         });
//         const test = { func: createListLimitMessages.toString(), data: list }
//         worker.postMessage(test);

//     }


//     const scrollListener = () => {
//         const scrollValue = listRef.current.scrollTop
//         const listHeight = listRef.current.scrollHeight
//         const viewportHeight = listRef.current.clientHeight
//         const height = listHeight - viewportHeight
//         const scrollPercent = (scrollValue / height) * 100
//         if (scrollPercent === 100) {
//             if (moreMessages) {
//                 //dispatch(setMoreMessages(true))
//                 console.log(scrollPercent)
//                 downloadMoreMessages()

//             }
//         }
//     }

//     // useEffect(() => {
//     //     dispatch(setMoreMessages(false))
//     // }, [moreMessages]);

//     useEffect(() => {
//         if (list.all.length) setList({ all: [], limit: [] })
//         if (!firstRender) setFirstRender(true)
//         const messages = onSnapshot(doc(db, "chats", selectedChat.chatID), (doc: DocumentSnapshot<Message1[]>) => {
//             //setList(createMessageList(doc.data()))
//             setList((prev) => {
//                 const all = createMessageList(doc.data())
//                 //return {all, limit: prev.limit}
//                 return { all, limit: createLimitMessagesList({ all, limit: prev.limit }) }
//             })
//             if (isLoadChat) dispatch(setLoadChat(false))
//         });
//         return () => messages()
//     }, [selectedChat.uid]);

//     useLayoutEffect(() => {
//         listRef.current?.addEventListener('scroll', scrollListener)
//         return () => {
//             console.log('снимаю слушатель с >', listRef.current)
//             listRef.current.removeEventListener('scroll', scrollListener)
//         }
//     }, [list]);

//     ///////////////////////////для авто прокрутки

//     useEffect(() => {
//         if (firstRender && list.all.length) {
//             setList((prev) => ({ all: prev.all, limit: prev.all.slice(0, 50) }))
//             // const targetIndex = searchNoReadMessage(list.all, currentUserID)
//             // setList((prev) => ({all: prev.all, limit: prev.all.slice(targetIndex - 25, targetIndex + 25)}))
//             setFirstRender(false)
//         }
//         //if(list.length) scrollToElement(listRef.current, list, currentUserID, firstRender)
//     }, [list.all]);

//     //////////////////////////////
//     console.log('render list messages')

//     return (
//         <div className={styles.listMessages} ref={listRef}>
//             <ul>
//                 {list.limit.map((item, index) => {
//                     if (index !== 0 && getDatefromDate(createNewDate(item.date)) === getDatefromDate(createNewDate(list.limit[index - 1].date))) {
//                         return <Message messageInfo={item} key={item.messageID} />
//                     }
//                     return <div key={item.messageID}>
//                         <GetDateMessage date={item.date} />
//                         <Message messageInfo={item} key={item.messageID} />
//                     </div>
//                 })}

//             </ul>
//         </div>
//     );
// }

interface VariableHeightListProps {
    items: Message1[]
}

const VariableHeightList: FC<VariableHeightListProps> = ({ items }) => {
    // Создаем кэш для измерения высоты ячеек
    const cache = new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 100, // Укажите значение по умолчанию, если высота неизвестна
    });

    // Функция рендера строки списка
    const rowRenderer: ListRowRenderer = ({ index, key, parent, style }) => {
        //const item = items[index];

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
                />
            )}
        </AutoSizer>
    );
};

const ListMessages: FC<Props> = ({ selectedChat }) => {

    const [list, setList] = useState<ListMessagesType>({ all: [], limit: [] })
    const dispatch = useAppDispatch()
    const isLoadChat = useAppSelector(state => state.app.loadChat)
    const currentUserID = useAppSelector(state => state.app.currentUser.uid)
    const listRef = useRef<HTMLDivElement>(null)
    const [firstRender, setFirstRender] = useState(true)
<<<<<<< HEAD

=======
    const moreMessages = list.all.length && list.limit.length && list.all[list.all.length - 1].messageID !== list.limit[list.limit.length - 1].messageID

    //const {result, run} = useWebWorker(createLimitMessage(list))

    //сделать чтоб не показывалось загрузка после добавления сообщения

    // const [result, runWorker] = useWebWorker<ListMessagesType, any>((data) => {
    //     //console.log(data, '<<<<<<<<<<<<<<<<')
    //     const lastIndex = data.all.findIndex(item => item.messageID === data.limit[data.limit.length - 1].messageID)
    //     const newLimit = data.all.slice(lastIndex + 1, lastIndex + 50)
    //     console.log(data.limit, '<<<<<<<<<<')
    //     return { all: data.all, limit: [...data.limit, ...newLimit] }
    // });

    const downloadMoreMessages = () => {

        const url = new URL('../../utils/worker.js', import.meta.url);
        const worker = new Worker(url);

        worker.addEventListener('message', e => {
            console.log(e.data)  // "hiya!"
            worker.terminate()
            setList(e.data)
        });


        // worker.postMessage('hello');
        // worker.postMessage(list);
        // const newFunction = function() {
        //     return createListLimitMessages(list)
        // }
        // const functionToString = newFunction.toString()
        // console.log(functionToString)
        const test = {func:createListLimitMessages.toString(), data: list}
        worker.postMessage(test);

    }


    const scrollListener = () => {
        const scrollValue = listRef.current.scrollTop
        const listHeight = listRef.current.scrollHeight
        const viewportHeight = listRef.current.clientHeight
        const height = listHeight - viewportHeight
        const scrollPercent = (scrollValue / height) * 100
        if (scrollPercent === 100) {
            if (moreMessages) {
                //dispatch(setMoreMessages(true))
                console.log(scrollPercent)

                // setList(prev => {
                //     const lastIndex = prev.all.findIndex(item => item.messageID === prev.limit[prev.limit.length - 1].messageID)
                //     const newLimit = prev.all.slice(lastIndex + 1, lastIndex + 50)
                //     return { all: prev.all, limit: [...prev.limit, ...newLimit] }
                // })
                downloadMoreMessages()

            }
        }
    }
>>>>>>> 19a3a81be0391c019f7f5108d3849b7c48a8f707

    // useEffect(() => {
    //     dispatch(setMoreMessages(false))
    // }, [moreMessages]);

    useEffect(() => {
        if (list.all.length) setList({ all: [], limit: [] })
        if (!firstRender) setFirstRender(true)
        const messages = onSnapshot(doc(db, "chats", selectedChat.chatID), (doc: DocumentSnapshot<Message1[]>) => {
            //setList(createMessageList(doc.data()))
            setList((prev) => {
                const all = createMessageList(doc.data())
                //return {all, limit: prev.limit}
                return { all, limit: createLimitMessagesList({ all, limit: prev.limit }) }
            })
            if (isLoadChat) dispatch(setLoadChat(false))
        });
        return () => messages()
    }, [selectedChat.uid]);

    ///////////////////////////для авто прокрутки

    useEffect(() => {
        if (firstRender && list.all.length) {
            setList((prev) => ({ all: prev.all, limit: prev.all.slice(0, 50) }))
            // const targetIndex = searchNoReadMessage(list.all, currentUserID)
            // setList((prev) => ({all: prev.all, limit: prev.all.slice(targetIndex - 25, targetIndex + 25)}))
            setFirstRender(false)
        }
        //if(list.length) scrollToElement(listRef.current, list, currentUserID, firstRender)
    }, [list.all]);

    //////////////////////////////
    console.log('render list messages')

    return (
        <div className={styles.listMessages} ref={listRef}>
            <ul id='listForMessages'>
                {/* {list.limit.map((item, index) => {
                    if (index !== 0 && getDatefromDate(createNewDate(item.date)) === getDatefromDate(createNewDate(list.limit[index - 1].date))) {
                        return <Message messageInfo={item} key={item.messageID} />
                    }
                    return <div key={item.messageID}>
                        <GetDateMessage date={item.date} />
                        <Message messageInfo={item} key={item.messageID} />
                    </div>
<<<<<<< HEAD
                })} */}
                <VariableHeightList items={list.all} />

            </ul>
=======
                </div>
                : */}
            <ul>
                {list.limit.map((item, index) => {
                    if (index !== 0 && getDatefromDate(createNewDate(item.date)) === getDatefromDate(createNewDate(list.limit[index - 1].date))) {
                        return <Message messageInfo={item} key={item.messageID} />
                    }
                    return <div key={item.messageID}>
                        <GetDateMessage date={item.date} />
                        <Message messageInfo={item} key={item.messageID} />
                    </div>
                })}
            </ul>
            {/* } */}

>>>>>>> 19a3a81be0391c019f7f5108d3849b7c48a8f707
        </div>
    );
}



export default memo(ListMessages);