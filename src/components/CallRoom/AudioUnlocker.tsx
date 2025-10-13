// src/components/AudioUnlocker/AudioUnlocker.tsx

import { FC, useEffect, useState } from "react";
import silence from '../../assets/silence.mp3'

const AudioUnlocker: FC = () => {
    const [isUnlocked, setIsUnlocked] = useState(false);

    useEffect(() => {
        if (isUnlocked) {
            return;
        }

        const unlockAudio = async () => {
            // 1. Разблокировка через Web Audio API (для большинства браузеров)
            const audioContext = new (window.AudioContext || window.AudioContext)();
            if (audioContext.state === "suspended") {
                await audioContext.resume();
            }

            // 2. Ключевой шаг для iOS: воспроизводим тишину
            const audio = new Audio(silence); // Путь к вашему файлу

            try {
                // Play() возвращает Promise. Мы должны его обработать.
                await audio.play();

                // Если мы дошли до сюда - звук разблокирован
                console.log("Audio unlocked successfully!");
                setIsUnlocked(true);

            } catch (error) {
                console.error("Failed to unlock audio:", error);
                // Ошибка может возникнуть, если пользователь еще не взаимодействовал со страницей
            }
        };

        // Используем 'touchend' - это самое надежное событие для iOS
        // 'click' добавляем для совместимости с десктопом
        document.addEventListener("touchend", unlockAudio, { once: true });
        document.addEventListener("click", unlockAudio, { once: true });

        return () => {
            // Очистка на случай, если компонент размонтируется
            document.removeEventListener("touchend", unlockAudio);
            document.removeEventListener("click", unlockAudio);
        };
    }, [isUnlocked]);

    // Этот компонент ничего не рендерит
    return null;
};

export default AudioUnlocker;