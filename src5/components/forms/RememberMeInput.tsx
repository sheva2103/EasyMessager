import { UseFormRegister } from 'react-hook-form';
import styles from './Styles.module.scss'
import { SignInSignUpForm } from '../../types/types';
import { FC } from 'react';

type Props = {
    register: UseFormRegister<SignInSignUpForm>
}

const RememberMeInput: FC<Props> = ({register}) => {
    return (
        <div className={styles.checkboxBlock}>
            <label>
                <input type="checkbox" {...register('rememberMe')} />
                <span>Запомнить меня</span>
            </label>
        </div>
    );
}

export default RememberMeInput;