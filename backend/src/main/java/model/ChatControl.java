package model;

import entity.Message;
import decoder.MessageDecoder;
import decoder.MessageEncoder;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
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

    @OnMessage(maxMessageSize = 25000000)
    public void onFileUpload(InputStream is, Session session) throws IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            int nRead;
            byte[] data = new byte[4096];
            System.out.println(data.length);
            while ((nRead = is.read(data, 0, data.length)) != -1) {
                buffer.write(data, 0, nRead);
            }
            buffer.flush();
        mh.sendFile(buffer.toByteArray(), session);
    }

    @OnMessage
    public void onMessage(Session session, Message message) throws EncodeException, IOException {
//        System.out.println(message);
        mh.sendMessage(message);
    }

    @OnClose
    public void onClose(Session session) throws IOException, EncodeException {
        mh.disconnectHandler(session);
    }

    @OnError
    public void onError(Session session, Throwable throwable) throws EncodeException, IOException {
        System.out.println(throwable);
//        throwable.printStackTrace();
    }
}
