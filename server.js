const http = require('http');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

// Logs
//
  //
  // 
  //

// Declaring the port 
const PORT = process.env.PORT || 8000;

const serveFile = async(filePath, contentType, response) => {
 try{
 // Data is treated like a binary if is a image or a video
   const rawData = await fsPromises.readFile(
     filePath,
     (!contentType.includes('image') || !contentType.includes('video') || contentType.includes('audio')) ? 'utf8' : '');
  // Excluding 200 OK from Error Page
   response.writeHead(
     filePath.includes('404.html') ? 404 : 200,
     {'Content-Type': contentType});
  // Showing JSON format if it is necesary
   response.end(
     contentType === 'application/json' ? JSON.stringify(rawdData) : rawData);
 } catch(err){
   console.log(err);
   response.statusCode = 500;
   response.end();
 }
}

// Creating the server
// It shows the request url and method
const server = http.createServer((req,res) =>{
 console.log(req.url," ",req.method);

switch(req.method){

case 'GET':

// Getting the extension
 const extension = path.extname(req.url); 
 let contentType;
 switch (extension) {
  case '.css':
   contentType = 'text/css';
   break;
  case '.js':
   contentType = 'application/javascript';
   break;
  case '.json':
   contentType = 'application/json';
   break;
  case '.png':
   contentType = 'image/png';
  case '.webm':
   contentType = 'video/webm';
   break;
  case '.ogg':
   contentType = 'audio/ogg';
   break;
  case '.txt':
   contentType = 'text/plain';
   break;
  default:
   contentType = 'text/html';
   break;
  }

  // Adding the route
  let filePath = 
    contentType === 'text/html' && req.url === '/'
    ? path.join(__dirname,'views','index.html')
    : contentType === 'text/html' && req.url.slice(-1) === '/'
     ? path.join(__dirname,'views',req.url)
     : contentType === 'text/html'
      ? path.join(__dirname,'views',req.url)
      : path.join(__dirname,req.url);

// makes .html extension not required in the browser
 if(!extension && req.url.slice(-1) !== '/') filePath += '.html';
 console.log(filePath);

 const fileExist = fs.existsSync(filePath);
  
// Sending file
 if(fileExist){
   serveFile(filePath, contentType, res);
 } else {
   switch(path.parse(filePath).base){
    case 'old-page.html':
     res.writeHead(301, {'Location':'/new-page.html'});
     res.end();
     break;
    case 'www-page.html':
     res.writeHead(301, {'Location':'/'});
     res.end();
     break;
    default:
     serveFile(path.join(__dirname,'views','404.html'), 'text/html', res);
   }
 }
break;

case 'POST':
 break;
case 'HEAD':
 break;
case 'PUT':
 break;

default:
 serveFile(path.join(__dirname,'views','Denied.html'), 'text/html', res);
break;
}

}); // createServer()

// Put the server on listening
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));



 
