var http = require('http');
var fs = require('fs');
var url = require('url');
 
 
// 创建服务器
http.createServer( function (request, response) {  
   // 解析请求，包括文件名
   var pathname = url.parse(request.url).pathname;
   
   // 输出请求的文件名
   console.log("Request for " + pathname + " received.");
   
    if(pathname == '/'){
        pathname = '/index.html';
    }

   // 从文件系统中读取请求的文件内容
   fs.readFile(__dirname+pathname, function (err, data) {
      if (err) {
         console.log(err);
         // HTTP 状态码: 404 : NOT FOUND
         // Content Type: text/html
         response.writeHead(404, {'Content-Type': 'text/html'});
      }else{           
        // HTTP 状态码: 200 : OK
        if(pathname.indexOf('.css') > -1){
            response.writeHead(200, {'Content-Type': 'text/css'});
        }else if(pathname.indexOf('.js') > -1){
            response.writeHead(200, {'Content-Type': 'text/javascript'});
        }else{          
            response.writeHead(200, {'Content-Type': 'text/html'}); 
        }  
        // 响应文件内容
         response.write(data.toString());        
      }
      //  发送响应数据
      response.end();
   });   
}).listen(8080);
 
// 控制台会输出以下信息
console.log('Server running at http://127.0.0.1:8080/');