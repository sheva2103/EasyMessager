import { FC } from "react";
import styles from './Styles.module.scss'
import { SubmitHandler, useForm } from "react-hook-form";
import ButtonSubmit from "./ButtonSubmit";

type Form = {
    name: string,
    isOpen?: string | null,
}

const OPEN = 'open'
const CLOSED = 'closed'

function defineTypeChannel(data: Form): boolean {
    if(data.isOpen === OPEN) return true
    return false
}

//const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

//проверить задержку

const CreateChannel: FC = () => {

    const {register, handleSubmit, formState: {errors, isSubmitting}, reset, setError} = useForm<Form>({
        mode: 'onSubmit',
        defaultValues: {
            isOpen: OPEN
        }
    })

    const submit: SubmitHandler<Form> = (data) => {

        console.log(data)
        const submitData = {name: data.name, isOpen: defineTypeChannel(data) }
        console.log(submitData)
        reset()
    }

    return ( 
        <form className={styles.group} onSubmit={handleSubmit(submit)}>
            <div className={styles.item}>
                <input 
                    type="text" 
                    placeholder="Введите название" 
                    {...register('name',
                        {required: { value: true, message: 'обязательное поле' }, 
                        minLength: {value: 4, message: 'минимум 4 символа'},
                        maxLength: {value: 20, message: 'максимум 20 символов'}
                    })}
                />
                <div className={styles.error}>
                    {errors.name && <span>{errors.name.message}</span>}
                </div>
            </div>
            <div className={styles.item}>
                <div className={styles.labelGroup}>
                    <label>
                        <input type="radio" name="type" value={OPEN} {...register('isOpen')}/>
                        открытый
                    </label>
                    <label>
                        <input type="radio" name="type" value={CLOSED} {...register('isOpen')}/>
                        закрытый
                    </label>
                </div>
            </div>
            <div className={styles.item}>
                <ButtonSubmit isSubmitting={isSubmitting}/>
            </div>
        </form>
    );
}

export default CreateChannel;