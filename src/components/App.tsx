import StartPage from './StartPage/StartPage';
import './App.scss'
import LoadingApp from './LoadingApp/LoadingApp';
import HomaPage from './HomePage/HomePage';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useAppDispatch, useAppSelector } from '../hooks/hook';
import { setUser, setUserData } from '../store/slices/appSlice';
import { CurrentUser, CurrentUserData } from '../types/types';
import { useTheme } from '../hooks/useTheme';
import { useEffect, useLayoutEffect, useState } from 'react';
import { DocumentSnapshot, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

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
            const userData = onSnapshot(doc(db, "users", currentUser.uid), (doc: DocumentSnapshot<CurrentUserData>) => {
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

    return (
        <div className='appContainer'>
            {/* <StartPage /> */}
            {/* <LoadingApp /> */}
            {/* <HomaPage /> */}
            {currentUser ? <HomaPage /> : load ? <LoadingApp /> : <StartPage />}
        </div>
    );
}
