var http = require('http'),
    messages = require('./messages-util'),
    url = require('url'),
    queryUtil = require('querystring');
     md5 = require('md5');
var clients = [];
var existUsers=[];
var numOfUsers = 0;
//prevent server timeout
setInterval(function() {
    while(existUsers.length > 0){
        var user = existUsers.pop();
        user.writeHead(200, { 'Content-Type': 'application/json' });
        user.end(JSON.stringify({
            status: 'timeout'
        }));
      }
      while(clients.length > 0) {
        var client = clients.pop();
        client.end(JSON.stringify( {
            count: messages.getMessagesLength(),
            append: []
        }));
    }

}, 90000);

var server = http.createServer(function (req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, From');
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
  
      if (req.method === 'OPTIONS'){
        res.writeHead(204);
        res.end("Error 204");
          return;
      }
   var url_parts = url.parse(req.url);
  // All GET scenarios
   if (req.method == 'GET'){
        //error handler for get scenarios
    if(url_parts.path == '/messages'){
    res.writeHead(405);
    res.end("method not allowed");
    }
    else if(url_parts.path.substr (0,10) == '/messages/'){
        var retId = url_parts.path.substr(10);
        if (!isNaN(retId)){
            res.writeHead(405);
            res.end("method not allowed");
            return;
        }
    }
    else if (url_parts.path == '/stats'){
    res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                usersNum: numOfUsers,
                msgsNum: messages.getMessagesLength()
                }));
       }
     // new user in chat
    else if(url_parts.path == '/login'){
            numOfUsers++;
            while(existUsers.length > 0){
            var user = existUsers.pop();
            user.writeHead(200, { 'Content-Type': 'application/json' });
            user.end(JSON.stringify({
                status: 'login'
            }));
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(true)) 
      }
      //updating all exist users with updated stats 
    else if(url_parts.path == '/update'){
            existUsers.push(res);
    }
    else if (url_parts.path.substr(0,9) == '/messages'){ 
            //check if the data is valid
            if((url_parts.query == null) || (url_parts.query.substr(0,8) != 'counter=')||(isNaN(url_parts.query.substr(8)) === true)){
                res.writeHead(400);
                res.end("Bad request");
                return;
            }
            var requestBody = '';
            var count = url_parts.path.replace(/[^0-9]*/, '');
            if(messages.getMessagesLength() > count) {
                newMsg = messages.getMessages(count);
                if (newMsg != null){
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify( {
                        count: messages.getMessagesLength(),
                        append: newMsg
                    }));
                }
            }
             else {
                clients.push(res);
            }
        }
        else if(url_parts.path == '/disconnect'){
            if(numOfUsers > 0){
                numOfUsers--;
                //update exist users that a user disconnected
                while(existUsers.length > 0){
                    var user = existUsers.pop();
                    user.writeHead(200, { 'Content-Type': 'application/json' });
                    user.end(JSON.stringify({
                        users: numOfUsers,
                        messages: messages.getMessagesLength(),
                    }));
                  }
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(true)) 
        }
        else{
            res.writeHead(404);
            res.end("non-existent URLs (not found)");
            return;
        }
  }
  //all DELETE scenarios
  else if (req.method == 'DELETE'){
    if (url_parts.path.substr (0,10) == "/messages/"){
        var retId = url_parts.path.substr(10);
        //check if id is a valid number
        if (!isNaN(retId)){
            messages.deleteMessage(retId);
            while(existUsers.length > 0){
                var user = existUsers.pop();
                user.writeHead(200, { 'Content-Type': 'application/json' });
                user.end(JSON.stringify({
                    status: 'delete',
                    id: retId
                }));
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(true));
        }
        else{
            res.writeHead(400);
            res.end("Bad request"); 
            return;
        }
    }
    //eror handler for delete scenarios
    else if(url_parts.path == "/stats"){
        res.writeHead(405);
        res.end("method not allowed");
        return;
    }
    else if(url_parts.path == '/messages' ){
        res.writeHead(405);
        res.end("method not allowed");
        return;
    }
    else if(url_parts.path.includes('/messages?counter=')){
        res.writeHead(405);
        res.end("method not allowed");
        return;
    }
    else{
        res.writeHead(404);
        res.end("non-existent URLs (not found)");
        return;
    }
}
  //all POST scenarios
else if (req.method === 'POST') {
        //erroe handler for post scenarios
        if(url_parts.path == '/stats'){
            res.writeHead(405);
            res.end("method not allowed");
            return;
        }
        else if(url_parts.path == '/update'){
            res.writeHead(405);
            res.end("method not allowed");
            return;
        }
        else if(url_parts.path.includes('/messages?counter=')){
            res.writeHead(405);
            res.end("method not allowed");
            return;
        }
        else if (url_parts.path == '/messages/'){
            res.writeHead(405);
            res.end("method not allowed");
            return;
        }
    //get the data
    var requestBody = '';
    req.on('data', function(chunk) {
        requestBody += chunk.toString();
    });
    req.on('end', function() {
            try {
                var data = JSON.parse(requestBody);
            }
            catch (e) {
                res.writeHead(400);
                res.end("Bad request");
                return;
            }
            //check if the data is valid
            if ((!(data.hasOwnProperty('message')))||(!data.hasOwnProperty('name'))||
            (!data.hasOwnProperty('email'))|| (!data.hasOwnProperty('time'))) {
                res.writeHead(400);
                res.end("Bad request");
                return;
            }
            if(data.time==''){
                res.writeHead(400);
                res.end("Bad request");
                return;
            }
        // messages sent
        if(url_parts.path == '/messages'){ 
            var icon = (md5(data.email));
            var msg = {message: data.message,name:data.name, email: data.email,time: data.time,md5Image: icon};
            var retId = messages.addMessage(msg);
            while(clients.length > 0) {
                var client = clients.pop();
                client.end(JSON.stringify( {
                    count: messages.getMessagesLength(),
                    append: [{
                        message: data.message,
                        name:data.name,
                        email: data.email,
                        time: data.time,
                        md5Image: icon,
                        msgId:retId
                    }]
                }));
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(retId));
        }
        else{
            res.writeHead(404);
            res.end("non-existent URLs (not found)");
        }
    });
  }
});
server.listen(9000);
module.exports = {server, numOfUsers};