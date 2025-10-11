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
} from 'firebase/firestore';
import { db } from '../../firebase';

const servers = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

type CallState = 'idle' | 'calling' | 'incoming' | 'connected' | 'ended';

export const CallRoom = ({ myUid, calleeUid }: { myUid: string; calleeUid: string }) => {
    const [roomId, setRoomId] = useState('');
    const [callState, setCallState] = useState<CallState>('idle');
    const [incomingRoomId, setIncomingRoomId] = useState<string | null>(null);
    const [callerUid, setCallerUid] = useState<string | null>(null);

    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const pendingCandidates: RTCIceCandidateInit[] = [];

    // 🔔 Слушаем входящий вызов
    useEffect(() => {
        const callRef = doc(db, 'calls', myUid);
        const unsubscribe = onSnapshot(callRef, snapshot => {
            const data = snapshot.data();
            if (data?.status === 'incoming') {
                setIncomingRoomId(data.roomId);
                setCallerUid(data.from);
                setCallState('incoming');
            }
        });
        return () => unsubscribe();
    }, [myUid]);

    // 📞 Инициировать звонок
    const startCall = async () => {
        setCallState('calling');
        pcRef.current = new RTCPeerConnection(servers);

        localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current.getTracks().forEach(track => {
            pcRef.current!.addTrack(track, localStreamRef.current!);
        });

        remoteStreamRef.current = new MediaStream();
        pcRef.current.ontrack = event => {
            event.streams[0].getTracks().forEach(track => {
                remoteStreamRef.current!.addTrack(track);
            });
            setCallState('connected');
        };

        const roomRef = doc(collection(db, 'rooms'));
        setRoomId(roomRef.id);

        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        await setDoc(roomRef, { offer });

        // 🔔 Записываем вызов в calls/{calleeUid}
        await setDoc(doc(db, 'calls', calleeUid), {
            from: myUid,
            roomId: roomRef.id,
            timestamp: Date.now(),
            status: 'incoming',
        });

        pcRef.current.onicecandidate = async event => {
            if (event.candidate) {
                const candidatesRef = collection(roomRef, 'callerCandidates');
                await addDoc(candidatesRef, event.candidate.toJSON());
            }
        };

        onSnapshot(roomRef, async snapshot => {
            const data = snapshot.data();
            if (data?.answer && !pcRef.current?.currentRemoteDescription) {
                const answerDesc = new RTCSessionDescription(data.answer);
                await pcRef.current.setRemoteDescription(answerDesc);
                pendingCandidates.forEach(candidate => {
                    pcRef.current!.addIceCandidate(candidate);
                });
                pendingCandidates.length = 0;
            }
        });

        onSnapshot(collection(roomRef, 'calleeCandidates'), snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    if (pcRef.current?.remoteDescription) {
                        pcRef.current.addIceCandidate(candidate);
                    } else {
                        pendingCandidates.push(candidate);
                    }
                }
            });
        });
    };

    // ✅ Принять звонок
    const acceptCall = async () => {
        if (!incomingRoomId) return;
        setRoomId(incomingRoomId);
        setCallState('calling');

        pcRef.current = new RTCPeerConnection(servers);

        localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current.getTracks().forEach(track => {
            pcRef.current!.addTrack(track, localStreamRef.current!);
        });

        remoteStreamRef.current = new MediaStream();
        pcRef.current.ontrack = event => {
            event.streams[0].getTracks().forEach(track => {
                remoteStreamRef.current!.addTrack(track);
            });
            setCallState('connected');
        };

        const roomRef = doc(db, 'rooms', incomingRoomId);
        const roomSnapshot = await getDoc(roomRef);
        const roomData = roomSnapshot.data();

        await pcRef.current.setRemoteDescription(new RTCSessionDescription(roomData!.offer));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        await setDoc(roomRef, { answer }, { merge: true });

        pcRef.current.onicecandidate = async event => {
            if (event.candidate) {
                const candidatesRef = collection(roomRef, 'calleeCandidates');
                await addDoc(candidatesRef, event.candidate.toJSON());
            }
        };

        onSnapshot(collection(roomRef, 'callerCandidates'), snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    if (pcRef.current?.remoteDescription) {
                        pcRef.current.addIceCandidate(candidate);
                    } else {
                        pendingCandidates.push(candidate);
                    }
                }
            });
        });
    };

    // ❌ Завершить звонок и очистить всё
    const endCall = async () => {
        pcRef.current?.close();
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        remoteStreamRef.current?.getTracks().forEach(track => track.stop());
        setCallState('ended');

        if (roomId) {
            const roomRef = doc(db, 'rooms', roomId);
            const callerCandidates = await getDocs(collection(roomRef, 'callerCandidates'));
            const calleeCandidates = await getDocs(collection(roomRef, 'calleeCandidates'));

            for (const docSnap of [...callerCandidates.docs, ...calleeCandidates.docs]) {
                await deleteDoc(docSnap.ref);
            }

            await deleteDoc(roomRef);
        }

        if (calleeUid) {
            await deleteDoc(doc(db, 'calls', calleeUid));
        }
        if (myUid) {
            await deleteDoc(doc(db, 'calls', myUid));
        }

        setRoomId('');
        setIncomingRoomId(null);
        setCallerUid(null);
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.status}>
                Состояние: {
                    callState === 'idle' ? 'Ожидание' :
                        callState === 'calling' ? 'Ожидание ответа' :
                            callState === 'incoming' ? 'Входящий звонок' :
                                callState === 'connected' ? 'Подключено' :
                                    'Завершено'
                }
            </h2>

            {callState === 'idle' && (
                <button style={styles.button} onClick={startCall}>📞 Позвонить пользователю</button>
            )}

            {callState === 'incoming' && (
                <>
                    <p>📲 Входящий звонок от {callerUid}. Принять?</p>
                    <button style={styles.button} onClick={acceptCall}>✅ Принять</button>
                </>
            )}

            {(callState === 'connected' || callState === 'calling') && (
                <button style={styles.button} onClick={endCall}>❌ Завершить звонок</button>
            )}
        </div>
    );
};

export default CallRoom

const styles: Record<string, React.CSSProperties> = {
    container: {
        padding: '1rem',
        maxWidth: 400,
        margin: '0 auto',
        textAlign: 'center',
        fontFamily: 'sans-serif',
    },
    button: {
        padding: '0.8rem 1.2rem',
        margin: '0.5rem',
        fontSize: '1rem',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#007bff',
        color: '#fff',
        cursor: 'pointer',
        width: '100%',
    },
    status: {
        fontSize: '1.2rem',
        marginBottom: '1rem',
    },
};