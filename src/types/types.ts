

export type useThemeType = {
    theme: string,
    setTheme: (theme: string) => void
}

export type TypeValueStartPage = {
    typePage: string,
    typeClick: string
}

export type SignInSignUpForm = {
    login?: string,
    password: string,
    confirmPassword?: string,
    email?: string,
    rememberMe?: boolean
}

export type Message = {
    name: string,
    url: string,
    id: number,
    message: string
}

export interface StyleContextMenu {
    position: 'relative';
    top: string;
    left: string;
}