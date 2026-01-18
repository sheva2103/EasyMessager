import { FC, useState } from "react";
import styles from './Styles.module.scss'
import DialogComponent from "../Settings/DialogComponent";
import EmailInput from "./EmailInput";
import { SubmitHandler, useForm } from "react-hook-form";
import { SignInSignUpForm } from "../../types/types";
import { profileAPI } from "../../API/api";
import { Alert, Snackbar } from "@mui/material";
import { useTypedTranslation } from "../../hooks/useTypedTranslation";

type OptionsType = {
    isOpen: boolean,
    message: string | null,
    isError: boolean
}


const Form: FC<{showStatus: (options: OptionsType) => void}> = ({showStatus}) => {

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<SignInSignUpForm>({
        mode: 'onChange'
    })

    const {t} = useTypedTranslation()

    const submit: SubmitHandler<SignInSignUpForm> = async (data) => {

        try {
            await profileAPI.resetPassword(data.email)
            reset()
            showStatus({isOpen: true,
                        message: t('form.messageSuccessResetPass'), 
                        isError: false})
        } catch (error: any) {
            showStatus({isOpen: true,
                        message: `${t('form.messageErrResetPass') + error.message}`, 
                        isError: true})
        }
    }

    return (
        <div className={styles.group}>
            <form onSubmit={handleSubmit(submit)}>
                <EmailInput register={register} isSubmitting={isSubmitting} errors={errors} />
                <button disabled={isSubmitting}>{t('send')}</button>
            </form>
        </div>
    )
}



const ResetPassword: FC = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [snackbar, setSnackbar] = useState<OptionsType>({ isOpen: false, message: null, isError: false })

    const closeSnackBar = () => setSnackbar({ isOpen: false, message: null, isError: false })
    const openSnackBar = (options: OptionsType) => {
        setSnackbar(options)
        setIsOpen(false)
    }

    return (
        <div className={styles.resetPassword}>
            <span onClick={() => setIsOpen(true)}>Забыл пароль ?</span>
            <DialogComponent isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <Form showStatus={openSnackBar}/>
            </DialogComponent>
            <Snackbar open={snackbar.isOpen} autoHideDuration={6000} onClose={closeSnackBar}>
                <Alert
                    onClose={closeSnackBar}
                    severity={snackbar.isError ? 'error' : 'success'}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default ResetPassword;