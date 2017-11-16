package model;

import entity.User;
import entitydb.Message;
import entitydb.Profile;
import facade.UserFacade;
import java.io.IOException;
import java.nio.ByteBuffer;
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
    private UserFacade uf;

    public MessageHandler() {
        uf = new UserFacade("PU");
        //lets fetch this from db in the future
        tutors.add("t");
        tutors.add("t1");
    }

    public void addUser(Session session, String username, Profile dbUser) throws EncodeException, IOException {
        User user = new User();
        user.setSession(session);
        user.setUsername(username);
        user.setTutor(Boolean.FALSE);
        if (getIsTutor(username)) {
            user.setTutor(Boolean.TRUE);
        }
        users.add(user);

        for (Message message : dbUser.getMessages()) {
            user.getSession().getBasicRemote().sendObject(message);
        }

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

    public void sendFile(byte[] buf, Session s) {
        findUser(s).setBuf(buf);
    }

    public void sendMessage(Message message) throws EncodeException, IOException {
        if (message.getCommand().equals("message") && message.getToProfile() != null) {
            for (User user : users) {
                if (user.getUsername().equals(message.getToProfile()) || user.getUsername().equals(message.getFromProfile())) {
                    Profile p = uf.getProfileById(user.getUsername());
                    p.getMessages().add(message);
                    uf.updateProfile(p);
                    user.getSession().getBasicRemote().sendObject(message);
                }
            }
        } else if (message.getCommand().equals("file") && message.getToProfile() != null) {
            Message m = new Message();
            m.setToProfile(message.getToProfile());
            m.setFromProfile(message.getFromProfile());
            m.setCommand("file");
            m.setContent(message.getContent());
            findUser(message.getToProfile()).getSession().getBasicRemote().sendBinary(ByteBuffer.wrap(findUser(message.getFromProfile()).getBuf()));
            findUser(message.getToProfile()).getSession().getBasicRemote().sendObject(m);
            findUser(message.getFromProfile()).getSession().getBasicRemote().sendBinary(ByteBuffer.wrap(findUser(message.getFromProfile()).getBuf()));
            m.setToProfile(message.getFromProfile());
            findUser(message.getFromProfile()).getSession().getBasicRemote().sendObject(m);
        } else if (message.getCommand().equals("take")) {
            User u = findUser(message.getContent().split(":")[0]);
            for (Message message1 : notGettingHelp.get(u)) {
                findUser(message.getFromProfile()).getSession().getBasicRemote().sendObject(message1);
            }
            notGettingHelp.remove(u);
            users.forEach(user -> {
                if (user.getUsername().equals(u.getUsername())) {
                    user.setAssignedTutor(message.getFromProfile());
                }
            });
            sendMessage(getNeedHelp());
            getConnectedToTutor();
            sendMessage(setTutor(message, u));
        } else if (message.getCommand().equals(("setTutor"))) {
            for (User user : users) {
                if (user.getUsername().equals(message.getToProfile())) {
                    user.getSession().getBasicRemote().sendObject(message);
                }
            }
        } else if (message.getCommand().equals("connectedUsers")) {
            findUser(message.getToProfile()).getSession().getBasicRemote().sendObject(message);
        } else if (message.getCommand().equals("release")) {
            User user = findUser(message.getContent());
            user.setAssignedTutor("");
            updateUser(user);
            sendMessage(removeTutor(user.getUsername()));
            notGettingHelp.put(user, new ArrayList());
            Message m = new Message();
            m.setContent(message.getFromProfile() + " couldn't resolve issue");
            notGettingHelp.get(user).add(m);
            System.out.println(notGettingHelp);
            getConnectedToTutor();
            sendMessage(getNeedHelp());
        } else if (message.getToProfile() == null && (!getIsTutor(message.getFromProfile())) && message.getFromProfile() != null) {
            if (findUser(message.getFromProfile()) != null) {
                notGettingHelp.putIfAbsent(findUser(message.getFromProfile()), new ArrayList());
                notGettingHelp.get(findUser(message.getFromProfile())).add(message);
                message.setToProfile(message.getFromProfile());
                sendMessage(message);
            }
            for (User tutor : getTutors()) {
                tutor.getSession().getBasicRemote().sendObject(getNeedHelp());
            }
        }
    }

    private Message setTutor(Message message, User u) {
        Message m = new Message();
        m.setFromProfile("Server");
        m.setCommand("setTutor");
        m.setContent(message.getFromProfile());
        m.setToProfile(u.getUsername());
        return m;
    }

    private Message removeTutor(String username) {
        Message m = new Message();
        m.setFromProfile("Server");
        m.setCommand("setTutor");
        m.setContent("");
        m.setToProfile(username);
        return m;
    }

    private Message getNeedHelp() {
        Message m = new Message();
        m.setCommand("needHelp");
        m.setFromProfile("Server");
        StringJoiner sj = new StringJoiner(";");
        notGettingHelp.forEach((user, messages) -> {
            System.out.println(user + " " + messages);
            sj.add(user.getUsername() + ":" + messages.get(0).getContent());
        });
        if (sj.toString().length() > 1) {
            m.setContent(sj.toString());
        }
        return m;
    }

    private void getConnectedToTutor() throws EncodeException, IOException {
        Message m = new Message();
        m.setCommand("connectedUsers");
        m.setFromProfile("Server");
        for (User tutor : users) {
            if (tutor.isTutor()) {
                StringJoiner sj = new StringJoiner(";");
                m.setToProfile(tutor.getUsername());
                users.forEach(user -> {
                    if (user.getAssignedTutor() != null) {
                        if (user.getAssignedTutor().equals(tutor.getUsername())) {
                            sj.add(user.getUsername());
                        }
                    }
                });
                m.setContent(sj.toString());
                sendMessage(m);
            }
        }
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

    public User findUser(Session session) {
        for (User user : users) {
            if (user.getSession().equals(session)) {
                return user;
            }
        }
        return null;
    }

    private User updateUser(User user) {
        User updatedUser = null;
        for (User user1 : users) {
            if (user1.getUsername().equals(user.getUsername())) {
                user1 = user;
            }
            updatedUser = user1;
        }
        return updatedUser;
    }

    private User findUser(String username) {
        for (User user : users) {
            if (user.getUsername().equals(username)) {
                return user;
            }
        }
        return null;
    }
    
    public UserFacade getUserFacade(){
        return uf;
    }

}
