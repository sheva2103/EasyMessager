import React, { useRef, useState, useEffect } from 'react';
import {
    collection,
    doc,
    setDoc,
    onSnapshot,
    getDoc,
    addDoc,
    deleteDoc,
    getDocs,
    DocumentReference,
    DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../../firebase';

import ringtone from '../../assets/ringtone.mp3'
import calling from '../../assets/calling.mp3'


// export const CallRoom = ({ myUid, calleeUid }: { myUid: string; calleeUid: string }) => {
//     const [roomId, setRoomId] = useState('');
//     const [callState, setCallState] = useState<'idle' | 'calling' | 'incoming' | 'connected' | 'ended' | 'error'>('idle');
//     const [incomingRoomId, setIncomingRoomId] = useState<string | null>(null);
//     const [callerUid, setCallerUid] = useState<string | null>(null);
//     const [errorMessage, setErrorMessage] = useState<string | null>(null);

//     const localStreamRef = useRef<MediaStream | null>(null);
//     const remoteStreamRef = useRef<MediaStream | null>(null);
//     const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
//     const ringtoneRef = useRef<HTMLAudioElement | null>(null);
//     const incomingRef = useRef<HTMLAudioElement | null>(null);
//     const pcRef = useRef<RTCPeerConnection | null>(null);
//     const pendingCandidates: RTCIceCandidateInit[] = [];
//     const hasEndedRef = useRef(false);

//     useEffect(() => {
//         const callRef = doc(db, 'calls', myUid);
//         return onSnapshot(callRef, snapshot => {
//             const data = snapshot.data();

//             if (data?.status === 'incoming') {
//                 if (callState === 'connected' || callState === 'calling') {
//                     console.log(`Пользователь ${myUid} уже в звонке. Входящий вызов от ${data.from} отклонён.`);
//                     return;
//                 }
//                 setIncomingRoomId(data.roomId);
//                 setCallerUid(data.from);
//                 setCallState('incoming');
//                 playIncomingRingtone();
//             }

//             if (!snapshot.exists() && callState === 'incoming') {
//                 console.log('Вызывающий отменил вызов');
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
//             setErrorMessage('Не удалось получить доступ к микрофону. Проверьте разрешения.');
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

//     const setupPeerConnection = (isCaller: boolean, roomRef: DocumentReference) => {
//         pcRef.current = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

//         remoteStreamRef.current = new MediaStream();
//         pcRef.current.ontrack = event => {
//             event.streams[0].getTracks().forEach(track => remoteStreamRef.current!.addTrack(track));
//             attachRemoteAudio();
//             stopRingtone();
//             stopIncomingRingtone();
//             setCallState('connected');
//         };

//         pcRef.current.onicecandidate = async event => {
//             if (event.candidate) {
//                 const candidatesRef = collection(roomRef, isCaller ? 'callerCandidates' : 'calleeCandidates');
//                 await addDoc(candidatesRef, event.candidate.toJSON());
//             }
//         };

//         onSnapshot(roomRef, snapshot => {
//             if (!snapshot.exists()) {
//                 console.log('Комната удалена — завершение звонка');
//                 endCall();
//             }
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
//                 } catch (err) {
//                     console.warn('Ошибка при добавлении calleeCandidate:', err);
//                 }
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
//                     } catch (err) {
//                         console.warn('Ошибка при добавлении отложенного кандидата:', err);
//                     }
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
//                 } catch (err) {
//                     console.warn('Ошибка при добавлении callerCandidate:', err);
//                 }
//             });
//         });
//     };

//     const rejectCall = async () => {
//         stopIncomingRingtone();
//         setCallState('idle');
//         setIncomingRoomId(null);
//         setCallerUid(null);

//         // Удаляем сигналинг комнату, чтобы вызывающий завершил вызов
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
//     };

//     return (
//         <div>
//             <h2>
//                 Состояние: {
//                     callState === 'idle' ? 'Ожидание' :
//                         callState === 'calling' ? 'Ожидание ответа' :
//                             callState === 'incoming' ? 'Входящий звонок' :
//                                 callState === 'connected' ? 'Подключено' :
//                                     callState === 'error' ? 'Ошибка' : 'Завершено'
//                 }
//             </h2>

//             {errorMessage && <p>{errorMessage}</p>}

//             {/* Аудио элементы */}
//             <audio ref={remoteAudioRef} autoPlay playsInline controls />
//             <audio ref={ringtoneRef} src={calling} loop />
//             <audio ref={incomingRef} src={ringtone} loop />

//             {/* Исходящий вызов */}
//             {callState === 'idle' && (
//                 <button onClick={startCall}>📞 Позвонить</button>
//             )}

//             {/* Входящий вызов */}
//             {callState === 'incoming' && (
//                 <>
//                     <p>📲 Входящий звонок от {callerUid}</p>
//                     <button onClick={acceptCall}>✅ Принять</button>
//                     <button onClick={rejectCall}>❌ Отклонить</button>
//                 </>
//             )}

//             {/* Активный вызов или ожидание ответа */}
//             {(callState === 'connected' || callState === 'calling') && (
//                 <button onClick={endCall}>❌ Завершить</button>
//             )}
//         </div>
//     );
// };


// const styles: Record<string, React.CSSProperties> = {
//     container: {
//         padding: '1rem',
//         maxWidth: 400,
//         margin: '0 auto',
//         textAlign: 'center',
//         fontFamily: 'sans-serif',
//     },
//     button: {
//         padding: '0.8rem 1.2rem',
//         margin: '0.5rem',
//         fontSize: '1rem',
//         borderRadius: '8px',
//         border: 'none',
//         backgroundColor: '#007bff',
//         color: '#fff',
//         cursor: 'pointer',
//         width: '100%',
//     },
//     status: {
//         fontSize: '1.2rem',
//         marginBottom: '1rem',
//     },
// }

export const CallRoom = ({ myUid, calleeUid }: { myUid: string; calleeUid: string }) => {
    const [roomId, setRoomId] = useState('');
    const [callState, setCallState] = useState<'idle' | 'calling' | 'incoming' | 'connected' | 'ended' | 'error'>('idle');
    const [incomingRoomId, setIncomingRoomId] = useState<string | null>(null);
    const [callerUid, setCallerUid] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [callDuration, setCallDuration] = useState(0);

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
        const callRef = doc(db, 'calls', myUid);
        return onSnapshot(callRef, snapshot => {
            const data = snapshot.data();

            if (data?.status === 'incoming') {
                if (callState === 'connected' || callState === 'calling') return;
                setIncomingRoomId(data.roomId);
                setCallerUid(data.from);
                setCallState('incoming');
                playIncomingRingtone();
            }

            if (!snapshot.exists() && callState === 'incoming') {
                stopIncomingRingtone();
                setCallState('idle');
                setIncomingRoomId(null);
                setCallerUid(null);
            }
        });
    }, [myUid, callState]);

    const requestMicrophone = async (): Promise<MediaStream | null> => {
        try {
            return await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
            setErrorMessage('Не удалось получить доступ к микрофону.');
            setCallState('error');
            return null;
        }
    };

    const playRingtone = () => ringtoneRef.current?.play().catch(() => { });
    const stopRingtone = () => {
        ringtoneRef.current?.pause();
        if (ringtoneRef.current) ringtoneRef.current.currentTime = 0;
    };

    const playIncomingRingtone = () => incomingRef.current?.play().catch(() => { });
    const stopIncomingRingtone = () => {
        incomingRef.current?.pause();
        if (incomingRef.current) incomingRef.current.currentTime = 0;
    };

    const attachRemoteAudio = () => {
        if (remoteAudioRef.current && remoteStreamRef.current) {
            remoteAudioRef.current.srcObject = remoteStreamRef.current;
            remoteAudioRef.current.play().catch(() => { });
        }
    };

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
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

        onSnapshot(roomRef, (snapshot: DocumentSnapshot) => {
            if (!snapshot.exists()) endCall();
        });
    };

    const startCall = async () => {
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
            from: myUid,
            roomId: roomRef.id,
            timestamp: Date.now(),
            status: 'incoming',
        });

        onSnapshot(collection(roomRef, 'calleeCandidates'), snapshot => {
            snapshot.docChanges().forEach(async change => {
                const candidate = new RTCIceCandidate(change.doc.data());
                try {
                    if (pcRef.current?.signalingState !== 'closed') {
                        await pcRef.current.addIceCandidate(candidate);
                    }
                } catch { }
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
    };

    const acceptCall = async () => {
        if (!incomingRoomId) return;
        setRoomId(incomingRoomId);
        setCallState('calling');
        stopIncomingRingtone();

        const stream = await requestMicrophone();
        if (!stream) return;

        const roomRef = doc(db, 'rooms', incomingRoomId);
        const roomData = (await getDoc(roomRef)).data();
        setupPeerConnection(false, roomRef);

        localStreamRef.current = stream;
        stream.getTracks().forEach(track => pcRef.current!.addTrack(track, stream));

        await pcRef.current!.setRemoteDescription(new RTCSessionDescription(roomData!.offer));
        const answer = await pcRef.current!.createAnswer();
        await pcRef.current!.setLocalDescription(answer);
        await setDoc(roomRef, { answer }, { merge: true });

        onSnapshot(collection(roomRef, 'callerCandidates'), snapshot => {
            snapshot.docChanges().forEach(async change => {
                const candidate = new RTCIceCandidate(change.doc.data());
                try {
                    if (pcRef.current?.signalingState !== 'closed') {
                        await pcRef.current.addIceCandidate(candidate);
                    }
                } catch { }
            });
        });
    };

    const rejectCall = async () => {
        stopIncomingRingtone();
        setCallState('idle');
        setIncomingRoomId(null);
        setCallerUid(null);

        if (incomingRoomId) {
            const roomRef = doc(db, 'rooms', incomingRoomId);
            const callerCandidates = await getDocs(collection(roomRef, 'callerCandidates'));
            const calleeCandidates = await getDocs(collection(roomRef, 'calleeCandidates'));
            [...callerCandidates.docs, ...calleeCandidates.docs].forEach(d => deleteDoc(d.ref));
            await deleteDoc(roomRef);
        }

        await deleteDoc(doc(db, 'calls', myUid));
    };

    const endCall = async () => {
        if (hasEndedRef.current) return;
        hasEndedRef.current = true;

        stopRingtone();
        stopIncomingRingtone();
        if (durationTimerRef.current) clearInterval(durationTimerRef.current);

        pcRef.current?.close();
        localStreamRef.current?.getTracks().forEach(t => t.stop());
        remoteStreamRef.current?.getTracks().forEach(t => t.stop());
        setCallState('ended');

        if (roomId) {
            const roomRef = doc(db, 'rooms', roomId);
            const callerCandidates = await getDocs(collection(roomRef, 'callerCandidates'));
            const calleeCandidates = await getDocs(collection(roomRef, 'calleeCandidates'));
            [...callerCandidates.docs, ...calleeCandidates.docs].forEach(d => deleteDoc(d.ref));
            await deleteDoc(roomRef);
        }

        await deleteDoc(doc(db, 'calls', calleeUid));
        await deleteDoc(doc(db, 'calls', myUid));

        setRoomId('');
        setIncomingRoomId(null);
        setCallerUid(null);
    };
    return (
        <div style={{ padding: 20, fontFamily: 'sans-serif', maxWidth: 400 }}>
            <h2>
                Состояние: {
                    callState === 'idle' ? '🟢 Ожидание' :
                        callState === 'calling' ? '🔔 Ожидание ответа' :
                            callState === 'incoming' ? '📲 Входящий звонок' :
                                callState === 'connected' ? '✅ Подключено' :
                                    callState === 'error' ? '❌ Ошибка' : '🔚 Завершено'
                }
            </h2>

            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            {callState === 'connected' && (
                <p>⏱ Длительность: {formatDuration(callDuration)}</p>
            )}

            <audio ref={remoteAudioRef} autoPlay playsInline />
            <audio ref={ringtoneRef} src={calling} loop />
            <audio ref={incomingRef} src={ringtone} loop />

            {callState === 'idle' && (
                <button onClick={startCall} style={{ marginTop: 10 }}>📞 Позвонить</button>
            )}

            {callState === 'incoming' && (
                <>
                    <p>📞 Звонок от: {callerUid}</p>
                    <button onClick={acceptCall} style={{ marginRight: 10 }}>✅ Принять</button>
                    <button onClick={rejectCall}>❌ Отклонить</button>
                </>
            )}

            {(callState === 'connected' || callState === 'calling') && (
                <button onClick={endCall} style={{ marginTop: 10 }}>🔚 Завершить</button>
            )}
        </div>
    );
};


export default CallRoom