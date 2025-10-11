import { FC } from "react";
import Preloader from '../../assets/preloader.svg'
import { SignInSignUpForm } from "../../types/types";
import { UseFormClearErrors } from "react-hook-form";
import { useTypedTranslation } from "../../hooks/useTypedTranslation";

type Props = {
    isSubmitting: boolean,
    signIn?: boolean,
    signUp?: boolean,
    clearErrors?: UseFormClearErrors<SignInSignUpForm>
}

const ButtonSubmit: FC<Props> = (props) => {

    const { isSubmitting, signIn, clearErrors } = props
    const {t} = useTypedTranslation()

    function defineTypeButton(type: Props): string {
    if(type.signIn) return t('signIn')
    if(type.signUp) return t('registration')
    return t('createChannel')
}

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