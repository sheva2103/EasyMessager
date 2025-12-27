import { UseFormRegister } from 'react-hook-form';
import styles from './Styles.module.scss'
import { SignInSignUpForm } from '../../types/types';
import { FC } from 'react';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';

type Props = {
    register: UseFormRegister<SignInSignUpForm>
}

const RememberMeInput: FC<Props> = ({register}) => {
    const {t} = useTypedTranslation()
    return (
        <div className={styles.checkboxBlock}>
            <label>
                <input type="checkbox" {...register('rememberMe')} />
                <span>{t('form.rememberMe')}</span>
            </label>
        </div>
    );
}

export default RememberMeInput;