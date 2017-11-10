package model;

import entity.Message;
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
import javax.websocket.EncodeException;
import javax.websocket.Session;

/**
 *
 * @author joaci
 */
public class MessageHandler {

    private static List<User> users = new CopyOnWriteArrayList();
    private static List<String> tutors = new CopyOnWriteArrayList();
    private static Map<User, List<Message>> notGettingHelp = new ConcurrentHashMap();

    public MessageHandler() {
        //lets fetch this from db in the future
        tutors.add("t");
        tutors.add("t1");
    }

    public void addUser(Session session, String username) throws EncodeException, IOException {
        User user = new User();
        user.setSession(session);
        user.setUsername(username);
        user.setTutor(Boolean.FALSE);
        if (getIsTutor(username)) {
            user.setTutor(Boolean.TRUE);
        }
        users.add(user);
        users.stream().filter((user1) -> (user1.isTutor())).forEach((a) -> {
            try {
                sendMessage(getNeedHelp());
            } catch (EncodeException | IOException ex) {
                Logger.getLogger(MessageHandler.class.getName()).log(Level.SEVERE, null, ex);
            }
        });
    }

    public void disconnectHandler(Session session) throws EncodeException, IOException {
        notGettingHelp.remove(findUser(session));
        users.remove(findUser(session));
        sendMessage(getNeedHelp());
        getConnectedToTutor();
    }

    public void sendMessage(Message message) throws EncodeException, IOException {
        if (message.getCommand().equals("message") && message.getTo() != null) {
            for (User user : users) {
                if (user.getUsername().equals(message.getTo()) || user.getUsername().equals(message.getFrom())) {
                    user.getSession().getBasicRemote().sendObject(message);
                }
            }
        } else if (message.getCommand().equals("take")) {
            User u = findUser(message.getContent().split(":")[0]);
            for (Message message1 : notGettingHelp.get(u)) {
                findUser(message.getFrom()).getSession().getBasicRemote().sendObject(message1);
            }
            notGettingHelp.remove(u);
            users.forEach(user -> {
                if (user.getUsername().equals(u.getUsername())) {
                    user.setAssignedTutor(message.getFrom());
                }
            });
            sendMessage(getNeedHelp());
            getConnectedToTutor();
            sendMessage(setTutor(message, u));
        } else if (message.getCommand().equals(("setTutor"))) {
            for (User user : users) {
                if (user.getUsername().equals(message.getTo())) {
                    user.getSession().getBasicRemote().sendObject(message);
                }
            }
        } else if (message.getCommand().equals("connectedUsers")) {
            findUser(message.getTo()).getSession().getBasicRemote().sendObject(message);
        } else if (message.getTo() == null && (!getIsTutor(message.getFrom())) && message.getFrom() != null) {
            if (findUser(message.getFrom()) != null) {
                notGettingHelp.putIfAbsent(findUser(message.getFrom()), new ArrayList());
                notGettingHelp.get(findUser(message.getFrom())).add(message);
                message.setTo(message.getFrom());
                sendMessage(message);
            }
            for (User tutor : getTutors()) {
                tutor.getSession().getBasicRemote().sendObject(getNeedHelp());
            }
        }
    }

    private void getConnectedToTutor() throws EncodeException, IOException {
        Message m = new Message();
        m.setCommand("connectedUsers");
        m.setFrom("Server");
        for (User tutor : users) {
            if (tutor.isTutor()) {
                StringJoiner sj = new StringJoiner(";");
                m.setTo(tutor.getUsername());
                users.forEach(user -> {
                    if (user.getAssignedTutor() != null) {
                        if (user.getAssignedTutor().equals(tutor.getUsername())) {
                            sj.add(user.getUsername());
                        }
                    }
                });
                m.setContent(sj.toString());
//                if (sj.toString().length() > 0) {
                    sendMessage(m);
//                }
            }
        };
    }

    private Message setTutor(Message message, User u) {
        Message m = new Message();
        m.setFrom("Server");
        m.setCommand("setTutor");
        m.setContent(message.getFrom());
        m.setTo(u.getUsername());
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

    private Boolean getIsTutor(String username) {
        return tutors.stream().anyMatch((tutor) -> (tutor.equals(username)));
    }

    private User findUser(Session session) {
        for (User user : users) {
            if (user.getSession().equals(session)) {
                return user;
            }
        }
        return null;
    }

    private User findUser(String username) {
        for (User user : users) {
            if (user.getUsername().equals(username)) {
                return user;
            }
        }
        return null;
    }

}
