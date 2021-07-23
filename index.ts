import * as fs from 'fs'
import * as http from 'http'
import * as p from 'path'
import { IncomingMessage, ServerResponse } from 'http'

const server = http.createServer()
const publicDir = p.relative(__dirname, 'public')

server.on('request', (request: IncomingMessage, response: ServerResponse) => {
    const { url: path, method } = request
    if (method !== 'GET') {
        response.statusCode = 405// Method Not Allowed
        response.end();
        return;
    }
    // const pathname = url.parse(path).pathname
    const { pathname } = new URL(path, 'http://localhost:8888')
    let fileName = pathname.substring(1)
    if (fileName === '') { fileName = 'index.html' }
    fs.readFile(p.resolve(publicDir, fileName), (error, data) => {
        if (error) {
            if (error.errno === -4058) {
                response.statusCode = 404 //找不到文件
                fs.readFile(p.resolve(publicDir, '404.html'), (error, data) => {
                    response.end(data)
                })
            } else if (error.errno === -4068) {
                response.statusCode = 403 //没有权限访问
                response.end('无权查看目录内容')
            } else {
                response.statusCode = 500 //服务器内部错误
                response.end('服务器繁忙，请稍后再试')
            }
        } else {
            response.setHeader('Cache-Control', 'public,max-age=3600')
            response.end(data)
        }
    })
})

server.listen(8888)