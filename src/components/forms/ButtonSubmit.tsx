import { FC } from "react";
import Preloader from '../../assets/preloader.svg'

type Props = {
    isSubmitting: boolean,
    signIn?: boolean,
    signUp?: boolean
}

const ButtonSubmit: FC<Props> = ({ isSubmitting, signIn, signUp }) => {
    return (
        <div>
            <button style={{ width: '100%' }}
                disabled={isSubmitting}>
                {isSubmitting ? <Preloader /> : signUp ? 'регистрация' : 'войти'}
            </button>
        </div>
    );
}

export default ButtonSubmit;