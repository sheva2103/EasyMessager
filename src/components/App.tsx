import { useTheme } from '../hooks/useTheme';
import StartPage from './StartPage/StartPage';
import './App.scss'
import LoadingApp from './LoadingApp/LoadingApp';
import HomaPage from './HomePage/HomePage';


export const App = () => {

    const {theme, setTheme} = useTheme()
    const handleThemeDark = () => {
        setTheme('dark')
    }

    const handleThemelight = () => {
        setTheme('light')
    }

    return (  
            <div className='appContainer'>
                {/* <button onClick={handleThemelight}>светлая</button>
                <button onClick={handleThemeDark}>тёмная</button> */}
                {/* <StartPage /> */}
                {/* <LoadingApp /> */}
                <HomaPage />
            </div>
    );
}
