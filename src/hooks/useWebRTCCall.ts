

// import { useState, useRef, useEffect } from 'react';
// import {
//     doc,
//     onSnapshot,
//     collection,
//     addDoc,
//     setDoc,
//     getDoc,
//     getDocs,
//     deleteDoc,
//     DocumentSnapshot,
// } from 'firebase/firestore';
// import { db } from '../firebase';
// import { CallEndStatus } from '../types/types';

// // Определения типов (без изменений)
// type CallState = 'idle' | 'calling' | 'incoming' | 'connected' | 'error' | 'ended';
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
//     formatDuration: (seconds: number) => string;
//     isMicMuted: boolean;       
//     isSpeakerMuted: boolean;   
//     toggleMic: () => void;     
//     toggleSpeaker: () => void; 
// }


// export const useWebRTCCall = (
//         myUid: string, 
//         calleeUid: string,
//         startCallFunc: (mode: "incoming" | "outgoing") => void, 
//         endCallFunc?: (callDuration: string, status: CallEndStatus) => void,
//     ): UseWebRTCCallReturn => {
//     const [roomId, setRoomId] = useState('');
//     const [callState, setCallState] = useState<CallState>('idle');
//     const [incomingRoomId, setIncomingRoomId] = useState<string | null>(null);
//     const [callerUid, setCallerUid] = useState<string | null>(null);
//     const [errorMessage, setErrorMessage] = useState<string | null>(null);
//     const [callDuration, setCallDuration] = useState(0);

//     const [isMicMuted, setIsMicMuted] = useState(false);
//     const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);

//     const callDurationRef = useRef(callDuration);

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
//         callDurationRef.current = callDuration;
//     }, [callDuration]);

//     useEffect(() => {
//         const callRef = doc(db, 'calls', myUid);
//         const unsubscribe = onSnapshot(callRef, snapshot => {
//             const data = snapshot.data();
//             if (data?.status === 'incoming') {
//                 if (callState === 'connected' || callState === 'calling') return;
//                 setIncomingRoomId(data.roomId);
//                 setCallerUid(data.from);
//                 setCallState('incoming');
//                 playIncomingRingtone();
//             }
//             if (!snapshot.exists() && callState === 'incoming') {
//                 if (endCallFunc) {
//                     endCallFunc(formatDuration(0), 'missed'); // Длительность 0
//                 }
//                 stopIncomingRingtone();
//                 setCallState('idle');
//                 setIncomingRoomId(null);
//                 setCallerUid(null);
//             }
//         });
//         return () => unsubscribe();
//     }, [myUid, callState, endCallFunc]);

//     const toggleMic = () => {
//         if (localStreamRef.current) {
//             localStreamRef.current.getAudioTracks().forEach(track => {
//                 track.enabled = !track.enabled;
//             });
//             setIsMicMuted(prev => !prev);
//         }
//     };


//     const toggleSpeaker = () => {
//         if (remoteAudioRef.current) {
//             remoteAudioRef.current.muted = !remoteAudioRef.current.muted;
//             setIsSpeakerMuted(prev => !prev);
//         }
//     };

//     const requestMicrophone = async (): Promise<MediaStream | null> => {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//             setIsMicMuted(false); 
//             return stream;
//         } catch {
//             if (endCallFunc) {
//                 endCallFunc(formatDuration(0), 'error'); // Длительность 0
//             }
//             setErrorMessage('Не удалось получить доступ к микрофону.');
//             setCallState('error');
//             return null;
//         }
//     };

//     const playRingtone = () => ringtoneRef.current?.play().catch(() => { });
//     const stopRingtone = () => {
//         if (ringtoneRef.current) {
//             ringtoneRef.current.pause();
//             ringtoneRef.current.currentTime = 0;
//         }
//     };

//     const playIncomingRingtone = () => incomingRef.current?.play().catch(() => { });
//     const stopIncomingRingtone = () => {
//         if (incomingRef.current) {
//             incomingRef.current.pause();
//             incomingRef.current.currentTime = 0;
//         }
//     };

//     const attachRemoteAudio = () => {
//         if (remoteAudioRef.current && remoteStreamRef.current) {
//             remoteAudioRef.current.srcObject = remoteStreamRef.current;
//             remoteAudioRef.current.muted = isSpeakerMuted;
//             remoteAudioRef.current.play().catch(() => { });
//         }
//     };

//     const formatDuration = (seconds: number) => {
//         const m = Math.floor(seconds / 60);
//         const s = seconds % 60;
//         return `${m}:${s.toString().padStart(2, '0')}`;
//     };

//     const endCall = async () => {
//         if (hasEndedRef.current) return;
//         hasEndedRef.current = true;

//         let finalStatus: CallEndStatus = callDurationRef.current > 0 ? 'completed' : 'unanswered';
//         console.log(callState)

//         if (endCallFunc) {
//             if(callState === 'idle' && callDurationRef.current === 0) finalStatus = 'rejected'
//             endCallFunc(formatDuration(callDurationRef.current), finalStatus);
//         }

//         stopRingtone();
//         stopIncomingRingtone();
//         if (durationTimerRef.current) clearInterval(durationTimerRef.current);

//         pcRef.current?.close();
//         localStreamRef.current?.getTracks().forEach(t => t.stop());
//         remoteStreamRef.current?.getTracks().forEach(t => t.stop());
//         setCallState('ended');

//         setIsMicMuted(false);
//         setIsSpeakerMuted(false);
//         if (remoteAudioRef.current) remoteAudioRef.current.muted = false;

//         const currentRoomId = roomId || incomingRoomId;
//         if (currentRoomId) {
//             const roomRef = doc(db, 'rooms', currentRoomId);
//             try {
//                 const callerCandidates = await getDocs(collection(roomRef, 'callerCandidates'));
//                 callerCandidates.forEach(candidateDoc => deleteDoc(candidateDoc.ref));
//                 const calleeCandidates = await getDocs(collection(roomRef, 'calleeCandidates'));
//                 calleeCandidates.forEach(candidateDoc => deleteDoc(candidateDoc.ref));
//                 await deleteDoc(roomRef);
//             } catch (error) {
//                 console.error("Ошибка при очистке комнаты:", error)
//             }
//         }

//         try {
//             await deleteDoc(doc(db, 'calls', myUid));
//         } catch { }
//         try {
//             await deleteDoc(doc(db, 'calls', calleeUid));
//         } catch { }


//         setRoomId('');
//         setIncomingRoomId(null);
//         setCallerUid(null);
//         setCallDuration(0); // Сбрасываю длительность в конце
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

//         // Cтраховка от обрывов связи (закрытие вкладки, потеря сети)
//         pcRef.current.oniceconnectionstatechange = () => {
//             if (
//                 pcRef.current?.iceConnectionState === 'disconnected' ||
//                 pcRef.current?.iceConnectionState === 'failed'
//             ) {
//                 console.warn('Соединение потеряно, завершаем звонок.');
//                 endCall();
//             }
//         };

//         // Cтраховка от штатного завершения звонка собеседником (нажатие кнопки)
//         onSnapshot(roomRef, (snapshot: DocumentSnapshot) => {
//             if (!snapshot.exists()) {
//                 endCall();
//             }
//         });
//     };

//     const startCall = async () => {
//         hasEndedRef.current = false;
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
//             from: myUid, roomId: roomRef.id, timestamp: Date.now(), status: 'incoming',
//         });
//         onSnapshot(collection(roomRef, 'calleeCandidates'), snapshot => {
//             snapshot.docChanges().forEach(async change => {
//                 if (change.type === 'added') {
//                     const candidate = new RTCIceCandidate(change.doc.data());
//                     try {
//                         if (pcRef.current?.signalingState !== 'closed') {
//                             await pcRef.current.addIceCandidate(candidate);
//                         }
//                     } catch { }
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
//                     } catch { }
//                 }
//                 pendingCandidates.length = 0;
//             }
//         });
//         startCallFunc('outgoing')
//     };

//     const acceptCall = async () => {
//         if (!incomingRoomId) return;
//         hasEndedRef.current = false;
//         setRoomId(incomingRoomId);
//         setCallState('calling');
//         stopIncomingRingtone();
//         const stream = await requestMicrophone();
//         if (!stream) return;
//         const roomRef = doc(db, 'rooms', incomingRoomId);
//         const roomData = (await getDoc(roomRef)).data();
//         if (!roomData) return endCall();
//         setupPeerConnection(false, roomRef);
//         localStreamRef.current = stream;
//         stream.getTracks().forEach(track => pcRef.current!.addTrack(track, stream));
//         await pcRef.current!.setRemoteDescription(new RTCSessionDescription(roomData!.offer));
//         const answer = await pcRef.current!.createAnswer();
//         await pcRef.current!.setLocalDescription(answer);
//         await setDoc(roomRef, { answer }, { merge: true });
//         onSnapshot(collection(roomRef, 'callerCandidates'), snapshot => {
//             snapshot.docChanges().forEach(async change => {
//                 if (change.type === 'added') {
//                     const candidate = new RTCIceCandidate(change.doc.data());
//                     try {
//                         if (pcRef.current?.signalingState !== 'closed') {
//                             await pcRef.current.addIceCandidate(candidate);
//                         }
//                     } catch { }
//                 }
//             });
//         });
//     };

//     const rejectCall = async () => {

//         if (endCallFunc) {
//             endCallFunc(formatDuration(0), 'rejected')
//         }

//         stopIncomingRingtone();
//         setCallState('idle');

//         if (incomingRoomId) {
//             const roomRef = doc(db, 'rooms', incomingRoomId);
//             await deleteDoc(roomRef).catch(e => console.error("Не удалось удалить комнату при отклонении:", e));
//         }
//         await deleteDoc(doc(db, 'calls', myUid)).catch(e => console.error("Не удалось удалить документ звонка:", e));

//         setIncomingRoomId(null);
//         setCallerUid(null);
//     };

//     return {
//         callState, errorMessage, callDuration, callerUid,
//         startCall, acceptCall, rejectCall, endCall, formatDuration,
//         remoteAudioRef, ringtoneRef, incomingRef, isMicMuted,
//         isSpeakerMuted, toggleMic, toggleSpeaker
//     }
// }

// import { useState, useRef, useEffect } from 'react';
// import {
//     doc,
//     onSnapshot,
//     collection,
//     addDoc,
//     setDoc,
//     getDoc,
//     getDocs,
//     deleteDoc,
//     DocumentSnapshot,
// } from 'firebase/firestore';
// import { db } from '../firebase';
// import { CallEndStatus } from '../types/types';

// type CallState = 'idle' | 'calling' | 'incoming' | 'connected' | 'error' | 'ended';

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
//     formatDuration: (seconds: number) => string;
//     isMicMuted: boolean;
//     isSpeakerMuted: boolean;
//     toggleMic: () => void;
//     toggleSpeaker: () => void;
// }

// const rtcConfig: RTCConfiguration = {
//     iceServers: [
//         {
//             urls: [
//                 'stun:stun1.l.google.com:19302',
//                 'stun:stun2.l.google.com:19302',
//             ],
//         },
//         {
//             urls: 'turn:global.relay.metered.ca:443',
//             username: process.env.REACT_APP_TURN_USERNAME,
//             credential: process.env.REACT_APP_TURN_PASSWORD,
//         },
//     ],
//     iceCandidatePoolSize: 10,
// };

// export const useWebRTCCall = (
//     myUid: string,
//     calleeUid: string,
//     startCallFunc: (mode: "incoming" | "outgoing") => void,
//     endCallFunc?: (callDuration: string, status: CallEndStatus) => void,
// ): UseWebRTCCallReturn => {
//     const [roomId, setRoomId] = useState('');
//     const [callState, setCallState] = useState<CallState>('idle');
//     const [incomingRoomId, setIncomingRoomId] = useState<string | null>(null);
//     const [callerUid, setCallerUid] = useState<string | null>(null);
//     const [errorMessage, setErrorMessage] = useState<string | null>(null);
//     const [callDuration, setCallDuration] = useState(0);
//     const [isMicMuted, setIsMicMuted] = useState(false);
//     const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);

//     const callDurationRef = useRef(callDuration);
//     const localStreamRef = useRef<MediaStream | null>(null);
//     const remoteStreamRef = useRef<MediaStream | null>(null);
//     const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
//     const ringtoneRef = useRef<HTMLAudioElement | null>(null);
//     const incomingRef = useRef<HTMLAudioElement | null>(null);
//     const pcRef = useRef<RTCPeerConnection | null>(null);
//     const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
//     const hasEndedRef = useRef(false);

//     const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

//     useEffect(() => {
//         callDurationRef.current = callDuration;
//     }, [callDuration]);

//     useEffect(() => {
//         const callRef = doc(db, 'calls', myUid);
//         const unsubscribe = onSnapshot(callRef, snapshot => {
//             const data = snapshot.data();
//             if (data?.status === 'incoming') {
//                 if (callState === 'connected' || callState === 'calling') return;
//                 setIncomingRoomId(data.roomId);
//                 setCallerUid(data.from);
//                 setCallState('incoming');
//                 playIncomingRingtone();
//             }
//             if (!snapshot.exists() && callState === 'incoming') {
//                 endCallFunc?.(formatDuration(0), 'missed');
//                 stopIncomingRingtone();
//                 resetState();
//             }
//         });
//         return () => unsubscribe();
//     }, [myUid, callState]);

//     const resetState = () => {
//         setCallState('idle');
//         setIncomingRoomId(null);
//         setCallerUid(null);
//         setRoomId('');
//         pendingCandidates.current = [];
//     };

//     const logConnectionStats = async () => {
//         if (!pcRef.current) return;

//         const stats = await pcRef.current.getStats();
//         stats.forEach(report => {
//             // Ищем отчет типа 'remote-candidate' или 'candidate-pair'
//             if (report.type === 'remote-candidate') {
//                 console.log(`Используется тип соединения: ${report.candidateType}`);
//                 // Выведет: 'host', 'srflx' (это STUN) или 'relay' (это TURN)
//             }

//             if (report.type === 'candidate-pair' && report.state === 'succeeded') {
//                 const localCandidate = stats.get(report.localCandidateId);
//                 const remoteCandidate = stats.get(report.remoteCandidateId);
//                 console.log(`Выбранная пара: ${localCandidate.candidateType} <-> ${remoteCandidate.candidateType}`);
//             }
//         });
//     };

//     useEffect(() => {
//     if (callState === 'connected') {
//         const interval = setInterval(logConnectionStats, 5000); 
//         return () => clearInterval(interval);
//         }
//     }, [callState]);

//     const setupPeerConnection = (isCaller: boolean, roomRef: any) => {
//         pcRef.current = new RTCPeerConnection(rtcConfig);

//         pcRef.current.oniceconnectionstatechange = () => {
//             console.log("ICE State:", pcRef.current?.iceConnectionState);
//             if (pcRef.current?.iceConnectionState === 'failed') {
//                 endCall();
//             }
//         };

//         remoteStreamRef.current = new MediaStream();
//         pcRef.current.ontrack = event => {
//             event.streams[0].getTracks().forEach(track => remoteStreamRef.current!.addTrack(track));
//             attachRemoteAudio();
//             stopRingtone();
//             stopIncomingRingtone();
//             setCallState('connected');

//             if (!durationTimerRef.current) {
//                 setCallDuration(0);
//                 durationTimerRef.current = setInterval(() => {
//                     setCallDuration(prev => prev + 1);
//                 }, 1000);
//             }
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

//     const handleIceCandidates = (roomRef: any, collectionName: string) => {
//         onSnapshot(collection(roomRef, collectionName), snapshot => {
//             snapshot.docChanges().forEach(async change => {
//                 if (change.type === 'added') {
//                     const candidateData = change.doc.data();
//                     const candidate = new RTCIceCandidate(candidateData);

//                     if (pcRef.current?.remoteDescription) {
//                         try {
//                             await pcRef.current.addIceCandidate(candidate);
//                         } catch (e) { console.error("Error adding candidate", e); }
//                     } else {
//                         pendingCandidates.current.push(candidateData);
//                     }
//                 }
//             });
//         });
//     };

//     const processPendingCandidates = async () => {
//         if (pcRef.current) {
//             for (const candidate of pendingCandidates.current) {
//                 try {
//                     await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//                 } catch (e) { console.error("Error adding pending candidate", e); }
//             }
//             pendingCandidates.current = [];
//         }
//     };

//     const startCall = async () => {
//         hasEndedRef.current = false;
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
//             from: myUid, roomId: roomRef.id, timestamp: Date.now(), status: 'incoming',
//         });

//         handleIceCandidates(roomRef, 'calleeCandidates');

//         onSnapshot(roomRef, async snapshot => {
//             const data = snapshot.data();
//             if (data?.answer && !pcRef.current?.currentRemoteDescription) {
//                 await pcRef.current!.setRemoteDescription(new RTCSessionDescription(data.answer));
//                 await processPendingCandidates();
//             }
//         });

//         startCallFunc('outgoing');
//     };

//     const acceptCall = async () => {
//         if (!incomingRoomId) return;
//         hasEndedRef.current = false;
//         setRoomId(incomingRoomId);
//         setCallState('calling');
//         stopIncomingRingtone();

//         const stream = await requestMicrophone();
//         if (!stream) return;

//         const roomRef = doc(db, 'rooms', incomingRoomId);
//         const roomData = (await getDoc(roomRef)).data();
//         if (!roomData) return endCall();

//         setupPeerConnection(false, roomRef);
//         localStreamRef.current = stream;
//         stream.getTracks().forEach(track => pcRef.current!.addTrack(track, stream));

//         await pcRef.current!.setRemoteDescription(new RTCSessionDescription(roomData.offer));
//         await processPendingCandidates();

//         const answer = await pcRef.current!.createAnswer();
//         await pcRef.current!.setLocalDescription(answer);
//         await setDoc(roomRef, { answer }, { merge: true });

//         handleIceCandidates(roomRef, 'callerCandidates');
//     };

//     const endCall = async () => {
//         if (hasEndedRef.current) return;
//         hasEndedRef.current = true;

//         let finalStatus: CallEndStatus = callDurationRef.current > 0 ? 'completed' : 'unanswered';
//         if (callState === 'idle' && callDurationRef.current === 0) finalStatus = 'rejected';

//         endCallFunc?.(formatDuration(callDurationRef.current), finalStatus);

//         stopRingtone();
//         stopIncomingRingtone();
//         if (durationTimerRef.current) clearInterval(durationTimerRef.current);

//         pcRef.current?.close();
//         localStreamRef.current?.getTracks().forEach(t => t.stop());
//         setCallState('ended');

//         const currentRoomId = roomId || incomingRoomId;
//         if (currentRoomId) {
//             const roomRef = doc(db, 'rooms', currentRoomId);
//             try {
//                 const callerCands = await getDocs(collection(roomRef, 'callerCandidates'));
//                 callerCands.forEach(d => deleteDoc(d.ref));
//                 const calleeCands = await getDocs(collection(roomRef, 'calleeCandidates'));
//                 calleeCands.forEach(d => deleteDoc(d.ref));
//                 await deleteDoc(roomRef);
//             } catch (e) { console.error(e); }
//         }

//         await deleteDoc(doc(db, 'calls', myUid)).catch(() => { });
//         await deleteDoc(doc(db, 'calls', calleeUid)).catch(() => { });

//         resetState();
//         setCallDuration(0);
//     };

//     const rejectCall = async () => {
//         endCallFunc?.(formatDuration(0), 'rejected');
//         stopIncomingRingtone();
//         if (incomingRoomId) {
//             await deleteDoc(doc(db, 'rooms', incomingRoomId)).catch(() => { });
//         }
//         await deleteDoc(doc(db, 'calls', myUid)).catch(() => { });
//         resetState();
//     };

//     const requestMicrophone = async () => {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//             setIsMicMuted(false);
//             return stream;
//         } catch {
//             endCallFunc?.(formatDuration(0), 'error');
//             setErrorMessage('Доступ к микрофону запрещен.');
//             setCallState('error');
//             return null;
//         }
//     };

//     const toggleMic = () => {
//         if (localStreamRef.current) {
//             localStreamRef.current.getAudioTracks().forEach(t => t.enabled = !t.enabled);
//             setIsMicMuted(prev => !prev);
//         }
//     };

//     const toggleSpeaker = () => {
//         if (remoteAudioRef.current) {
//             remoteAudioRef.current.muted = !remoteAudioRef.current.muted;
//             setIsSpeakerMuted(prev => !prev);
//         }
//     };

//     const playRingtone = () => ringtoneRef.current?.play().catch(() => { });
//     const stopRingtone = () => {
//         if (ringtoneRef.current) { ringtoneRef.current.pause(); ringtoneRef.current.currentTime = 0; }
//     };
//     const playIncomingRingtone = () => incomingRef.current?.play().catch(() => { });
//     const stopIncomingRingtone = () => {
//         if (incomingRef.current) { incomingRef.current.pause(); incomingRef.current.currentTime = 0; }
//     };
//     const attachRemoteAudio = () => {
//         if (remoteAudioRef.current && remoteStreamRef.current) {
//             remoteAudioRef.current.srcObject = remoteStreamRef.current;
//             remoteAudioRef.current.muted = isSpeakerMuted;
//             remoteAudioRef.current.play().catch(() => { });
//         }
//     };
//     const formatDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

//     return {
//         callState, errorMessage, callDuration, callerUid,
//         startCall, acceptCall, rejectCall, endCall, formatDuration,
//         remoteAudioRef, ringtoneRef, incomingRef, isMicMuted,
//         isSpeakerMuted, toggleMic, toggleSpeaker
//     };
// };

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

const rtcConfig: RTCConfiguration = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
        {
            urls: 'turn:global.relay.metered.ca:443',
            username: process.env.REACT_APP_TURN_USERNAME,
            credential: process.env.REACT_APP_TURN_PASSWORD
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

    // const logConnectionStats = async () => {
    //     if (!pcRef.current) return;
    //     try {
    //         const stats = await pcRef.current.getStats();
    //         stats.forEach(report => {
    //             if (report.type === 'candidate-pair' && report.active === true) {
    //                 const local = stats.get(report.localCandidateId);
    //                 const remote = stats.get(report.remoteCandidateId);
    //                 console.log("-----------------------------------------");
    //                 console.log(`[WebRTC] Активный путь: ${local.candidateType} <-> ${remote.candidateType}`);
    //                 if (remote.candidateType === 'relay') console.warn("🌐 Используется TURN сервер");
    //                 else if (remote.candidateType === 'srflx') console.info("⚡ Используется STUN (P2P)");
    //                 else console.info("🏠 Локальное соединение");
    //                 console.log("-----------------------------------------");
    //             }
    //         });
    //     } catch (e) { console.error("Ошибка получения статистики", e); }
    // };

    const logConnectionStats = async () => {
        if (!pcRef.current) return;
        try {
            const stats = await pcRef.current.getStats();
            let found = false;

            stats.forEach(report => {
                // Проверяем и 'candidate-pair', и состояние 'succeeded'
                if (report.type === 'candidate-pair' && (report.active === true || report.state === 'succeeded')) {
                    const local = stats.get(report.localCandidateId);
                    const remote = stats.get(report.remoteCandidateId);

                    if (local && remote) {
                        found = true;
                        console.log("-----------------------------------------");
                        console.log(`✅ [WebRTC ПОДКЛЮЧЕНО]`);
                        console.log(`Локальный кандидат: ${local.candidateType} (${local.ip || 'localhost'})`);
                        console.log(`Удаленный кандидат: ${remote.candidateType} (${remote.ip || 'localhost'})`);

                        if (remote.candidateType === 'relay') {
                            console.warn("🌐 Трафик идет через TURN сервер");
                        } else {
                            console.info("🚀 Прямое соединение (Host/STUN)");
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
    }, [roomId, incomingRoomId, myUid]);

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
        pcRef.current = new RTCPeerConnection(rtcConfig);

        // pcRef.current.oniceconnectionstatechange = () => {
        //     const state = pcRef.current?.iceConnectionState;
        //     console.log("[WebRTC] ICE State:", state);
        //     if (state === 'connected') setTimeout(logConnectionStats, 2000);
        //     if (state === 'failed' || state === 'disconnected') endCall();
        // };

        pcRef.current.oniceconnectionstatechange = () => {
            const state = pcRef.current?.iceConnectionState;
            console.log("[WebRTC] ICE State:", state);

            if (state === 'connected') {
                // Попробуем вывести сразу
                logConnectionStats();
                // И еще раз через 3 секунды для надежности
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
            setErrorMessage('Микрофон недоступен');
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

console.log(rtcConfig, '>>>>>>>>>><<<<<<<<<<<<')