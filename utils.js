const log = function() {
    console.log.apply(console, arguments)
}

const saveJSON = function(path, content) {
    const fs = require('fs')
    var s = JSON.stringify(content, null, 2)
    fs.appendFile(path, s, function(err){
        if(err != null) {
            log('***写入数据库出错', err)
        } else {
            log('保存到数据库成功')
        }
    })
}

exports.saveJSON = saveJSON
