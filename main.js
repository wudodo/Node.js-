'use strict'

const fs = require('fs')

const request = require('request')
const cheerio = require('cheerio')

const log = function() {
    console.log.apply(console, arguments)
}

const Movie = function() {
    this.name = ''
    this.score = 0
    // this.quote = ''
    this.ranking = 0
    // this.coverUrl = ''
    this.country = ''
    this.type = ''
}

const movieFromDiv = function(div) {
    const m = new Movie()
    const e = cheerio.load(div)
    // a.author = e('.author-link-line > .author-link').text()
    // a.content = e('.zm-editable-content').html()
    // a.link = 'https://zhihu.com' + e('.answer-date-link').attr('href')
    // a.numberOfComments = e('.toggle-comment').text()
    var p = e('p')[0]
    var arr = e(p).text().split('/')
    // 国家
    var country = arr[arr.length-2].slice(1)
    country = country.slice(0, country.length-1)
    // 类型
    var typeArray = arr[arr.length-1].slice(1).split(' ')
    var l = typeArray.length
    var type = []
    for (var i = 0; i < typeArray.length; i++) {
        if(typeArray[i] !== '') {
            type.push(typeArray[i])
        }
    }
    m.country = country
    m.type = type
    m.ranking = e('em').text()
    m.name = e('.title').text()
    m.score = e('.rating_num').text()

    return m
}

// 这个函数负责解析一个网页的内容, 把存储信息的 divs 从 request()
// 中得到的 body 中取出来
const movieFromBody = function(body) {
    var options = {
        decodeEntities: false,
    }
    var e = cheerio.load(body, options)
    var divs = e('.item')
    var movies = []
    for (var i = 0; i < divs.length; i++) {
        var element = divs[i]
        var div = e(element).html()
        var answer = movieFromDiv(div)
        movies.push(answer)
    }
    return movies
}


const writeToFile = function(path, data) {
    fs.writeFile(path, data, function(err){
      log(path)
        if(err) {
            log('网页保存失败', err)
        } else {
            log('网页保存成功', path)
        }
    })
}

const cachedUrl = function(options, callback) {
    const path = options.url.split('/')[3].split('?')[1]
    fs.readFile(path, function(err, data){
        if(err != null) {
            request(options, function(error, response, body){
                writeToFile(path, body)
                callback(error, response, body)
            })
        } else {
            log('***读取到网页')
            const response = {
                statusCode: 200,
            }
            // 注意 : 读取的是 data
            callback(null, response, data)
        }
    })
}

const __main = function() {
    var singlePage = function(options) {
        cachedUrl(options, function(error, response, body){
            if(error === null && response.statusCode == 200) {
                const movies = movieFromBody(body)
                const utils = require('./utils')
                const path = 'top250.json'
                utils.saveJSON(path, movies)
            } else {
                log('***请求失败', error)
            }
        })
    }
    var urlBase = 'https://movie.douban.com/top250'
    for (var i = 0; i < 250; i += 25) {
        var searchStr = `?start=${i}&filter=`
        var url = urlBase + searchStr
        log(url)
        var options = {
            url: url,
        }
        singlePage(options)
    }
}

__main()
