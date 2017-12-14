let connection;
let webSocket = "ws://localhost:8084/TutorChat/chat/";
let user;


export function setConnection(userAndToken){
    if(connection===undefined){
    connection = new WebSocket(webSocket + userAndToken);
    } else{
        console.log("already connected!")
    }
}

export function setUser(usr){
    user = usr;
}

export function getUser(){
    return user;
}

export function getConnection(){
    return connection;
}

export function closeConnection(){
    user = null;
    connection.close();
    connection = undefined;
}