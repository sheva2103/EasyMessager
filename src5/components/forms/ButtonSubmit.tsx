import { FC } from "react";
import Preloader from '../../assets/preloader.svg'
import { SignInSignUpForm } from "../../types/types";
import { UseFormClearErrors } from "react-hook-form";

type Props = {
    isSubmitting: boolean,
    signIn?: boolean,
    signUp?: boolean,
    clearErrors?: UseFormClearErrors<SignInSignUpForm>
}

function defineTypeButton(type: Props): string {
    if(type.signIn) return 'Войти'
    if(type.signUp) return 'Регистрация'
    return 'Создать канал'
}

const ButtonSubmit: FC<Props> = (props) => {

    const { isSubmitting, signIn, clearErrors } = props

    const clearDataError = () => {
        if(signIn) clearErrors('dataError')
    }

    return (
        <div>
            <button style={{ width: '100%' }}
                onClick={clearDataError}
                disabled={isSubmitting}>
                {isSubmitting ? <Preloader /> : defineTypeButton(props)}
            </button>
        </div>
    );
}

export default ButtonSubmit;