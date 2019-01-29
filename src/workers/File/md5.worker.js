import SparkMD5 from 'spark-md5'

self.addEventListener('message',function({data}){
    let reader = new FileReader()
    let point = 0;
    const buffer = new SparkMD5.ArrayBuffer()

    reader.onload = function(){
        buffer.append(reader.result)

        if(point===data.length-1){
            let result = buffer.end()
            self.postMessage(result)
            // self.stop()
            // self.terminate()
        }else{
            point++;
            load()
        }
    }

    function load(){
        reader.readAsArrayBuffer(data[point])

    }

    if(data.length){
        load()
    }

})