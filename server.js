// For HTTP services
const http = require('http');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const {parse} = require('querystring');

// For logs
const logEvents = require('./logEvents');
const EventEmmiter = require('events');

// Setting the emitter
class Emitter extends EventEmmiter {};
const myEmitter = new Emitter();
myEmitter.on('log',(msg)=> logEvents(msg));

// Declaring the port 
const PORT = process.env.PORT || 8000;










//***** GET
const serveFile = async(filePath, contentType, response) => {
 try{
 // Data is treated like a binary if is a image or a video
   var rawData = await fsPromises.readFile(filePath,
     (!contentType.includes('image') && !contentType.includes('video') && !contentType.includes('audio')) ? 'utf8' : '', 
   );

 // Getting last-modified date
  const lastModified = fs.statSync(filePath).mtime.toUTCString();

 // Make response
   response.writeHead(
     filePath.includes('404.html') ? 404 : 200,   
     {'Content-Type': contentType,
      'Content-Length' : contentType === 'application/json' ? Buffer.byteLength(JSON.stringify(rawData)) : Buffer.byteLength(rawData),
      'Date': new Date().toUTCString(),
      'Server': 'NodeJs',
      'Last-Modified': lastModified,
      'Connection': 'keep-alive',
      'Keep-Alive': 'timeout=5',
     });
 // Showing JSON format if it is necesary
   response.end(contentType === 'application/json' ? JSON.stringify(rawData) : rawData);
// IF there is an error
 } catch(err){
   console.log(err);
   response.statusCode = 500;
   response.end();
 }
}










// HEAD
const sendHead = async(filePath, contentType, response) => {
 try{
 // IF filePath is NULL then it is a HEAD method
 // Data is treated like a binary if is a image or a video
   var rawData = await fsPromises.readFile(filePath,
     (!contentType.includes('image') && !contentType.includes('video') && !contentType.includes('audio')) ? 'utf8' : '', 
   );

 // Getting last-modified date
  const lastModified = fs.statSync(filePath).mtime.toUTCString();

 // Make response
   response.writeHead(
     filePath.includes('404.html') ? 404 : 200,   
     {'Content-Type': contentType,
      'Content-Length' : contentType === 'application/json' ? Buffer.byteLength(JSON.stringify(rawData)) : Buffer.byteLength(rawData),
      'Date': new Date().toUTCString(),
      'Server': 'NodeJs',
      'Last-Modified': lastModified,
      'Connection': 'keep-alive',
      'Keep-Alive': 'timeout=5',
     });
   response.end();
// IF there is an error
 } catch(err){
   console.log('Error: ',e);
   response.statusCode = 500;
   response.end();
 }
}










function collectRequestData(request, callback){
 const FORM_URLENCODED ='application/x-www-form-urlencoded';
 if(request.headers['content-type'] == FORM_URLENCODED){
  let body='';
  request.on('data', chunk => {
   body += chunk.toString();
  });
  request.on('end', () => {
   callback(body,parse(body));
  });
 } else {
  callback(null,null);
 }
}











// Creating the server
// It shows the request url and method
const server = http.createServer((req,res) =>{
 console.log(req.url," ",req.method);
 // LOGS
 setTimeout(()=>{
  myEmitter.emit('log',`${req.method}->${req.url}\tLog event emitted`);
 },2000);


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
   break;
  case '.jpg' || '.jpeg':
   contentType = 'image/jpeg';
   break;
  case '.webp':
   contentType = 'image/webp';
   break;
  case '.gif':
   contentType = 'image/gif';
   break;
  case '.mp4':
   contentType = 'video/mp4';
  case '.webm':
   contentType = 'video/webm';
   break;
  case '.ogg':
   contentType = 'video/ogg';
   break;
  case '.3gp':
   contentType = 'video/3gp';
   break;
  case '.mp3':
   contentType = 'audio/mp3';
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
      : path.join(__dirname,'data',req.url);

// makes .html extension not required in the browser
 if(!extension && req.url.slice(-1) !== '/') filePath += '.html';
 console.log(filePath);

 const fileExist = fs.existsSync(filePath);
  
// Sending file

switch(req.method){
case 'GET':
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
     serveFile(path.join(__dirname,'views','404.html'),'text/hmtl',res);
     break;
   }
 }
 break;


case 'HEAD':
 if(fileExist){
   sendHead(filePath, contentType, res);
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
     sendHead(path.join(__dirname,'views','404.html'),'text/hmtl',res);
     break;
   }
 }
 break;


case 'POST':
 // Reading the request
 try{
  const formParams = {};
  collectRequestData(req,(rawData,_)=>{
   console.log(rawData);
   const formData = new URLSearchParams(rawData);
   for (const [key, value] of formData){
    formParams[key] = value;
   }  
  
  // Saving the form in JSON format 
   const FORMDATA = JSON.stringify(formParams);
   const FILE = path.join(__dirname,'toyDatabase.json');
   let DATA = [];
   if(fs.existsSync(FILE)){
    const existingData = fs.readFileSync(FILE,'utf-8');
    DATA = JSON.parse(existingData);
   }  
   DATA.push(JSON.parse(FORMDATA));
   fs.writeFileSync(FILE,JSON.stringify(DATA));
   res.writeHead(200);
   res.end('Data added to the Database succesfully');
   console.log(JSON.parse(fs.readFileSync(FILE,'utf-8')));
  });

 } catch(e) {
  console.log('Error: ',e);
  res.writeHead(505);
  res.end('Internal error');
 }
 break;


case 'PUT':
// It is not intended for work, because if  i want to PUT data
// I have to know that one field that matches
 const formParams = {};
 collectRequestData(req,(rawData,_)=>{
  console.log(rawData);
  const formData = new URLSearchParams(rawData);
  for (const [key, value] of formData){
   formParams[key] = value;
  }

  const FORMDATA = JSON.stringify(formParams);
  const FILE = path.join(__dirname,'data.json');

  if(fs.existsSync(FILE)){
   const existingData = fs.readFileSync(FILE,'utf-8'); 
   const DATA = JSON.parse(existingData);
   const formdataExists = DATA.some(item => JSON.stringify(item) === FORMDATA);

   if(formdataExists){
    res.writeHead(409);
    res.end('Conflict: Value already exist in the database');
   } else {
    
    res.writeHead(200);
    res.end('Database updated succesfully');
   }
  } else {
   console.log(`Trying to PUT data in a non existing file\n
                Target: ${FILE},\n
                Data: ${FORMDATA}`);
   serveFile(path.join(__dirname,'views','404.html'),'text/hmtl',res);
 }

 });
 break;


case 'DELETE':
 try{
  const ADMIN = '::1';
  const IP = req.socket.remoteAddress;
  if(contentType === 'text/html') {
   var FILE = path.join(__dirname,'views',req.url);
  } else {
   var FILE = path.join(__dirname,'data',req.url);
  }

  if(fs.existsSync(FILE) && IP === ADMIN){
   fs.unlinkSync(FILE, (err) =>{
    if(err) throw new Error(`Error removing ${FILE}`);
   });
   res.writeHead(200);
   res.end('File deleted succesfully'); 
  } else {
   res.writeHead(404);
   res.end('File does not found');
  }
 } catch(e) {
   console.log('Error: ',e);
 }
 break;


default:
 serveFile(path.join(__dirname,'views','Denied.html'), 'text/html', res);
 break;
} // switch

}); // createServer()

// Put the server on listening
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));



 
