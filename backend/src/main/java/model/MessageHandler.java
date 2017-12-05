package model;

import entity.Message;
import entity.Profile;
import facade.UserFacade;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import javax.websocket.EncodeException;
import javax.websocket.Session;

/**
 *
 * @author joaci
 */
public class MessageHandler {

    private static final List<Profile> ONLINEPROFILES = new CopyOnWriteArrayList();
    private static final Map<Profile, List<Message>> NOTGETTINGHELP = new ConcurrentHashMap();
    private final UserFacade USERFACADE = new UserFacade("PU");
    private final PushNotifier pushNotifier = new PushNotifier();

    public void addUser(Session session, Profile dbUser) throws EncodeException, IOException {
        dbUser.setSession(session);
        ONLINEPROFILES.add(dbUser);
        for (Message message : dbUser.getMessages()) {
            dbUser.getSession().getBasicRemote().sendObject(message);
        }
        if (dbUser.isTutor()) {
            USERFACADE.getProfiles().forEach(profile -> {
                if (!profile.equals(dbUser) && !profile.getToken().isEmpty()) {
                    pushNotifier.sendTutorNotification(profile.getToken(), profile.getUsername(),dbUser.getUsername());
                }
            });
        }
        sendMessage(getNeedHelp());
    }

    public void disconnectHandler(Session session) throws EncodeException, IOException {
        for (Profile profile : ONLINEPROFILES) {
            if (profile.getAssignedTutor() != null && profile.getAssignedTutor().equals(findUser(session).getUsername())) {
                profile.setAssignedTutor(null);
                NOTGETTINGHELP.put(profile, profile.getMessages());
                profile.getSession().getBasicRemote().sendObject(removeTutor(profile.getUsername()));
            }
        }
        NOTGETTINGHELP.remove(findUser(session));
        ONLINEPROFILES.remove(findUser(session));
        sendMessage(getNeedHelp());
        getConnectedToTutor();
    }

    public void sendFile(byte[] buf, Session s) {
        findUser(s).setBuf(buf);
    }

    public void sendMessage(Message message) throws EncodeException, IOException {
        if (message.getCommand().equals("message") && message.getToProfile() != null) {
            for (Profile user : ONLINEPROFILES) {
                if (user.getUsername().equals(message.getToProfile()) || user.getUsername().equals(message.getFromProfile())) {
                    Profile p = USERFACADE.getProfileById(user.getUsername());
                    p.getMessages().add(message);
                    USERFACADE.updateProfile(p);
                    user.getSession().getBasicRemote().sendObject(message);
                }
            }
        } else if (message.getCommand().equals("webNoti")) {
            Profile p = USERFACADE.getProfileById(message.getFromProfile());
            p.setToken(message.getContent());
            USERFACADE.updateProfile(p);
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
            Profile u = findUser(message.getContent().split(":")[0]);
            for (Message message1 : NOTGETTINGHELP.get(u)) {
                findUser(message.getFromProfile()).getSession().getBasicRemote().sendObject(message1);
            }
            NOTGETTINGHELP.remove(u);
            ONLINEPROFILES.forEach(user -> {
                if (user.getUsername().equals(u.getUsername())) {
                    user.setAssignedTutor(message.getFromProfile());
                }
            });
            sendMessage(getNeedHelp());
            getConnectedToTutor();
            sendMessage(setTutor(message, u));
        } else if (message.getCommand().equals(("setTutor"))) {
            for (Profile user : ONLINEPROFILES) {
                if (user.getUsername().equals(message.getToProfile())) {
                    user.getSession().getBasicRemote().sendObject(message);
                }
            }
        } else if (message.getCommand().equals("connectedUsers")) {
            findUser(message.getToProfile()).getSession().getBasicRemote().sendObject(message);
        } else if (message.getCommand().equals("release")) {
            Profile user = findUser(message.getContent());
            user.setAssignedTutor("");
            updateUser(user);
            sendMessage(removeTutor(user.getUsername()));
            NOTGETTINGHELP.put(user, new ArrayList());
            Message m = new Message();
            m.setContent(message.getFromProfile() + " couldn't resolve issue");
            NOTGETTINGHELP.get(user).add(m);
            getConnectedToTutor();
            sendMessage(getNeedHelp());
        } else if (message.getCommand().equals("needHelp")) {
            if (!message.getFromProfile().equals("Server") && !findUser(message.getFromProfile()).isTutor()) {
                NOTGETTINGHELP.putIfAbsent(findUser(message.getFromProfile()), new ArrayList());
                NOTGETTINGHELP.get(findUser(message.getFromProfile())).add(message);
                message.setToProfile(message.getFromProfile());
                message.setCommand("message");
                sendMessage(message);
            }
            for (Profile tutor : getTutors()) {
                tutor.getSession().getBasicRemote().sendObject(getNeedHelp());
            }
        }
    }

    private Message setTutor(Message message, Profile u) {
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
        NOTGETTINGHELP.forEach((user, messages) -> {
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
        for (Profile tutor : ONLINEPROFILES) {
            if (tutor.isTutor()) {
                StringJoiner sj = new StringJoiner(";");
                m.setToProfile(tutor.getUsername());
                ONLINEPROFILES.forEach(user -> {
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

    private List<Profile> getTutors() {
        List<Profile> tutore = new ArrayList();
        ONLINEPROFILES.stream().filter((user) -> (user.isTutor())).forEachOrdered((user) -> {
            tutore.add(user);
        });
        return tutore;
    }

    private Profile updateUser(Profile user) {
        Profile updatedUser = null;
        for (Profile user1 : ONLINEPROFILES) {
            if (user1.getUsername().equals(user.getUsername())) {
                user1 = user;
            }
            updatedUser = user1;
        }
        return updatedUser;
    }

    private Profile findUser(String username) {
        if (!username.equals("Server")) {
            for (Profile user : ONLINEPROFILES) {
                if (user.getUsername().equals(username)) {
                    return user;
                }
            }
        }
        return null;
    }

    public Profile findUser(Session session) {
        for (Profile user : ONLINEPROFILES) {
            if (user.getSession().equals(session)) {
                return user;
            }
        }
        return null;
    }

    public UserFacade getUserFacade() {
        return USERFACADE;
    }

}
