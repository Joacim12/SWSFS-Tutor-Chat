package model;

import entity.Message;
import decoder.MessageDecoder;
import decoder.MessageEncoder;
import java.io.IOException;
import javax.websocket.*;
import javax.websocket.server.*;

/**
 *
 * @author jvetterlain
 */
@ServerEndpoint(value = "/chat/{username}", decoders = MessageDecoder.class, encoders = MessageEncoder.class)
public class ChatControl {

    private MessageHandler mh;

    public ChatControl() {
        mh = new MessageHandler();
    }

    @OnOpen
    public void onOpen(Session session, @PathParam("username") String username) throws EncodeException, IOException {
        mh.addUser(session, username);
    }

    @OnMessage
    public void onMessage(Session session, Message message) throws EncodeException, IOException {
        mh.sendMessage(message);
    }

    @OnClose
    public void onClose(Session session) throws IOException, EncodeException {
        mh.disconnectHandler(session);

    }

    @OnError
    public void onError(Session session, Throwable throwable) throws EncodeException, IOException {
//        System.out.println(throwable);
        throwable.printStackTrace();
    }
}
