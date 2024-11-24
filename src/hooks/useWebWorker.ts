// import { useEffect, useRef, useState } from "react";
// import { ListMessagesType } from "../types/types";

import { useEffect, useRef, useState } from "react";
import { ListMessagesType } from "../types/types";

const workerHandler = (fn: (value: ListMessagesType) => ListMessagesType) => {
    //console.log('>>>>>>>>>>', fn)
    //const fn1 = new Function('return ' + fn)();
    onmessage = event => {
        //console.log('>>>>>>>>>>>>' ,event.data)
        postMessage(fn(event.data))
    }
}


// export function useWebWorker(fn: any) {

//     const [result, setResult] = useState<ListMessagesType>(null)
//     const workerRef = useRef(null)

//     useEffect(() => {
//         const fnString = fn.toString();        
//         const worker = new Worker(
//             URL.createObjectURL(new Blob([`(${workerHandler})(${fnString})`], { type: 'application/javascript' }))
//         )
//         workerRef.current = worker
//         worker.onmessage = event => setResult(event.data)
//         return () => {
//             worker.terminate()
//         }
//     }, [fn])

//     return {
//         result,
//         run: (value: ListMessagesType) => workerRef.current?.postMessage(value)
//     }

// }

// export function useWebWorker(fn: () => ListMessagesType) {

//     const [result, setResult] = useState(null)

//     // if(window.Worker) {
//     //     const myWorker = new Worker('../utils/worker.ts', {type: 'module'})
//     //     myWorker.postMessage(fn)
//     //     myWorker.onmessage = (e) => {
//     //         setResult(e.data)
//     //     }
//     // } else {
//     //     setResult(fn())
//     // }

//     if(!window.Worker) setResult(fn())

//     useEffect(() => {
//         const myWorker = new Worker('../utils/worker.ts', {type: 'module'})
//         myWorker.postMessage(fn)
//         myWorker.onmessage = (e) => {
//             setResult(e.data)
//         }
//         return () => myWorker.terminate()
//     }, [fn]);

//     return {result}

// }

// export function useWebWorker<T, R>(workerFunction: (input: T) => R): [R | null, (input: T) => void] {
//     const [result, setResult] = useState<R | null>(null);
//     const workerRef = useRef<Worker | null>(null);

//     useEffect(() => {
//         const blob = new Blob([`onmessage = function(e) { postMessage((${workerFunction})(e.data)); }`], { type: 'application/javascript' });
//         const worker = new Worker(URL.createObjectURL(blob));
//         workerRef.current = worker;

//         worker.onmessage = (e: MessageEvent) => {
//             setResult(e.data);
//         };

//         return () => {
//             worker.terminate();
//         };
//     }, [workerFunction]);

//     const runWorker = (input: T) => {
//         if (workerRef.current) {
//             workerRef.current.postMessage(input);
//         }
//     };

//     return [result, runWorker];
// }