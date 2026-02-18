import React, { useEffect, useState } from 'react'
import { Snackbar, Button, IconButton, Typography, Box } from '@mui/material'
import CloseIcon from '../../assets/closeDesktop.svg'
import ShareIcon from '../../assets/box-arrow-left.svg'
import styles from '../HomePage/HomePage.module.scss'
import { useTypedTranslation } from '../../hooks/useTypedTranslation'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
    const [showIOSPrompt, setShowIOSPrompt] = useState(false);
    const {t} = useTypedTranslation()

    useEffect(() => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone === true;
        if (isStandalone) return;

        //chrome
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowAndroidPrompt(true);
        };

        //iOS (Safari)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        if (isIOS && !isStandalone) {
            const timer = setTimeout(() => setShowIOSPrompt(true), 5000);
            return () => clearTimeout(timer);
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', () => {
            setShowAndroidPrompt(false);
            setDeferredPrompt(null);
        });

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowAndroidPrompt(false);
        }
    };

    const handleClose = () => {
        setShowAndroidPrompt(false);
        setShowIOSPrompt(false);
    };

    return (
        <>
            {/*Chrome */}
            <Snackbar
                open={showAndroidPrompt}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                onClose={handleClose}
                message={t('pwa.message')}
                action={
                    <>
                        <Button sx={{color: '#8774e1'}} size="small" onClick={handleInstallClick}>
                            {t('pwa.install')}
                        </Button>
                        <IconButton size="small" color="inherit" onClick={handleClose}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </>
                }
            />

            {/*iOS (Safari) */}
            <Snackbar
                open={showIOSPrompt}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                onClose={handleClose}
            >
                <Box sx={{
                    bgcolor: '#313131',
                    color: '#eeebeb',
                    p: 2,
                    borderRadius: 1,
                    boxShadow: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <Typography variant="body2" textAlign="center">
                        {t('pwa.iosMessage1')}
                        <div className={styles.shareChatButton__icon}><ShareIcon /></div>
                        {t('pwa.iosMessage2')} <b>{t('pwa.iosMessage3')}</b>
                    </Typography>
                    <Button size="small" onClick={handleClose}>OK</Button>
                </Box>
            </Snackbar>
        </>
    );
};