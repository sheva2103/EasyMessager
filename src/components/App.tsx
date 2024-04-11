import StartPage from './StartPage/StartPage';
import './App.scss'
import LoadingApp from './LoadingApp/LoadingApp';
import HomaPage from './HomePage/HomePage';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useAppDispatch, useAppSelector } from '../hooks/hook';
import { setChatList, setUser, setUserData } from '../store/slices/appSlice';
import { CurrentUser, CurrentUserData } from '../types/types';
import { useTheme } from '../hooks/useTheme';
import { useEffect, useLayoutEffect, useState } from 'react';
import { DocumentData, DocumentSnapshot, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { createChatList } from '../utils/utils';

export const App = () => {

    const { theme, setTheme } = useTheme()
    const [load, setLoad] = useState(false)

    const currentUser = useAppSelector(state => state.app.currentUser)
    const dispatch = useAppDispatch()
    useLayoutEffect(() => {
        setLoad(true)
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                //const uid = user.uid;
                const userData: CurrentUser = { email: user.email, photoURL: user.photoURL, displayName: user.displayName, uid: user.uid }
                dispatch(setUser(userData))
                setLoad(false)
            } else {
                console.log('никого нет')
                dispatch(setUser(null))
                setLoad(false)
            }
        });
    }, []);

    useEffect(() => {
        if(currentUser?.email) {
            const userData = onSnapshot(doc(db, "users", currentUser.email), (doc: DocumentSnapshot<CurrentUserData>) => {
                //console.log("Current user: ", doc.data());
                const data: CurrentUserData = doc.data()
                if(!data) {
                    dispatch(setUser(null))
                    return
                }
                dispatch(setUserData(data))
            });
            return () => userData()
        }
    }, [currentUser?.email]);

    useEffect(() => {
        if(currentUser?.email) {
            const getChatList = onSnapshot(doc(db, currentUser.email, "chatList"), (doc: DocumentSnapshot<CurrentUser[]>) => {
                //console.log("chatlist: ", doc.data());
                if(doc.data()) dispatch(setChatList(createChatList(doc.data())))
                //return () => getChatList()
            });
            return () => getChatList()
        }
    }, [currentUser?.email]);

    return (
        <div className='appContainer'>
            {/* <StartPage /> */}
            {/* <LoadingApp /> */}
            {/* <HomaPage /> */}
            {currentUser ? <HomaPage /> : load ? <LoadingApp /> : <StartPage />}
        </div>
    );
}
