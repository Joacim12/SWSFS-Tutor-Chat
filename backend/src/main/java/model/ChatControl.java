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
 *
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

    @OnOpen
    public void onOpen(Session session, @PathParam("param") String param) throws EncodeException, IOException {
        if (param.equals("debug")) {
            debug.setSession(session);
        } else if (param.equals("register")) {
            return;
        } else {
            for (Profile user : mh.getUserFacade().getProfiles()) {
                if (user.getUsername().equals(param)) { 
                    mh.addUser(session, user);
                }
            }
            if (debug.getSession() != null) {
                chatDebugger.setCommand("onlineProfiles");
                chatDebugger.setProfiles(mh.getOnlineProfiles());
                debug.getSession().getAsyncRemote().sendObject(chatDebugger);
            }
        }
    }

    @OnMessage(maxMessageSize = 25000000) // 25mb
    public void onFileUpload(InputStream is, Session session) throws IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        int nRead;
        byte[] data = new byte[4096];
        while ((nRead = is.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, nRead);
        }
        buffer.flush();
        mh.sendFile(buffer.toByteArray(), session);
    }

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

    @OnClose
    public void onClose(Session session) throws IOException, EncodeException {
        if (!(debug.getSession() != null && debug.getSession().equals(session))) {
            mh.disconnectHandler(session);
        }
    }

    @OnError
    public void onError(Session session, Throwable throwable) throws EncodeException, IOException {
        System.out.println(throwable);
//        throwable.printStackTrace();// incomment for seeing full errors
    }

}
