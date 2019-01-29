
self.addEventListener('message',({data})=>{

    try{
        var {file,size} = data
        if(file.size<size) size = file.size
        const chunk_count = Math.ceil(file.size / size)
        var chunks = []


        for(let chunk_index=0;chunk_index<chunk_count;chunk_index++){
            const chunk = file.slice(chunk_index*size,(chunk_index+1)*size)
            chunks.push(chunk)
        }
    }catch(err){
        throw new Error(err)
    }

    postMessage(chunks)
})