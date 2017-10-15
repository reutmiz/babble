var id = parseInt("0");
var messages = [];

function addMessage(message) {
    message.msgId = id;
    id++;
    messages.push(message);
  
    return message.msgId;
}
function getMessages(counter){
        return messages.slice(counter);
}
function getMessagesLength(){
    return messages.length;
}
function deleteMessage(id){
    for (var i=0; i<getMessagesLength(); i++){
        if(id == messages[i].msgId){
            messages.splice(i,1);
        }
    }
}
module.exports = { addMessage, getMessagesLength,getMessages,deleteMessage };