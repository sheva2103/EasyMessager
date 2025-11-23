// import React, { useRef, useState, useEffect } from 'react';
// import {
//     collection,
//     doc,
//     setDoc,
//     onSnapshot,
//     getDoc,
//     addDoc,
//     deleteDoc,
//     getDocs,
//     DocumentSnapshot,
// } from 'firebase/firestore';

// import { db } from '../firebase';
// import { messagesAPI } from '../API/api';
// import { CallMessageOptionsType } from '../types/types';

// type CallState = 'idle' | 'calling' | 'incoming' | 'connected' | 'error' | 'ended'

// interface UseWebRTCCallReturn {
//     callState: CallState;
//     errorMessage: string | null;
//     callDuration: number;
//     callerUid: string | null;
//     startCall: () => Promise<void>;
//     acceptCall: () => Promise<void>;
//     rejectCall: () => Promise<void>;
//     endCall: () => Promise<void>;
//     remoteAudioRef: React.RefObject<HTMLAudioElement>;
//     ringtoneRef: React.RefObject<HTMLAudioElement>;
//     incomingRef: React.RefObject<HTMLAudioElement>;
//     formatDuration: (seconds: number) => string
// }


// export const useWebRTCCall = (myUid: string, calleeUid: string, endCallFunc?: (callDuration: string) => void): UseWebRTCCallReturn => {
//     const [roomId, setRoomId] = useState('');
//     const [callState, setCallState] = useState<'idle' | 'calling' | 'incoming' | 'connected' | 'ended' | 'error'>('idle');
//     const [incomingRoomId, setIncomingRoomId] = useState<string | null>(null);
//     const [callerUid, setCallerUid] = useState<string | null>(null);
//     const [errorMessage, setErrorMessage] = useState<string | null>(null);
//     const [callDuration, setCallDuration] = useState(0);

//     const localStreamRef = useRef<MediaStream | null>(null);
//     const remoteStreamRef = useRef<MediaStream | null>(null);
//     const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
//     const ringtoneRef = useRef<HTMLAudioElement | null>(null);
//     const incomingRef = useRef<HTMLAudioElement | null>(null);
//     const pcRef = useRef<RTCPeerConnection | null>(null);
//     const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
//     const pendingCandidates: RTCIceCandidateInit[] = [];
//     const hasEndedRef = useRef(false);

//     useEffect(() => {
//         const callRef = doc(db, 'calls', myUid);
//         return onSnapshot(callRef, snapshot => {
//             const data = snapshot.data();

//             if (data?.status === 'incoming') {
//                 if (callState === 'connected' || callState === 'calling') return;
//                 setIncomingRoomId(data.roomId);
//                 setCallerUid(data.from);
//                 setCallState('incoming');
//                 playIncomingRingtone();
//             }

//             if (!snapshot.exists() && callState === 'incoming') {
//                 stopIncomingRingtone();
//                 setCallState('idle');
//                 setIncomingRoomId(null);
//                 setCallerUid(null);
//             }
//         });
//     }, [myUid, callState]);

//     const requestMicrophone = async (): Promise<MediaStream | null> => {
//         try {
//             return await navigator.mediaDevices.getUserMedia({ audio: true });
//         } catch {
//             setErrorMessage('Не удалось получить доступ к микрофону.');
//             setCallState('error');
//             return null;
//         }
//     };

//     const playRingtone = () => ringtoneRef.current?.play().catch(() => { });
//     const stopRingtone = () => {
//         ringtoneRef.current?.pause();
//         if (ringtoneRef.current) ringtoneRef.current.currentTime = 0;
//     };

//     const playIncomingRingtone = () => incomingRef.current?.play().catch(() => { });
//     const stopIncomingRingtone = () => {
//         incomingRef.current?.pause();
//         if (incomingRef.current) incomingRef.current.currentTime = 0;
//     };

//     const attachRemoteAudio = () => {
//         if (remoteAudioRef.current && remoteStreamRef.current) {
//             remoteAudioRef.current.srcObject = remoteStreamRef.current;
//             remoteAudioRef.current.play().catch(() => { });
//         }
//     };

//     const formatDuration = (seconds: number) => {
//         const m = Math.floor(seconds / 60);
//         const s = seconds % 60;
//         return `${m}:${s.toString().padStart(2, '0')}`;
//     };

//     const setupPeerConnection = (isCaller: boolean, roomRef: any) => {
//         pcRef.current = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

//         remoteStreamRef.current = new MediaStream();
//         pcRef.current.ontrack = event => {
//             event.streams[0].getTracks().forEach(track => remoteStreamRef.current!.addTrack(track));
//             attachRemoteAudio();
//             stopRingtone();
//             stopIncomingRingtone();
//             setCallState('connected');
//             setCallDuration(0);
//             durationTimerRef.current = setInterval(() => {
//                 setCallDuration(prev => prev + 1);
//             }, 1000);
//         };

//         pcRef.current.onicecandidate = async event => {
//             if (event.candidate) {
//                 const candidatesRef = collection(roomRef, isCaller ? 'callerCandidates' : 'calleeCandidates');
//                 await addDoc(candidatesRef, event.candidate.toJSON());
//             }
//         };

//         onSnapshot(roomRef, (snapshot: DocumentSnapshot) => {
//             if (!snapshot.exists()) endCall();
//         });
//     };

//     const startCall = async () => {
//         setCallState('calling');
//         playRingtone();

//         const stream = await requestMicrophone();
//         if (!stream) return;

//         const roomRef = doc(collection(db, 'rooms'));
//         setRoomId(roomRef.id);
//         setupPeerConnection(true, roomRef);

//         localStreamRef.current = stream;
//         stream.getTracks().forEach(track => pcRef.current!.addTrack(track, stream));

//         const offer = await pcRef.current!.createOffer();
//         await pcRef.current!.setLocalDescription(offer);
//         await setDoc(roomRef, { offer });

//         await setDoc(doc(db, 'calls', calleeUid), {
//             from: myUid,
//             roomId: roomRef.id,
//             timestamp: Date.now(),
//             status: 'incoming',
//         });

//         onSnapshot(collection(roomRef, 'calleeCandidates'), snapshot => {
//             snapshot.docChanges().forEach(async change => {
//                 const candidate = new RTCIceCandidate(change.doc.data());
//                 try {
//                     if (pcRef.current?.signalingState !== 'closed') {
//                         await pcRef.current.addIceCandidate(candidate);
//                     }
//                 } catch { }
//             });
//         });

//         onSnapshot(roomRef, async snapshot => {
//             const data = snapshot.data();
//             if (data?.answer && !pcRef.current?.currentRemoteDescription) {
//                 await pcRef.current!.setRemoteDescription(new RTCSessionDescription(data.answer));
//                 for (const c of pendingCandidates) {
//                     try {
//                         if (pcRef.current?.signalingState !== 'closed') {
//                             await pcRef.current.addIceCandidate(c);
//                         }
//                     } catch { }
//                 }
//                 pendingCandidates.length = 0;
//             }
//         });
//     };

//     const acceptCall = async () => {
//         if (!incomingRoomId) return;
//         setRoomId(incomingRoomId);
//         setCallState('calling');
//         stopIncomingRingtone();

//         const stream = await requestMicrophone();
//         if (!stream) return;

//         const roomRef = doc(db, 'rooms', incomingRoomId);
//         const roomData = (await getDoc(roomRef)).data();
//         setupPeerConnection(false, roomRef);

//         localStreamRef.current = stream;
//         stream.getTracks().forEach(track => pcRef.current!.addTrack(track, stream));

//         await pcRef.current!.setRemoteDescription(new RTCSessionDescription(roomData!.offer));
//         const answer = await pcRef.current!.createAnswer();
//         await pcRef.current!.setLocalDescription(answer);
//         await setDoc(roomRef, { answer }, { merge: true });

//         onSnapshot(collection(roomRef, 'callerCandidates'), snapshot => {
//             snapshot.docChanges().forEach(async change => {
//                 const candidate = new RTCIceCandidate(change.doc.data());
//                 try {
//                     if (pcRef.current?.signalingState !== 'closed') {
//                         await pcRef.current.addIceCandidate(candidate);
//                     }
//                 } catch { }
//             });
//         });
//     };

//     const rejectCall = async () => {
//         stopIncomingRingtone();
//         setCallState('idle');
//         setIncomingRoomId(null);
//         setCallerUid(null);

//         if (incomingRoomId) {
//             const roomRef = doc(db, 'rooms', incomingRoomId);
//             const callerCandidates = await getDocs(collection(roomRef, 'callerCandidates'));
//             const calleeCandidates = await getDocs(collection(roomRef, 'calleeCandidates'));
//             [...callerCandidates.docs, ...calleeCandidates.docs].forEach(d => deleteDoc(d.ref));
//             await deleteDoc(roomRef);
//         }

//         await deleteDoc(doc(db, 'calls', myUid));
//     };

//     const endCall = async () => {
//         if (hasEndedRef.current) return;
//         hasEndedRef.current = true;

//         stopRingtone();
//         stopIncomingRingtone();
//         if (durationTimerRef.current) clearInterval(durationTimerRef.current);

//         pcRef.current?.close();
//         localStreamRef.current?.getTracks().forEach(t => t.stop());
//         remoteStreamRef.current?.getTracks().forEach(t => t.stop());
//         setCallState('ended');

//         if (roomId) {
//             const roomRef = doc(db, 'rooms', roomId);
//             const callerCandidates = await getDocs(collection(roomRef, 'callerCandidates'));
//             const calleeCandidates = await getDocs(collection(roomRef, 'calleeCandidates'));
//             [...callerCandidates.docs, ...calleeCandidates.docs].forEach(d => deleteDoc(d.ref));
//             await deleteDoc(roomRef);
//         }

//         await deleteDoc(doc(db, 'calls', calleeUid));
//         await deleteDoc(doc(db, 'calls', myUid));

//         setRoomId('');
//         setIncomingRoomId(null);
//         setCallerUid(null);

//         if(endCallFunc) endCallFunc(formatDuration(callDuration))
//     };

//     return {
//         callState, errorMessage, callDuration, callerUid,
//         startCall, acceptCall, rejectCall, endCall, formatDuration,
//         remoteAudioRef, ringtoneRef, incomingRef
//     }
// }

import { useState, useRef, useEffect } from 'react';
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

// Определения типов (без изменений)
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


export const useWebRTCCall = (
        myUid: string, 
        calleeUid: string,
        startCallFunc: (mode: "incoming" | "outgoing") => void, 
        endCallFunc?: (callDuration: string, status: CallEndStatus) => void,
    ): UseWebRTCCallReturn => {
    const [roomId, setRoomId] = useState('');
    const [callState, setCallState] = useState<CallState>('idle');
    const [incomingRoomId, setIncomingRoomId] = useState<string | null>(null);
    const [callerUid, setCallerUid] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [callDuration, setCallDuration] = useState(0);

    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);

    const callDurationRef = useRef(callDuration);

    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const ringtoneRef = useRef<HTMLAudioElement | null>(null);
    const incomingRef = useRef<HTMLAudioElement | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pendingCandidates: RTCIceCandidateInit[] = [];
    const hasEndedRef = useRef(false);

    useEffect(() => {
        callDurationRef.current = callDuration;
    }, [callDuration]);

    useEffect(() => {
        const callRef = doc(db, 'calls', myUid);
        const unsubscribe = onSnapshot(callRef, snapshot => {
            const data = snapshot.data();
            if (data?.status === 'incoming') {
                if (callState === 'connected' || callState === 'calling') return;
                setIncomingRoomId(data.roomId);
                setCallerUid(data.from);
                setCallState('incoming');
                playIncomingRingtone();
            }
            if (!snapshot.exists() && callState === 'incoming') {
                if (endCallFunc) {
                    endCallFunc(formatDuration(0), 'missed'); // Длительность 0
                }
                stopIncomingRingtone();
                setCallState('idle');
                setIncomingRoomId(null);
                setCallerUid(null);
            }
        });
        return () => unsubscribe();
    }, [myUid, callState, endCallFunc]);

    const toggleMic = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMicMuted(prev => !prev);
        }
    };

    
    const toggleSpeaker = () => {
        if (remoteAudioRef.current) {
            remoteAudioRef.current.muted = !remoteAudioRef.current.muted;
            setIsSpeakerMuted(prev => !prev);
        }
    };

    const requestMicrophone = async (): Promise<MediaStream | null> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsMicMuted(false); 
            return stream;
        } catch {
            if (endCallFunc) {
                endCallFunc(formatDuration(0), 'error'); // Длительность 0
            }
            setErrorMessage('Не удалось получить доступ к микрофону.');
            setCallState('error');
            return null;
        }
    };

    const playRingtone = () => ringtoneRef.current?.play().catch(() => { });
    const stopRingtone = () => {
        if (ringtoneRef.current) {
            ringtoneRef.current.pause();
            ringtoneRef.current.currentTime = 0;
        }
    };

    const playIncomingRingtone = () => incomingRef.current?.play().catch(() => { });
    const stopIncomingRingtone = () => {
        if (incomingRef.current) {
            incomingRef.current.pause();
            incomingRef.current.currentTime = 0;
        }
    };

    const attachRemoteAudio = () => {
        if (remoteAudioRef.current && remoteStreamRef.current) {
            remoteAudioRef.current.srcObject = remoteStreamRef.current;
            remoteAudioRef.current.muted = isSpeakerMuted;
            remoteAudioRef.current.play().catch(() => { });
        }
    };

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const endCall = async () => {
        if (hasEndedRef.current) return;
        hasEndedRef.current = true;

        let finalStatus: CallEndStatus = callDurationRef.current > 0 ? 'completed' : 'unanswered';
        console.log(callState)

        if (endCallFunc) {
            if(callState === 'idle' && callDurationRef.current === 0) finalStatus = 'rejected'
            endCallFunc(formatDuration(callDurationRef.current), finalStatus);
        }

        stopRingtone();
        stopIncomingRingtone();
        if (durationTimerRef.current) clearInterval(durationTimerRef.current);

        pcRef.current?.close();
        localStreamRef.current?.getTracks().forEach(t => t.stop());
        remoteStreamRef.current?.getTracks().forEach(t => t.stop());
        setCallState('ended');

        setIsMicMuted(false);
        setIsSpeakerMuted(false);
        if (remoteAudioRef.current) remoteAudioRef.current.muted = false;

        const currentRoomId = roomId || incomingRoomId;
        if (currentRoomId) {
            const roomRef = doc(db, 'rooms', currentRoomId);
            try {
                const callerCandidates = await getDocs(collection(roomRef, 'callerCandidates'));
                callerCandidates.forEach(candidateDoc => deleteDoc(candidateDoc.ref));
                const calleeCandidates = await getDocs(collection(roomRef, 'calleeCandidates'));
                calleeCandidates.forEach(candidateDoc => deleteDoc(candidateDoc.ref));
                await deleteDoc(roomRef);
            } catch (error) {
                console.error("Ошибка при очистке комнаты:", error)
            }
        }

        try {
            await deleteDoc(doc(db, 'calls', myUid));
        } catch { }
        try {
            await deleteDoc(doc(db, 'calls', calleeUid));
        } catch { }


        setRoomId('');
        setIncomingRoomId(null);
        setCallerUid(null);
        setCallDuration(0); // Сбрасываю длительность в конце
    };

    const setupPeerConnection = (isCaller: boolean, roomRef: any) => {
        pcRef.current = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

        remoteStreamRef.current = new MediaStream();
        pcRef.current.ontrack = event => {
            event.streams[0].getTracks().forEach(track => remoteStreamRef.current!.addTrack(track));
            attachRemoteAudio();
            stopRingtone();
            stopIncomingRingtone();
            setCallState('connected');
            setCallDuration(0);
            durationTimerRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        };

        pcRef.current.onicecandidate = async event => {
            if (event.candidate) {
                const candidatesRef = collection(roomRef, isCaller ? 'callerCandidates' : 'calleeCandidates');
                await addDoc(candidatesRef, event.candidate.toJSON());
            }
        };

        // Cтраховка от обрывов связи (закрытие вкладки, потеря сети)
        pcRef.current.oniceconnectionstatechange = () => {
            if (
                pcRef.current?.iceConnectionState === 'disconnected' ||
                pcRef.current?.iceConnectionState === 'failed'
            ) {
                console.warn('Соединение потеряно, завершаем звонок.');
                endCall();
            }
        };

        // Cтраховка от штатного завершения звонка собеседником (нажатие кнопки)
        onSnapshot(roomRef, (snapshot: DocumentSnapshot) => {
            if (!snapshot.exists()) {
                endCall();
            }
        });
    };

    const startCall = async () => {
        hasEndedRef.current = false;
        setCallState('calling');
        playRingtone();
        const stream = await requestMicrophone();
        if (!stream) return;
        const roomRef = doc(collection(db, 'rooms'));
        setRoomId(roomRef.id);
        setupPeerConnection(true, roomRef);
        localStreamRef.current = stream;
        stream.getTracks().forEach(track => pcRef.current!.addTrack(track, stream));
        const offer = await pcRef.current!.createOffer();
        await pcRef.current!.setLocalDescription(offer);
        await setDoc(roomRef, { offer });
        await setDoc(doc(db, 'calls', calleeUid), {
            from: myUid, roomId: roomRef.id, timestamp: Date.now(), status: 'incoming',
        });
        onSnapshot(collection(roomRef, 'calleeCandidates'), snapshot => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    try {
                        if (pcRef.current?.signalingState !== 'closed') {
                            await pcRef.current.addIceCandidate(candidate);
                        }
                    } catch { }
                }
            });
        });
        onSnapshot(roomRef, async snapshot => {
            const data = snapshot.data();
            if (data?.answer && !pcRef.current?.currentRemoteDescription) {
                await pcRef.current!.setRemoteDescription(new RTCSessionDescription(data.answer));
                for (const c of pendingCandidates) {
                    try {
                        if (pcRef.current?.signalingState !== 'closed') {
                            await pcRef.current.addIceCandidate(c);
                        }
                    } catch { }
                }
                pendingCandidates.length = 0;
            }
        });
        startCallFunc('outgoing')
    };

    const acceptCall = async () => {
        if (!incomingRoomId) return;
        hasEndedRef.current = false;
        setRoomId(incomingRoomId);
        setCallState('calling');
        stopIncomingRingtone();
        const stream = await requestMicrophone();
        if (!stream) return;
        const roomRef = doc(db, 'rooms', incomingRoomId);
        const roomData = (await getDoc(roomRef)).data();
        if (!roomData) return endCall();
        setupPeerConnection(false, roomRef);
        localStreamRef.current = stream;
        stream.getTracks().forEach(track => pcRef.current!.addTrack(track, stream));
        await pcRef.current!.setRemoteDescription(new RTCSessionDescription(roomData!.offer));
        const answer = await pcRef.current!.createAnswer();
        await pcRef.current!.setLocalDescription(answer);
        await setDoc(roomRef, { answer }, { merge: true });
        onSnapshot(collection(roomRef, 'callerCandidates'), snapshot => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    try {
                        if (pcRef.current?.signalingState !== 'closed') {
                            await pcRef.current.addIceCandidate(candidate);
                        }
                    } catch { }
                }
            });
        });
    };

    const rejectCall = async () => {

        if (endCallFunc) {
            endCallFunc(formatDuration(0), 'rejected')
        }

        stopIncomingRingtone();
        setCallState('idle');

        if (incomingRoomId) {
            const roomRef = doc(db, 'rooms', incomingRoomId);
            await deleteDoc(roomRef).catch(e => console.error("Не удалось удалить комнату при отклонении:", e));
        }
        await deleteDoc(doc(db, 'calls', myUid)).catch(e => console.error("Не удалось удалить документ звонка:", e));

        setIncomingRoomId(null);
        setCallerUid(null);
    };

    return {
        callState, errorMessage, callDuration, callerUid,
        startCall, acceptCall, rejectCall, endCall, formatDuration,
        remoteAudioRef, ringtoneRef, incomingRef, isMicMuted,
        isSpeakerMuted, toggleMic, toggleSpeaker
    }
}