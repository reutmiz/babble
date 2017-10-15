window.Babble = (function(){
        var counter = 0;
        //save the user details in localstorage
        function register(userInfo){
            if  (userInfo != null){
                var babble = {"userInfo":userInfo , "currentMessage" : ""}
                var babbleJSON = JSON.stringify(babble);
                localStorage.setItem('babble', babbleJSON);
                return true;
            }
            else{
                return false;
            }
        }
        //get all messages from server
		function getMessages(counter, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", 'http://localhost:9000/messages?counter=' + counter);
            xhr.addEventListener("load", function(){
                if(xhr.status != 200){
                    return;
                }
                var retValue = JSON.parse(this.responseText);
                Babble.counter = retValue.count;
                if(callback){
                    callback(retValue);
                    return;
                }
                displayMessages(retValue);
                document.getElementById('msgNum').textContent = retValue.count; //update stat view
                getMessages(Babble.counter);
                var lo = document.getElementById('messagesPart');
                lo.scrollTop = lo.scrollHeight; //updating scroll position
            });
            xhr.send();
        }
        //send new message to server
        function postMessage(message, callback){
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "http://localhost:9000/messages");
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.addEventListener("load", function(){
                if(xhr.status != 200){   
                    return;
                }
                if (callback){
                    var retValue = JSON.parse(this.responseText);
                    callback(retValue);
                }
            });
            xhr.send(JSON.stringify(message));
        }
        //delete message from server
        function deleteMessage(id, callback){
            var xhr = new XMLHttpRequest();
            xhr.open("DELETE", "http://localhost:9000/messages/" + id, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.addEventListener('load', function () { 
                if(xhr.status != 200){
                    return;
                }
                var retValue = JSON.parse(this.responseText);
                if (callback){
                    callback(retValue);
                }
            });
            xhr.send();
        }
        //get update stats details
        function getStats(callback){
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "http://localhost:9000/stats", true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.addEventListener('load', function () { 
                if(xhr.status != 200){
                    return;
                }
                var retValue = JSON.parse(this.responseText);
                if (callback){
                    callback(retValue);
                }
            });
            xhr.send();
        }
        return {
            counter: counter,
            getMessages: getMessages,
            register:register,
            postMessage: postMessage,
            deleteMessage: deleteMessage,
            getStats: getStats
        }
    })();
    //check if enter preesed and creates new message
    function checkIfEnterPressed(event){
        if(event.keyCode  == 13){
            postFunction();
        }
        else{       //save the temporary text
            var BValue =JSON.parse(localStorage.getItem('babble'));
            BValue.currentMessage = document.getElementById('textArea').value;
            localStorage.setItem('babble', JSON.stringify(BValue));
        }
    }
    //create new message and send it to postmessage function
    function postFunction(callback){
        var curBabble =JSON.parse(localStorage.getItem('babble'));
        var text = document.getElementById("textArea").value;
        var currentdate = new Date();
        var hour = currentdate.getHours();
        if (hour < 10){
            hour = "0" + hour;
        }
        var minutes = currentdate.getMinutes();
        if (minutes < 10){
            minutes = "0" + minutes;
        }
        var retTime = hour + ":" + minutes;
        var retMessage = {name:curBabble.userInfo.name,
            email:curBabble.userInfo.email,
            message: text,
            time: retTime,
            md5Image: email
        }
        document.getElementById('textArea').value = '';
        curBabble.currentMessage = '';
        localStorage.setItem('babble', JSON.stringify(curBabble)); 
        Babble.postMessage(retMessage);
    }
    //remove deleted message from display
    function removeMessageFromDisplay(id){
        var liToDelete = document.getElementById(id+'i');
        var ol = document.getElementById("messagesPart");
        ol.removeChild(liToDelete);
    }
    //display all new messages
    function displayMessages(messages){
        var local = JSON.parse(localStorage.getItem('babble'));
        var localEmail = local.userInfo.email;
        for (var i =0; i<messages.append.length; i++){
            var li = document.createElement('li');
            document.getElementById('messagesPart').appendChild(li);
            var innerdiv = document.createElement('div');
            var innerImg = document.createElement('img');
            var bTag = document.createElement('b');
            var cite = document.createElement('cite');
            var textdiv = document.createElement('div');
            var timeTag = document.createElement('time');
            if (messages.append[i].name!= ""){
                cite.textContent = messages.append[i].name;
                var srcImage = ("https://www.gravatar.com/avatar/"+messages.append[i].md5Image+".jpg")
            }
            else{
                cite.textContent = 'Anonymous'
                var srcImage = ("images/anonymous.png")
            }
            innerdiv.className = 'message-box';
            innerImg.setAttribute("src",srcImage);
            innerImg.setAttribute("alt","");
            innerdiv.setAttribute("tabindex",1);
            timeTag.textContent = messages.append[i].time;
            textdiv.textContent = messages.append[i].message;
            li.appendChild(innerImg);
            li.appendChild(innerdiv);
            li.setAttribute("id",messages.append[i].msgId +'i');
            li.setAttribute("class","message");
            innerdiv.appendChild(bTag);
            if ((localEmail!= "") && (localEmail == messages.append[i].email)){
                var deleteBtn = document.createElement('button');
                deleteBtn.setAttribute("aria-label","Delete");
                deleteBtn.setAttribute("id",messages.append[i].msgId);
                deleteBtn.setAttribute("OnClick","Babble.deleteMessage(id);return false;");
                innerdiv.appendChild(deleteBtn);
            }
            innerdiv.appendChild(textdiv);
            bTag.appendChild(cite);
            bTag.appendChild(timeTag);
        }
    }
    //checking if localstorage is available
    function storageAvailable(type) {
        try {
            var storage = window[type],
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch(e) {
            return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // acknowledge QuotaExceededError only if there's something already stored
                storage.length !== 0;
        }
    }
    function open_modal(){
        document.getElementById("modal-overlay").style.display = 'block';
        document.getElementById("modal").style.display = 'block';
    }
    
    function close_modal(){
        document.getElementById("modal-overlay").style.display = 'none';
        document.getElementById("modal").style.display = 'none';
    }
    //save all details in localstorage  
    function clickOnSaveeBtn(){
            var babbleVar = {'name':document.getElementById("name").value,'email':document.getElementById("email").value};
            Babble.register(babbleVar);
            close_modal();
    }
    //save anonymous details in localstorage
    function clickOnAnonymousBtn(){
        var babbleVar = {'name':"",'email':""};
        Babble.register(babbleVar);
        close_modal();
    }
    function updateStatsView(newStats){
        document.getElementById('usersNum').textContent = newStats.usersNum;
        if ( document.getElementById('msgNum') != null){
            document.getElementById('msgNum').textContent = newStats.msgsNum;
        }
    }
    //check if there is a new user 
    function login(callback){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://localhost:9000/login", true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.addEventListener('load', function () {
            if (xhr.status != 200){
                return;
            }
            if(callback){
                callback(JSON.parse(this.responseText));
            }
            Babble.getStats(updateStatsView);
            updateStatRecur();
        });
        xhr.send();
    }
    //check if user disconnect from chat
    function disconnect(callback){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://localhost:9000/disconnect", true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.addEventListener('load', function () { 
            if(xhr.status != 200){   
                return;
            }
            if(callback){
                callback(JSON.parse(this.responseText));
            }
            Babble.getStats(updateStatsView);
        });
        xhr.send();
    }
    //keep all users update with stats details
    function updateStatRecur(callback){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://localhost:9000/update", true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.addEventListener('load', function () { 
        if (xhr.status != 200){
            return;
        }
        var retValue = JSON.parse(this.responseText); 
        if(callback){
            callback(retValue);
        }
        if(retValue.status == 'delete'){
            removeMessageFromDisplay(retValue.id);
        }
        Babble.getStats(updateStatsView);
        updateStatRecur();
        });
        xhr.send();
    }
    //function that activate after loading
    window.addEventListener("load", function(event) {
		if(document.getElementById('growable') != null){
            growable = document.getElementById('growable').clientHeight ;
            makeGrowable(document.getElementById('growable'));
		}
        if (storageAvailable('localStorage')) { 
            if(!localStorage.getItem('babble')) {
                var bab = {
                    'currentMessage' : '',
                    'userInfo': {
                        'name': '',
                        'email': ''
                    }
                };
                localStorage.setItem('babble', JSON.stringify(bab));      
                //open modal and get the data
                open_modal();
            }   
            else {
                close_modal();
                var babble = JSON.parse(localStorage.getItem('babble'));
                if ( document.getElementById('textArea') != null){
                    document.getElementById('textArea').value = babble.currentMessage;
                }  
            }
        }
        else {
            // no localStorage
        }
        login();
        Babble.getMessages(0);
    });
    window.addEventListener("beforeunload", function(event) {
        disconnect();
    });
    //change the textarea window size
    function makeGrowable(container) {
        var before;
        var beforeForm;
        var initFormSize;
        if (container.querySelector('pre') != null){
            before = container.querySelector('pre').clientHeight;
        }
        if(document.getElementById('sendMsg') != null){
            beforeForm  = document.getElementById('sendMsg').clientHeight;
            initFormSize = beforeForm;
        }
		var area = container.querySelector('textarea');
		var clone = container.querySelector('span');
		area.addEventListener('input', function(e) {
			clone.textContent = area.value;
            var offset = container.querySelector('pre').clientHeight - before;
            before =  container.querySelector('pre').clientHeight;
            var currentForm = (document.getElementById('sendMsg')).clientHeight;
            if(offset != 0 && (before > currentForm || (before < currentForm && currentForm != initFormSize))){
                
                if(currentForm + offset > 300){
                    document.getElementById('sendMsg').style.height = 300 + 'px';
                    offset = 300 - currentForm;
                }
                else if (currentForm + offset < initFormSize){
                    document.getElementById('sendMsg').style.height = initFormSize + 'px';
                    offset = initFormSize - currentForm;
                }
                else{
                    document.getElementById('sendMsg').style.height = (currentForm + offset) + 'px';
                }
                var currentListSize = document.getElementById('messagesPart').clientHeight;
                document.getElementById('messagesPart').style.height = (currentListSize - offset) + 'px';
            }
            beforeForm = document.getElementById('sendMsg').clientHeight;
		});
    }
    //check if message sent
    var sendClick = document.getElementById('sendMsg');
    sendClick.addEventListener("submit", function(event) {
        event.preventDefault();
        document.querySelector('.js-growSpan').innerHTML = '';
        document.getElementById('sendMsg').removeAttribute('style');
        document.getElementById('messagesPart').removeAttribute('style');
        postFunction();
    });