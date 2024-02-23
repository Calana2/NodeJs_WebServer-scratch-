const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

// Logs
 const logEvents = async(message)=>{
  const dateTime = new Date().toUTCString();
  const logItem = `${dateTime}\t${message}\n`;
  console.log(logItem);
  try {
   const logsDir = path.join(__dirname,'logs');
   if(!fs.existsSync(logsDir)){
    await fsPromises.mkdir(logsDir,{recursive:true});
   }
   await fsPromises.appendFile(path.join(__dirname,'logs','eventLog.txt'),logItem);
  } catch (err) {
   console.log(err); 
  }
 }

module.exports = logEvents;


