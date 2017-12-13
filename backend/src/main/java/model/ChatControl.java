package model;

import com.google.gson.Gson;
import decoder.DebugEncoder;
import decoder.MessageDecoder;
import decoder.MessageEncoder;
import entity.ChatDebugger;
import entity.Message;
import entity.Profile;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import javax.websocket.*;
import javax.websocket.server.*;

/**
 * The websocket server endpoint class, listening on localhost/chat/
 * Uses three encoders, which will take the Message object or Debug and convert 
 * it to json.
 * @author jvetterlain
 */
@ServerEndpoint(value = "/chat/{param}", decoders = MessageDecoder.class, encoders = {MessageEncoder.class, DebugEncoder.class})
public class ChatControl {

    private MessageHandler mh;
    private static Profile debug = new Profile();
    private static ChatDebugger chatDebugger = new ChatDebugger();

    public ChatControl() {
        mh = new MessageHandler();
    }

    /**
     * When a client opens a connection, this method will be called.
     * Here we check the path parameter and hanldes that.
     * @param session used for sending messages to the user.
     * @param param used for determing if it's a debug session or new register,
     * or just a user logging in.
     */
    @OnOpen
    public void onOpen(Session session, @PathParam("param") String param) throws EncodeException, IOException {
        if (param.equals("debug")) {
            debug.setSession(session);
        } else if (param.equals("register")) {
            return;
        } else {
            for (Profile user : mh.getUserFacade().getProfiles()) {
                if (user.getUsername().equals(param)) {
                    user.setSession(session);
                    mh.addUser(user);
                }
            }
            if (debug.getSession() != null) {
                chatDebugger.setCommand("onlineProfiles");
                chatDebugger.setProfiles(mh.getOnlineProfiles());
                debug.getSession().getAsyncRemote().sendObject(chatDebugger);
            }
        }
    }

    /**
     * This class is responsible for forwarding files from one client to another.
     * And will be called if the client send a byte array.
     * @param is the file coming from the client
     * @param session the user who sent the files session
     */
    @OnMessage(maxMessageSize = 25000000) // 25mb
    public void onFileUpload(InputStream is, Session session) throws IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        int nRead;
        byte[] data = new byte[4096];
        while ((nRead = is.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, nRead);
        }
        buffer.flush();
        mh.getUser(session).setBuf(buffer.toByteArray());
    }

    /**
     * OnMessage for 'text messages' 
     * Will take the session and message parameters and either create a user,
     * send a message to the chatdebugger and send the message,
     * or just send a message.
     * @param session contains info about the client who sent the messages info
     * @param message the message the client wants to send.
     */
    @OnMessage
    public void onMessage(Session session, Message message) throws EncodeException, IOException {
        if (message.getCommand().equals("createUser")) {
            Profile p = new Profile();
            p.setMessages(new ArrayList());
            p.setUsername(message.getContent());
            mh.getUserFacade().createProfile(p);
        }
        if (debug.getSession() != null) {
            chatDebugger.setCommand("message");
            chatDebugger.setMessage(message);
            debug.getSession().getAsyncRemote().sendObject(chatDebugger);
            mh.handleMessage(message);
        } else {
            mh.handleMessage(message);
        }
    }

    
    /**
     * Will be called if an error gets thrown, or the user disconnects.
     * @param session the session that should be removed from our system.
     */
    @OnClose
    public void onClose(Session session) throws IOException, EncodeException {
        if (!(debug.getSession() != null && debug.getSession().equals(session))) {
            mh.disconnectHandler(session);
        }
    }

    /**
     * Will currently just print the throwable, get's called everytime a user disconnects
     * since the frontend never calls close.
     * @param session who caused the error.
     * @param throwable the error
     */
    @OnError
    public void onError(Session session, Throwable throwable) throws EncodeException, IOException {
//        System.out.println(throwable);
        throwable.printStackTrace();// incomment for seeing full errors
    }

}
