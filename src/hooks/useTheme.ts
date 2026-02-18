// import { useLayoutEffect, useState } from "react"
// import { useThemeType } from "../types/types"

// export const useTheme = (): useThemeType => {

//     const localStorageTheme = localStorage.getItem('theme') || 'light'
//     const [theme, setTheme] = useState<string>(localStorageTheme)

//     useLayoutEffect(() => {

//         document.documentElement.setAttribute('data-theme', theme)
//         localStorage.setItem('theme', theme)
//     }, [theme])

//     return {theme, setTheme}
// }

import { useLayoutEffect, useState } from "react"
import { useThemeType } from "../types/types"

export const useTheme = (): useThemeType => {
    const localStorageTheme = localStorage.getItem('theme') || 'light'
    const [theme, setTheme] = useState<string>(localStorageTheme)

    useLayoutEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)

        const themeColor = theme === 'dark' ? '#313131' : '#eeebeb'; 

        let metaTag = document.querySelector('meta[name="theme-color"]');
        
        if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.setAttribute('name', 'theme-color');
            document.head.appendChild(metaTag);
        }
        
        metaTag.setAttribute('content', themeColor);

    }, [theme])

    return {theme, setTheme}
}