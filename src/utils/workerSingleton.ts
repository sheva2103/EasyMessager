/**
 * @author sheva2103
 * @project EasyMessager
 * @license MIT
 * @link https://github.com/sheva2103/EasyMessager
 * @email 2103sheva@gmail.com
 * @copyright (c) 2025 Aleksandr (GitHub: sheva2103)
 */
import Worker from 'web-worker';
import { MessageType } from '../types/types';

type OutMsg =
    | { taskId: string; list: MessageType[]; noRead: { quantity: number; targetIndex: number } }
    | { taskId: string; error: string };

type Handler = (data: OutMsg) => void;

let worker: Worker | null = null;
const listeners = new Map<string, Set<Handler>>();

function ensureWorker(): Worker {
    if (!worker) {
        worker = new Worker(new URL('./messagesWorker.ts', import.meta.url));
        worker.addEventListener('message', (e: MessageEvent<OutMsg>) => {
            const { taskId } = e.data;
            const set = listeners.get(taskId);
            if (!set) return;
            for (const cb of set) cb(e.data);
        });
    }
    return worker;
}

export function postTask(taskId: string, payload: { rawMessagesArray: any[]; currentUserUid: string }) {
    const w = ensureWorker();
    w.postMessage({ taskId, ...payload });
}

export function subscribe(taskId: string, handler: Handler) {
    ensureWorker();
    let set = listeners.get(taskId);
    if (!set) {
        set = new Set();
        listeners.set(taskId, set);
    }
    set.add(handler);
    return () => {
        set!.delete(handler);
        if (set!.size === 0) listeners.delete(taskId);
    };
}