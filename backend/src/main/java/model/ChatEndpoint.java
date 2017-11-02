package model;

import entity.Message;
import decoder.MessageDecoder;
import decoder.MessageEncoder;
import entity.User;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.websocket.*;
import javax.websocket.server.*;

/**
 *
 * @author jvetterlain
 */
@ServerEndpoint(value = "/chat/{username}", decoders = MessageDecoder.class, encoders = MessageEncoder.class)
public class ChatEndpoint {

    private final static List<User> users = new CopyOnWriteArrayList();
    private final static List<String> tutors = new CopyOnWriteArrayList();
    private final static Map<User, List<Message>> notGettingHelp = new ConcurrentHashMap();
    private final static Map<User, List<Message>> tutorConnected = new ConcurrentHashMap();

    public ChatEndpoint() {
        //lets fetch this from db in the future
        tutors.add("tutor");
        tutors.add("tutor1");
    }

    @OnOpen
    public void onOpen(Session session, @PathParam("username") String username) throws EncodeException, IOException {
        User user = new User();
        if (getIsTutor(username)) {
            user.setSession(session);
            user.setTutor(Boolean.TRUE);
            user.setUsername(username);
            users.add(user);
        } else {
            user.setSession(session);
            user.setUsername(username);
            user.setTutor(Boolean.FALSE);
            users.add(user);
        }
        for (User user1 : users) {
            if (user1.isTutor()) {
                sendMessage(getNeedHelp());
            }
        }
    }

    @OnMessage
    public void onMessage(Session session, Message message) throws EncodeException, IOException {
//        System.out.println(message);
        sendMessage(message);
    }

    @OnClose
    public void onClose(Session session) throws IOException, EncodeException {
        notGettingHelp.remove(findUser(session));
        tutorConnected.remove(findUser(session));
        users.remove(findUser(session));
        sendMessage(getNeedHelp());
        sendMessage(getConnectedUsers());
    }

    @OnError
    public void onError(Session session, Throwable throwable) throws EncodeException, IOException {
        System.out.println(throwable);
//        throwable.printStackTrace();
    }

    private void sendMessage(Message message) throws EncodeException, IOException {
        System.out.println(message);
        if (message.getCommand().equals("message") && message.getTo() != null) {
            for (User user : users) {
                if (user.getUsername().equals(message.getTo())
                        || user.getUsername().equals(message.getFrom())) {
                    user.getSession().getBasicRemote().sendObject(message);
                }
            }
        } else if (message.getCommand().equals("take")) {
            notGettingHelp.forEach((User usr, List<Message> messages) -> {
                messages.forEach((msg) -> {
                    try {
                        if (usr.getUsername().equals(message.getContent().split(":")[0])) {
                            findUser(message.getFrom()).getSession().getBasicRemote().sendObject(msg);
                        }
                    } catch (IOException | EncodeException ex) {
                        Logger.getLogger(ChatEndpoint.class.getName()).log(Level.SEVERE, null, ex);
                    }
                });
            });
            tutorConnected.putIfAbsent(findUser(message.getContent().split(":")[0]), new ArrayList());
            tutorConnected.get(findUser(message.getContent().split(":")[0])).add(message);
            System.out.println(notGettingHelp.size());
            notGettingHelp.remove(findUser(message.getContent().split(":")[0]));
            System.out.println(notGettingHelp.size());
            sendMessage(getNeedHelp());
            sendMessage(getConnectedUsers());
            Message m = new Message();
            m.setFrom("Server");
            m.setCommand("setTutor");
            m.setContent(message.getFrom());
            m.setTo(message.getContent().split(":")[0]);
            sendMessage(m);
        } else if (message.getCommand().equals(("setTutor"))) {
            for (User user : users) {
                if (user.getUsername().equals(message.getTo())) {
                    user.getSession().getBasicRemote().sendObject(message);
                }
            }
        } else if (message.getCommand().equals("connectedUsers")) {
            if (message.getTo() == null) {
                for (User tutor : getTutors()) {
                    tutor.getSession().getBasicRemote().sendObject(message);
                }
            } else {
                findUser(message.getTo()).getSession().getBasicRemote().sendObject(message);
            }
        } else if (message.getTo() == null && (!getIsTutor(message.getFrom())) && message.getFrom() != null) {
            if (findUser(message.getFrom()) != null) {
                notGettingHelp.putIfAbsent(findUser(message.getFrom()), new ArrayList());
                notGettingHelp.get(findUser(message.getFrom())).add(message);
            }
            for (User tutor : getTutors()) {
                tutor.getSession().getBasicRemote().sendObject(getNeedHelp());
            }
        }
    }

    private Message getConnectedUsers() {
        Message m = new Message();
        m.setCommand("connectedUsers");
        m.setFrom("Server");
        StringJoiner sj = new StringJoiner(";");
        tutorConnected.forEach((user, messages) -> {
            messages.forEach(msg -> {
                m.setTo(msg.getTo());
                if (!sj.toString().contains(msg.getFrom())) {
                    sj.add(msg.getContent().split(":")[0] + ":" + msg.getContent().split(":")[1]);
                }
            });
        });
        m.setContent(sj.toString());
        return m;
    }

    private Message getNeedHelp() {
        Message m = new Message();
        m.setCommand("needHelp");
        m.setFrom("Server");
        StringJoiner sj = new StringJoiner(";");
        notGettingHelp.forEach((user, messages) -> {
            sj.add(user.getUsername() + ":" + messages.get(0).getContent());
        });
//        m.setContent("empty");
        if (sj.toString().length() > 1) {
            m.setContent(sj.toString());
        }

        return m;
    }

    private List<User> getTutors() {
        List<User> tutore = new ArrayList();
        users.stream().filter((user) -> (user.isTutor())).forEachOrdered((user) -> {
            tutore.add(user);
        });
        return tutore;
    }

    /**
     *
     * @param takes a session object
     * @return a user
     */
    private User findUser(Session session) {
        for (User user : users) {
            if (user.getSession().equals(session)) {
                return user;
            }
        }
        return null;
    }

    /**
     *
     * @param takes a String username
     * @return the user
     */
    private User findUser(String username) {
        for (User user : users) {
            if (user.getUsername().equals(username)) {
                return user;
            }
        }
        return null;
    }

    private Boolean getIsTutor(String username) {
        return tutors.stream().anyMatch((tutor) -> (tutor.equals(username)));
    }

}
