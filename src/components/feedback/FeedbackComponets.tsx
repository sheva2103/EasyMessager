import { Alert, Snackbar } from "@mui/material";
import { FC } from "react";


export const ErrorConnectionComponent: FC<{errorConnection: boolean, closeErrorConnection?: () => void}> = ({errorConnection, closeErrorConnection}) => {

    const onClose = () => {
        if (closeErrorConnection) closeErrorConnection()
    }

    return (
        <Snackbar open={errorConnection} autoHideDuration={6000} onClose={onClose}>
            <Alert
                onClose={closeErrorConnection}
                severity='error'
                variant="filled"
                sx={{ width: '100%' }}
            >
                Ошибка подключения. Попробуйте позже.
            </Alert>
        </Snackbar>
    );
}
