import { useLayoutEffect, useState } from "react"
import { useThemeType } from "../types/types"

export const useTheme = (): useThemeType => {

    const localStorageTheme = localStorage.getItem('theme') || 'dark'
    const [theme, setTheme] = useState<string>(localStorageTheme)

    useLayoutEffect(() => {

        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    return {theme, setTheme}
}