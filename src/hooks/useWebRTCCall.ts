/**
 * @author sheva2103
 * @project EasyMessager
 * @license MIT
 * @GitHub https://github.com/sheva2103/EasyMessager
 * @email 2103sheva@gmail.com
 * @copyright (c) 2025 Aleksandr (GitHub: sheva2103)
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import {
    doc,
    onSnapshot,
    collection,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { CallEndStatus } from '../types/types';

type CallState = 'idle' | 'calling' | 'incoming' | 'connected' | 'error' | 'ended';

interface UseWebRTCCallReturn {
    callState: CallState;
    errorMessage: string | null;
    callDuration: number;
    callerUid: string | null;
    startCall: () => Promise<void>;
    acceptCall: () => Promise<void>;
    rejectCall: () => Promise<void>;
    endCall: () => Promise<void>;
    remoteAudioRef: React.RefObject<HTMLAudioElement>;
    ringtoneRef: React.RefObject<HTMLAudioElement>;
    incomingRef: React.RefObject<HTMLAudioElement>;
    formatDuration: (seconds: number) => string;
    isMicMuted: boolean;
    isSpeakerMuted: boolean;
    toggleMic: () => void;
    toggleSpeaker: () => void;
}

// const rtcConfig: RTCConfiguration = {
//     iceServers: [
//         {
//             urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
//         },
//         {
//             urls: 'turn:global.relay.metered.ca:443',
//             username: process.env.REACT_APP_TURN_USERNAME,
//             credential: process.env.REACT_APP_TURN_PASSWORD
//         },
//     ],
//     iceCandidatePoolSize: 10,
// };

const DEFAULT_STUN_CONFIG: RTCConfiguration = {
    iceServers: [
        {
            urls: [
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302'
            ],
        },
    ],
    iceCandidatePoolSize: 10,
};

export const useWebRTCCall = (
    myUid: string,
    calleeUid: string,
    startCallFunc: (mode: "incoming" | "outgoing") => void,
    endCallFunc?: (callDuration: string, status: CallEndStatus) => void,
): UseWebRTCCallReturn => {
    const [dynamicRtcConfig, setDynamicRtcConfig] = useState<RTCConfiguration>(DEFAULT_STUN_CONFIG);
    const [roomId, setRoomId] = useState('');
    const [callState, setCallState] = useState<CallState>('idle');
    const [incomingRoomId, setIncomingRoomId] = useState<string | null>(null);
    const [callerUid, setCallerUid] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [callDuration, setCallDuration] = useState(0);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);

    const callDurationRef = useRef(0);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
    const hasEndedRef = useRef(false);
    const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const ringtoneRef = useRef<HTMLAudioElement | null>(null);
    const incomingRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const configDoc = await getDoc(doc(db, 'settings', 'webrtc'));
                if (configDoc.exists()) {
                    const data = configDoc.data();
                    const newConfig: RTCConfiguration = {
                        iceServers: [
                            ...DEFAULT_STUN_CONFIG.iceServers!,
                            {
                                urls: data.turnUrls,
                                username: data.turnUsername,
                                credential: data.turnCredential,
                            },
                        ],
                        iceCandidatePoolSize: 10,
                    };

                    setDynamicRtcConfig(newConfig);
                    console.log("Полная конфигурация WebRTC загружена из Firestore");
                }
            } catch (e) {
                console.warn("Ошибка загрузки из Firestore, работаем на дефолтном STUN", e);
            }
        };
        fetchConfig();
    }, []);

    useEffect(() => { callDurationRef.current = callDuration; }, [callDuration]);

    const formatDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    const stopAudios = () => {
        [ringtoneRef, incomingRef].forEach(ref => {
            if (ref.current) {
                ref.current.pause();
                ref.current.currentTime = 0;
            }
        });
    };

    const logConnectionStats = async () => {
        if (!pcRef.current) return;
        try {
            const stats = await pcRef.current.getStats();
            let found = false;

            stats.forEach(report => {
                if (report.type === 'candidate-pair' && (report.active === true || report.state === 'succeeded')) {
                    const local = stats.get(report.localCandidateId);
                    const remote = stats.get(report.remoteCandidateId);

                    if (local && remote) {
                        found = true;
                        console.log("-----------------------------------------");
                        console.log(`[WebRTC ПОДКЛЮЧЕНО]`);
                        console.log(`Локальный кандидат: ${local.candidateType} (${local.ip || 'localhost'})`);
                        console.log(`Удаленный кандидат: ${remote.candidateType} (${remote.ip || 'localhost'})`);

                        if (local.candidateType === 'relay' || remote.candidateType === 'relay') {
                            console.warn("🌐 Соединение через TURN-реле (Успех!)");
                        } else if (local.candidateType === 'srflx' && remote.candidateType === 'srflx') {
                            console.info("Чистое P2P соединение (STUN)");
                        } else {
                            console.info("Локальное соединение (Host)");
                        }
                        console.log("-----------------------------------------");
                    }
                }
            });

            if (!found) {
                console.log("[WebRTC] Активная пара еще не определена в статистике...");
            }
        } catch (e) {
            console.error("Ошибка получения статистики:", e);
        }
    };

    const cleanupResources = useCallback(async () => {
        stopAudios();
        if (durationTimerRef.current) clearInterval(durationTimerRef.current);

        localStreamRef.current?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        remoteStreamRef.current?.getTracks().forEach((track: MediaStreamTrack) => track.stop());

        if (pcRef.current) {
            pcRef.current.onicecandidate = null;
            pcRef.current.ontrack = null;
            pcRef.current.oniceconnectionstatechange = null;
            pcRef.current.close();
            pcRef.current = null;
        }

        const currentRoomId = roomId || incomingRoomId;
        if (currentRoomId) {
            const roomRef = doc(db, 'rooms', currentRoomId);
            try {
                const [callerCands, calleeCands] = await Promise.all([
                    getDocs(collection(roomRef, 'callerCandidates')),
                    getDocs(collection(roomRef, 'calleeCandidates'))
                ]);
                callerCands.forEach(d => deleteDoc(d.ref));
                calleeCands.forEach(d => deleteDoc(d.ref));
                await deleteDoc(roomRef);
            } catch (e) { console.warn("Firebase cleanup suppressed:", e); }
        }

        await deleteDoc(doc(db, 'calls', myUid)).catch(() => { });
        await deleteDoc(doc(db, 'calls', calleeUid)).catch(() => { });

    }, [roomId, incomingRoomId, myUid, calleeUid]);

    const endCall = useCallback(async () => {
        if (hasEndedRef.current) return;
        hasEndedRef.current = true;

        let finalStatus: CallEndStatus = callDurationRef.current > 0 ? 'completed' : 'unanswered';
        if (callState === 'idle' && callDurationRef.current === 0) finalStatus = 'rejected';

        endCallFunc?.(formatDuration(callDurationRef.current), finalStatus);
        await cleanupResources();

        setCallState('ended');
        setRoomId('');
        setIncomingRoomId(null);
        setCallerUid(null);
        setCallDuration(0);
        pendingCandidates.current = [];
    }, [callState, endCallFunc, cleanupResources]);

    useEffect(() => {
        const handleUnload = () => {
            if (callState !== 'idle' && callState !== 'ended') cleanupResources();
        };
        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, [callState, cleanupResources]);

    const setupPeerConnection = (isCaller: boolean, roomRef: any) => {

        if (!dynamicRtcConfig) {
            console.error("Конфигурация еще не загружена!");
            return;
        }

        pcRef.current = new RTCPeerConnection(dynamicRtcConfig);


        pcRef.current.oniceconnectionstatechange = () => {
            const state = pcRef.current?.iceConnectionState;
            console.log("[WebRTC] ICE State:", state);

            if (state === 'connected') {
                logConnectionStats();
                setTimeout(logConnectionStats, 3000);
            }

            if (state === 'failed' || state === 'disconnected') {
                endCall();
            }
        };

        remoteStreamRef.current = new MediaStream();
        pcRef.current.ontrack = event => {
            event.streams[0].getTracks().forEach((track: MediaStreamTrack) => {
                remoteStreamRef.current?.addTrack(track);
            });
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = remoteStreamRef.current;
                remoteAudioRef.current.play().catch(() => { });
            }
            stopAudios();
            setCallState('connected');
            if (!durationTimerRef.current) {
                setCallDuration(0);
                durationTimerRef.current = setInterval(() => setCallDuration(p => p + 1), 1000);
            }
        };

        pcRef.current.onicecandidate = async event => {
            if (event.candidate) {
                const candsRef = collection(roomRef, isCaller ? 'callerCandidates' : 'calleeCandidates');
                await addDoc(candsRef, event.candidate.toJSON());
            }
        };

        onSnapshot(roomRef, (snap: DocumentSnapshot) => {
            if (!snap.exists()) endCall();
        });
    };

    const processCandidates = async () => {
        if (!pcRef.current) return;
        for (const cand of pendingCandidates.current) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(cand)).catch(e => console.error(e));
        }
        pendingCandidates.current = [];
    };

    const subscribeToCandidates = (roomRef: any, collectionName: string) => {
        onSnapshot(collection(roomRef, collectionName), snap => {
            snap.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    if (pcRef.current?.remoteDescription) {
                        await pcRef.current.addIceCandidate(new RTCIceCandidate(data)).catch(() => { });
                    } else {
                        pendingCandidates.current.push(data);
                    }
                }
            });
        });
    };

    const startCall = async () => {

        if (!dynamicRtcConfig) {
            setErrorMessage("Система инициализируется, подождите секунду...");
            return;
        }

        hasEndedRef.current = false;
        setCallState('calling');
        ringtoneRef.current?.play().catch(() => { });

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const roomRef = doc(collection(db, 'rooms'));
            setRoomId(roomRef.id);
            setupPeerConnection(true, roomRef);

            localStreamRef.current = stream;
            stream.getTracks().forEach((track: MediaStreamTrack) => {
                pcRef.current?.addTrack(track, stream);
            });

            const offer = await pcRef.current!.createOffer();
            await pcRef.current!.setLocalDescription(offer);
            await setDoc(roomRef, { offer });

            await setDoc(doc(db, 'calls', calleeUid), {
                from: myUid, roomId: roomRef.id, timestamp: Date.now(), status: 'incoming',
            });

            subscribeToCandidates(roomRef, 'calleeCandidates');
            onSnapshot(roomRef, async snap => {
                const data = snap.data();
                if (data?.answer && !pcRef.current?.currentRemoteDescription) {
                    await pcRef.current!.setRemoteDescription(new RTCSessionDescription(data.answer));
                    await processCandidates();
                }
            });
            startCallFunc('outgoing');
        } catch (e) {
            ringtoneRef.current?.pause();
            ringtoneRef.current!.currentTime = 0;
            setErrorMessage('errorMicro');
            setCallState('error');
        }
    };

    const acceptCall = async () => {
        if (!incomingRoomId) return;
        hasEndedRef.current = false;
        setRoomId(incomingRoomId);
        setCallState('calling');
        stopAudios();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const roomRef = doc(db, 'rooms', incomingRoomId);
            const roomData = (await getDoc(roomRef)).data();
            if (!roomData) return endCall();

            setupPeerConnection(false, roomRef);
            localStreamRef.current = stream;
            stream.getTracks().forEach((track: MediaStreamTrack) => {
                pcRef.current?.addTrack(track, stream);
            });

            await pcRef.current!.setRemoteDescription(new RTCSessionDescription(roomData.offer));
            await processCandidates();

            const answer = await pcRef.current!.createAnswer();
            await pcRef.current!.setLocalDescription(answer);
            await setDoc(roomRef, { answer }, { merge: true });

            subscribeToCandidates(roomRef, 'callerCandidates');
        } catch (e) {
            console.error(e);
            endCall();
        }
    };

    const rejectCall = async () => {
        endCallFunc?.(formatDuration(0), 'rejected');
        await cleanupResources();
        setCallState('idle');
    };

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'calls', myUid), snap => {

            if (!snap.exists()) { 
                if (callState === 'incoming') {
                    stopAudios();
                    setCallState('idle');
                    setIncomingRoomId(null);
                    rejectCall()
                }
                return;
            }

            const data = snap.data();
            if (data?.status === 'incoming' && callState === 'idle') {
                setIncomingRoomId(data.roomId);
                setCallerUid(data.from);
                setCallState('incoming');
                incomingRef.current?.play().catch(() => { });
            }
            if (!snap.exists() && callState === 'incoming') {
                stopAudios();
                setCallState('idle');
            }
        });
        return () => unsubscribe();
    }, [myUid, callState]);

    const toggleMic = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach((t: MediaStreamTrack) => t.enabled = !t.enabled);
            setIsMicMuted(p => !p);
        }
    };

    const toggleSpeaker = () => {
        if (remoteAudioRef.current) {
            remoteAudioRef.current.muted = !remoteAudioRef.current.muted;
            setIsSpeakerMuted(p => !p);
        }
    };

    return {
        callState, errorMessage, callDuration, callerUid,
        startCall, acceptCall, rejectCall, endCall, formatDuration,
        remoteAudioRef, ringtoneRef, incomingRef, isMicMuted,
        isSpeakerMuted, toggleMic, toggleSpeaker
    };
};


// export const useWebRTCCall = (
//     myUid: string,
//     calleeUid: string,
//     startCallFunc: (mode: "incoming" | "outgoing") => void,
//     endCallFunc?: (callDuration: string, status: CallEndStatus) => void,
// ): UseWebRTCCallReturn => {
//     const [dynamicRtcConfig, setDynamicRtcConfig] = useState<RTCConfiguration>(DEFAULT_STUN_CONFIG);
//     const [roomId, setRoomId] = useState('');
//     const [callState, setCallState] = useState<CallState>('idle');
//     const [incomingRoomId, setIncomingRoomId] = useState<string | null>(null);
//     const [callerUid, setCallerUid] = useState<string | null>(null);
//     const [errorMessage, setErrorMessage] = useState<string | null>(null);
//     const [callDuration, setCallDuration] = useState(0);
//     const [isMicMuted, setIsMicMuted] = useState(false);
//     const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);

//     const callDurationRef = useRef(0);
//     const localStreamRef = useRef<MediaStream | null>(null);
//     const remoteStreamRef = useRef<MediaStream | null>(null);
//     const pcRef = useRef<RTCPeerConnection | null>(null);
//     const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
//     const hasEndedRef = useRef(false);
//     const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

//     const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
//     const ringtoneRef = useRef<HTMLAudioElement | null>(null);
//     const incomingRef = useRef<HTMLAudioElement | null>(null);

//     const silentAudioCtxRef = useRef<AudioContext | null>(null)
//     const silentAudioHtmlRef = useRef<HTMLAudioElement | null>(null);
//     const wakeLockRef = useRef<any>(null)


//     const startSilentAudio = () => {
//         //ГЕНЕРАЦИЯ ТИШИНЫ
//         try {
//             if (!silentAudioHtmlRef.current) {
//                 const audio = new Audio('../assets/silence.mp3');
//                 audio.loop = true;
//                 audio.volume = 0.01;
//                 silentAudioHtmlRef.current = audio;
//             }

//             silentAudioHtmlRef.current.play().catch(e => {
//                 console.warn("[PWA iOS] Ошибка автовоспроизведения:", e);
//             });
//         } catch (e) {
//             console.warn("[PWA iOS] Не удалось запустить фоновое аудио:", e);
//         }
//     };

//     const stopSilentAudio = () => {
//         if (silentAudioHtmlRef.current) {
//             silentAudioHtmlRef.current.pause();
//             silentAudioHtmlRef.current.currentTime = 0;
//             silentAudioHtmlRef.current = null;
//         }
//     };


//     const setupMediaSession = () => {
//         //МЕДИА СЕССИЯ ДЛЯ ЭКРАНА БЛОКИРОВКИ
//         if ('mediaSession' in navigator) {
//             navigator.mediaSession.metadata = new MediaMetadata({
//                 title: 'Активный вызов',
//                 artist: 'EasyMessenger',
//                 album: 'Разговор по сети',
//                 // artwork: [
//                 //     { src: '../../public/icons/logo512.png', sizes: '512x512', type: 'image/png' }
//                 // ]
//             });

//             try {
//                 navigator.mediaSession.setActionHandler('play', () => { });
//                 navigator.mediaSession.setActionHandler('pause', () => { });
//                 navigator.mediaSession.setActionHandler('hangup' as any, () => endCall());

//                 navigator.mediaSession.playbackState = 'playing';
//             } catch (error) {
//                 console.warn("[MediaSession] Ошибка:", error);
//             }
//         }
//     };

//     const clearMediaSession = () => {
//         if ('mediaSession' in navigator) {
//             navigator.mediaSession.metadata = null;
//             try {
//                 navigator.mediaSession.setActionHandler('play', null);
//                 navigator.mediaSession.setActionHandler('pause', null);
//                 navigator.mediaSession.setActionHandler('hangup' as any, null);
//             } catch (error) {
//                 console.warn("[MediaSession] Ошибка при очистке обработчиков:", error);
//             }
//         }
//     };


//     const requestWakeLock = async () => {
//         //виджет на скринлоке
//         try {
//             if ('wakeLock' in navigator) {
//                 wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
//             }
//         } catch (err) {
//             console.warn("[PWA] WakeLock заблокирован системой:", err);
//         }
//     };

//     const releaseWakeLock = () => {
//         if (wakeLockRef.current) {
//             wakeLockRef.current.release().catch(() => { });
//             wakeLockRef.current = null;
//         }
//     };

//     useEffect(() => {
//         const fetchConfig = async () => {
//             try {
//                 const configDoc = await getDoc(doc(db, 'settings', 'webrtc'))
//                 if (configDoc.exists()) {
//                     const data = configDoc.data();
//                     const newConfig: RTCConfiguration = {
//                         iceServers: [
//                             ...DEFAULT_STUN_CONFIG.iceServers!,
//                             {
//                                 urls: data.turnUrls,
//                                 username: data.turnUsername,
//                                 credential: data.turnCredential,
//                             },
//                         ],
//                         iceCandidatePoolSize: 10,
//                     };
//                     setDynamicRtcConfig(newConfig);
//                     console.log("Полная конфигурация WebRTC загружена из Firestore")
//                 }
//             } catch (e) {
//                 console.warn("Ошибка загрузки из Firestore, работаем на дефолтном STUN", e)
//             }
//         };
//         fetchConfig();
//     }, []);

//     useEffect(() => { callDurationRef.current = callDuration; }, [callDuration])

//     const formatDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

//     const stopAudios = () => {
//         [ringtoneRef, incomingRef].forEach(ref => {
//             if (ref.current) {
//                 ref.current.pause()
//                 ref.current.currentTime = 0
//             }
//         })
//     };

//     const logConnectionStats = async () => {
//         if (!pcRef.current) return
//         try {
//             const stats = await pcRef.current.getStats()
//             let found = false
//             stats.forEach(report => {
//                 if (report.type === 'candidate-pair' && (report.active === true || report.state === 'succeeded')) {
//                     const local = stats.get(report.localCandidateId)
//                     const remote = stats.get(report.remoteCandidateId)
//                     if (local && remote) {
//                         found = true
//                         console.log("-----------------------------------------");
//                         console.log(`[WebRTC ПОДКЛЮЧЕНО]`);
//                         console.log(`Локальный кандидат: ${local.candidateType} (${local.ip || 'localhost'})`)
//                         console.log(`Удаленный кандидат: ${remote.candidateType} (${remote.ip || 'localhost'})`)
//                         console.log("-----------------------------------------");
//                     }
//                 }
//             });
//         } catch (e) {
//             console.error("Ошибка получения статистики:", e);
//         }
//     }

//     const cleanupResources = useCallback(async () => {
//         stopAudios()

//         stopSilentAudio();
//         clearMediaSession();
//         releaseWakeLock();

//         if (durationTimerRef.current) clearInterval(durationTimerRef.current);

//         localStreamRef.current?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
//         remoteStreamRef.current?.getTracks().forEach((track: MediaStreamTrack) => track.stop());

//         if (pcRef.current) {
//             pcRef.current.onicecandidate = null;
//             pcRef.current.ontrack = null;
//             pcRef.current.oniceconnectionstatechange = null;
//             pcRef.current.close();
//             pcRef.current = null;
//         }

//         const currentRoomId = roomId || incomingRoomId;
//         if (currentRoomId) {
//             const roomRef = doc(db, 'rooms', currentRoomId);
//             try {
//                 const [callerCands, calleeCands] = await Promise.all([
//                     getDocs(collection(roomRef, 'callerCandidates')),
//                     getDocs(collection(roomRef, 'calleeCandidates'))
//                 ]);
//                 callerCands.forEach(d => deleteDoc(d.ref));
//                 calleeCands.forEach(d => deleteDoc(d.ref));
//                 await deleteDoc(roomRef);
//             } catch (e) { console.warn("Firebase cleanup suppressed:", e); }
//         }

//         await deleteDoc(doc(db, 'calls', myUid)).catch(() => { });
//         await deleteDoc(doc(db, 'calls', calleeUid)).catch(() => { });

//     }, [roomId, incomingRoomId, myUid, calleeUid]);

//     const endCall = useCallback(async () => {
//         if (hasEndedRef.current) return;
//         hasEndedRef.current = true;

//         let finalStatus: CallEndStatus = callDurationRef.current > 0 ? 'completed' : 'unanswered';
//         if (callState === 'idle' && callDurationRef.current === 0) finalStatus = 'rejected';

//         endCallFunc?.(formatDuration(callDurationRef.current), finalStatus);
//         await cleanupResources();

//         setCallState('ended');
//         setRoomId('');
//         setIncomingRoomId(null);
//         setCallerUid(null);
//         setCallDuration(0);
//         pendingCandidates.current = [];
//     }, [callState, endCallFunc, cleanupResources]);

//     useEffect(() => {
//         const handleUnload = () => {
//             if (callState !== 'idle' && callState !== 'ended') cleanupResources();
//         };
//         window.addEventListener('beforeunload', handleUnload);
//         return () => window.removeEventListener('beforeunload', handleUnload);
//     }, [callState, cleanupResources]);

//     const setupPeerConnection = (isCaller: boolean, roomRef: any) => {
//         if (!dynamicRtcConfig) return;

//         pcRef.current = new RTCPeerConnection(dynamicRtcConfig);

//         pcRef.current.oniceconnectionstatechange = () => {
//             const state = pcRef.current?.iceConnectionState;
//             if (state === 'connected') {
//                 logConnectionStats();
//             }
//             if (state === 'failed' || state === 'disconnected') {
//                 endCall();
//             }
//         };

//         remoteStreamRef.current = new MediaStream();
//         pcRef.current.ontrack = event => {
//             event.streams[0].getTracks().forEach((track: MediaStreamTrack) => {
//                 remoteStreamRef.current?.addTrack(track);
//             });
//             if (remoteAudioRef.current) {
//                 remoteAudioRef.current.srcObject = remoteStreamRef.current;
//                 remoteAudioRef.current.play().catch(() => { });
//             }
//             stopAudios();
//             setCallState('connected');

//             setupMediaSession();

//             if (!durationTimerRef.current) {
//                 setCallDuration(0);
//                 durationTimerRef.current = setInterval(() => setCallDuration(p => p + 1), 1000);
//             }
//         };

//         pcRef.current.onicecandidate = async event => {
//             if (event.candidate) {
//                 const candsRef = collection(roomRef, isCaller ? 'callerCandidates' : 'calleeCandidates');
//                 await addDoc(candsRef, event.candidate.toJSON());
//             }
//         };

//         onSnapshot(roomRef, (snap: DocumentSnapshot) => {
//             if (!snap.exists()) endCall();
//         });
//     };

//     const processCandidates = async () => {
//         if (!pcRef.current) return;
//         for (const cand of pendingCandidates.current) {
//             await pcRef.current.addIceCandidate(new RTCIceCandidate(cand)).catch(e => console.error(e));
//         }
//         pendingCandidates.current = [];
//     };

//     const subscribeToCandidates = (roomRef: any, collectionName: string) => {
//         onSnapshot(collection(roomRef, collectionName), snap => {
//             snap.docChanges().forEach(async change => {
//                 if (change.type === 'added') {
//                     const data = change.doc.data();
//                     if (pcRef.current?.remoteDescription) {
//                         await pcRef.current.addIceCandidate(new RTCIceCandidate(data)).catch(() => { });
//                     } else {
//                         pendingCandidates.current.push(data);
//                     }
//                 }
//             });
//         });
//     };

//     const startCall = async () => {
//         if (!dynamicRtcConfig) {
//             setErrorMessage("Система инициализируется, подождите секунду...");
//             return;
//         }

//         startSilentAudio();
//         requestWakeLock();

//         hasEndedRef.current = false;
//         setCallState('calling');
//         ringtoneRef.current?.play().catch(() => { });

//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//             const roomRef = doc(collection(db, 'rooms'));
//             setRoomId(roomRef.id);
//             setupPeerConnection(true, roomRef);

//             localStreamRef.current = stream;
//             stream.getTracks().forEach((track: MediaStreamTrack) => {
//                 pcRef.current?.addTrack(track, stream);
//             });

//             const offer = await pcRef.current!.createOffer();
//             await pcRef.current!.setLocalDescription(offer);
//             await setDoc(roomRef, { offer });

//             await setDoc(doc(db, 'calls', calleeUid), {
//                 from: myUid, roomId: roomRef.id, timestamp: Date.now(), status: 'incoming',
//             });

//             subscribeToCandidates(roomRef, 'calleeCandidates');
//             onSnapshot(roomRef, async snap => {
//                 const data = snap.data();
//                 if (data?.answer && !pcRef.current?.currentRemoteDescription) {
//                     await pcRef.current!.setRemoteDescription(new RTCSessionDescription(data.answer));
//                     await processCandidates();
//                 }
//             });
//             startCallFunc('outgoing');
//         } catch (e) {
//             cleanupResources();
//             setErrorMessage('errorMicro');
//             setCallState('error');
//         }
//     };

//     const acceptCall = async () => {
//         if (!incomingRoomId) return;

//         startSilentAudio();
//         requestWakeLock();

//         hasEndedRef.current = false;
//         setRoomId(incomingRoomId);
//         setCallState('calling');
//         stopAudios();

//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//             const roomRef = doc(db, 'rooms', incomingRoomId);
//             const roomData = (await getDoc(roomRef)).data();
//             if (!roomData) return endCall();

//             setupPeerConnection(false, roomRef);
//             localStreamRef.current = stream;
//             stream.getTracks().forEach((track: MediaStreamTrack) => {
//                 pcRef.current?.addTrack(track, stream);
//             });

//             await pcRef.current!.setRemoteDescription(new RTCSessionDescription(roomData.offer));
//             await processCandidates();

//             const answer = await pcRef.current!.createAnswer();
//             await pcRef.current!.setLocalDescription(answer);
//             await setDoc(roomRef, { answer }, { merge: true });

//             subscribeToCandidates(roomRef, 'callerCandidates');
//         } catch (e) {
//             console.error(e);
//             endCall();
//         }
//     };

//     const rejectCall = async () => {
//         endCallFunc?.(formatDuration(0), 'rejected');
//         await cleanupResources();
//         setCallState('idle');
//     };

//     useEffect(() => {
//         const unsubscribe = onSnapshot(doc(db, 'calls', myUid), snap => {
//             if (!snap.exists()) {
//                 if (callState === 'incoming') {
//                     stopAudios();
//                     setCallState('idle');
//                     setIncomingRoomId(null);
//                     rejectCall();
//                 }
//                 return;
//             }

//             const data = snap.data();
//             if (data?.status === 'incoming' && callState === 'idle') {
//                 setIncomingRoomId(data.roomId);
//                 setCallerUid(data.from);
//                 setCallState('incoming');
//                 incomingRef.current?.play().catch(() => { });
//             }
//         });
//         return () => unsubscribe();
//     }, [myUid, callState]);

//     const toggleMic = () => {
//         if (localStreamRef.current) {
//             localStreamRef.current.getAudioTracks().forEach((t: MediaStreamTrack) => t.enabled = !t.enabled);
//             setIsMicMuted(p => !p);
//         }
//     };

//     const toggleSpeaker = () => {
//         if (remoteAudioRef.current) {
//             remoteAudioRef.current.muted = !remoteAudioRef.current.muted;
//             setIsSpeakerMuted(p => !p);
//         }
//     };

//     return {
//         callState, errorMessage, callDuration, callerUid,
//         startCall, acceptCall, rejectCall, endCall, formatDuration,
//         remoteAudioRef, ringtoneRef, incomingRef, isMicMuted,
//         isSpeakerMuted, toggleMic, toggleSpeaker
//     };
// };