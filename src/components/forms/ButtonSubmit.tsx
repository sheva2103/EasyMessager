import { FC } from "react";
import Preloader from '../../assets/preloader.svg'

type Props = {
    isSubmitting: boolean,
    signIn?: boolean,
    signUp?: boolean,
    //createChannel?: boolean
}

function defineTypeButton(type: Props): string {
    if(type.signIn) return 'Войти'
    if(type.signUp) return 'Регистрация'
    return 'Создать канал'
}

const ButtonSubmit: FC<Props> = (props) => {

    const { isSubmitting, signIn, signUp } = props

    return (
        // <div>
        //     <button style={{ width: '100%' }}
        //         disabled={isSubmitting}>
        //         {isSubmitting ? <Preloader /> : signUp ? 'регистрация' : 'войти'}
        //     </button>
        // </div>
        <div>
            <button style={{ width: '100%' }}
                disabled={isSubmitting}>
                {isSubmitting ? <Preloader /> : defineTypeButton(props)}
            </button>
        </div>
    );
}

export default ButtonSubmit;