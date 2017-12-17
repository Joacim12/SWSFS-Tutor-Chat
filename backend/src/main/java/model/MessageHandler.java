package model;

import com.google.gson.Gson;
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
 * This class is mainly responsible for getting the message to the correct
 * receiver
 *
 * @author joacim
 */
public class MessageHandler {

    private static final List<Profile> ONLINEPROFILES = new CopyOnWriteArrayList();
    private static final Map<Profile, List<Message>> NOTGETTINGHELP = new ConcurrentHashMap();
    private final UserFacade USERFACADE = new UserFacade("PU");
    private final PushNotifier pushNotifier = new PushNotifier();

    /**
     * Will delegate the message to the relevant method, based on the messages
     * command attribute.
     *
     * @param message the message with the command
     */
    public void handleMessage(Message message) throws IOException, EncodeException {
        switch (message.getCommand()) {
            case "message":
                sendMessage(message);
                break;
            case "webNoti":
                sendWebNotiMessage(message);
                break;
            case "file":
                sendFileMessage(message);
                break;
            case "take":
                sendTakeMessage(message);
                break;
            case "setTutor":
                sendSetTutorMessage(message);
                break;
            case "connectedUsers":
                MessageHandler.this.getUser(message.getToProfile()).getSession().getBasicRemote().sendObject(message);
                break;
            case "release":
                sendReleaseMessage(message);
                break;
            case "needHelp":
                sendNeedHelpMessage(message);
                break;
            case "removeTutor":
                sendRemoveTutorMessage(message);
                break;
            case "getUsers":
                sendGetUsersMessage(message);
                break;
            case "updateUser":
                updateUser(message);
                break;
            case "getTutors":
                sendGetTutors();
                break;
            default:
                System.out.println("something went wrong" + message);
                break;
        }
    }

    /**
     * Will take in a user and add him to the ONLINEPROFILES list. Followed by
     * sending a needHelp message to all tutors. If the user is a tutor, there
     * will be sent a notification to all users with a token, except the user
     * itself that the tutor has come online.
     *
     * @param dbUser is the user that should be added to the list of online
     * profiles
     */
    public void addUser(Profile dbUser) throws EncodeException, IOException {
        ONLINEPROFILES.add(dbUser);
        dbUser.getSession().getBasicRemote().sendObject(dbUser); // Sending the user to the client
        if (dbUser.isTutor()) {
            sendGetTutors();
            USERFACADE.getProfiles().forEach(profile -> {
                if (!profile.equals(dbUser) && profile.getToken() != null) {
                    pushNotifier.sendTutorNotification(profile.getToken(), profile.getUsername(), dbUser.getUsername());
                }
            });
        }
        handleMessage(getNeedHelp());
    }

    /**
     * Finds the user based on the session, and removes the user from
     * ONLINEPROFILES, and NOTGETTINGHELP, followed by sending an update message
     * to tutors with the new list.
     *
     * @param session the user session we want to remove from our system
     */
    public void disconnectHandler(Session session) throws EncodeException, IOException {
        if (ONLINEPROFILES.contains(getUser(session))) {
            for (Profile profile : ONLINEPROFILES) {
                if (profile.isTutor()) {
                    for (Profile profile1 : ONLINEPROFILES) {
                        if (profile1.getAssignedTutor() != null && profile1.getAssignedTutor().equals(profile.getUsername())) {
                            removeTutor(profile1.getUsername());
                        }
                    }
                }
                if (profile.getAssignedTutor() != null && profile.getAssignedTutor().equals(getUser(session).getUsername())) {
                    profile.setAssignedTutor(null);
                    NOTGETTINGHELP.put(profile, profile.getMessages());
                    profile.getSession().getBasicRemote().sendObject(removeTutor(profile.getUsername()));
                }
            }
            NOTGETTINGHELP.remove(getUser(session));
            ONLINEPROFILES.remove(getUser(session));
            handleMessage(getNeedHelp());
            getConnectedToTutor();
        }
    }

    //  The following classes takes in a Message object, and does what the method
    //  is called.
    private void sendMessage(Message message) throws IOException, EncodeException {
        if (message.getToProfile() != null) {
            for (Profile user : ONLINEPROFILES) {
                if (user.getUsername().equals(message.getToProfile()) || user.getUsername().equals(message.getFromProfile())) {
                    Profile p = USERFACADE.getProfileById(user.getUsername());
                    p.getMessages().add(message);
                    USERFACADE.updateProfile(p);
                    user.getSession().getBasicRemote().sendObject(message);
                }
            }
        }
    }

    private void sendWebNotiMessage(Message message) {
        Profile p = USERFACADE.getProfileById(message.getFromProfile());
        p.setToken(message.getContent());
        USERFACADE.updateProfile(p);
    }

    private void sendFileMessage(Message message) throws IOException, EncodeException {
        if (message.getToProfile() != null) {
            Message m = new Message();
            m.setToProfile(message.getToProfile());
            m.setFromProfile(message.getFromProfile());
            m.setCommand("file");
            m.setContent(message.getContent());
            MessageHandler.this.getUser(message.getToProfile()).getSession().getBasicRemote().sendBinary(ByteBuffer.wrap(MessageHandler.this.getUser(message.getFromProfile()).getBuf()));
            MessageHandler.this.getUser(message.getToProfile()).getSession().getBasicRemote().sendObject(m);
            MessageHandler.this.getUser(message.getFromProfile()).getSession().getBasicRemote().sendBinary(ByteBuffer.wrap(MessageHandler.this.getUser(message.getFromProfile()).getBuf()));
            m.setToProfile(message.getFromProfile());
            MessageHandler.this.getUser(message.getFromProfile()).getSession().getBasicRemote().sendObject(m);
        }
    }

    private void sendSetTutorMessage(Message message) throws IOException, EncodeException {
        for (Profile user : ONLINEPROFILES) {
            if (user.getUsername().equals(message.getToProfile())) {
                user.getSession().getBasicRemote().sendObject(message);
            }
        }
    }

    private void sendTakeMessage(Message message) throws IOException, EncodeException {
        Profile profile = MessageHandler.this.getUser(message.getContent().split(":")[0]);
        for (Message message1 : NOTGETTINGHELP.get(profile)) {
            MessageHandler.this.getUser(message.getFromProfile()).getSession().getBasicRemote().sendObject(message1);
        }
        NOTGETTINGHELP.remove(profile);
        ONLINEPROFILES.forEach(user -> {
            if (user.getUsername().equals(profile.getUsername())) {
                user.setAssignedTutor(message.getFromProfile());
            }
        });
        handleMessage(getNeedHelp());
        getConnectedToTutor();
        handleMessage(setTutor(message, profile));
    }

    private void sendReleaseMessage(Message message) throws EncodeException, IOException {
        Profile user = getUser(message.getContent());
        user.setAssignedTutor("");
        updateUser(user);
        handleMessage(removeTutor(user.getUsername()));
        NOTGETTINGHELP.put(user, new ArrayList());
        Message m = new Message();
        m.setContent(message.getFromProfile() + " couldn't resolve issue");
        NOTGETTINGHELP.get(user).add(m);
        getConnectedToTutor();
        handleMessage(getNeedHelp());
    }

    private void sendNeedHelpMessage(Message message) throws EncodeException, IOException {
        if (!message.getFromProfile().equals("Server") && !MessageHandler.this.getUser(message.getFromProfile()).isTutor()) {
            NOTGETTINGHELP.putIfAbsent(MessageHandler.this.getUser(message.getFromProfile()), new ArrayList());
            NOTGETTINGHELP.get(MessageHandler.this.getUser(message.getFromProfile())).add(message);
            message.setToProfile(message.getFromProfile());
            message.setCommand("message");
            handleMessage(message);
        }
        for (Profile tutor : getTutors()) {
            tutor.getSession().getBasicRemote().sendObject(getNeedHelp());
        }
    }

    private void sendRemoveTutorMessage(Message message) throws IOException, EncodeException {
        getUser(message.getToProfile()).getSession().getBasicRemote().sendObject(message);
    }

    private void sendGetUsersMessage(Message message) throws IOException, EncodeException {
        if (getUser(message.getFromProfile()).isTutor()) {
            message.setProfiles(USERFACADE.getProfiles());
            getUser(message.getFromProfile()).getSession().getBasicRemote().sendObject(message);
        }
    }

    private void updateUser(Message message) throws IOException, EncodeException {
        Profile a = new Gson().fromJson(message.getProfile(), Profile.class);
        Profile p = USERFACADE.getProfileById(a.getUsername());
        p.setSoundEnabled(a.isSoundEnabled());
        p.setTutor(a.isTutor());
        if (getUser(a.getUsername()).getSession() == null) {
            USERFACADE.updateProfile(p);
        } else {
            getUser(a.getUsername()).getSession().getBasicRemote().sendObject(USERFACADE.updateProfile(p));
        }
    }

    public void sendGetTutors() throws IOException, EncodeException {
        Message onlineUsers = new Message();
        onlineUsers.setCommand("onlineUsers");
        onlineUsers.setContent(getTutors().size() + "");
        for (Profile profile : ONLINEPROFILES) {
            profile.getSession().getBasicRemote().sendObject(onlineUsers);
        }
    }

    // From here everything is more or less getters and setters
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
        m.setCommand("removeTutor");
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
                handleMessage(m);
            }
        }
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

    private List<Profile> getTutors() {
        List<Profile> tutore = new ArrayList();
        ONLINEPROFILES.stream().filter((user) -> (user.isTutor())).forEachOrdered((user) -> {
            tutore.add(user);
        });
        return tutore;
    }

    private Profile getUser(String username) {
        if (!username.equals("Server")) {
            for (Profile user : ONLINEPROFILES) {
                if (user.getUsername().equals(username)) {
                    return user;
                }
            }
        }
        return null;
    }

    public Profile getUser(Session session) {
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

    public List<Profile> getOnlineProfiles() {
        return ONLINEPROFILES;
    }

}
