
addEventListener('message', e => {
    
    const { func, data} = e.data
    const fn = new Function('return ' + func)();
    const result = fn(data)
        postMessage(result);
});