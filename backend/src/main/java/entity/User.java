package entity;

import javax.websocket.Session;

/**
 *
 * @author joacim
 * Class responsible for the user object.
 */
public class User {

    private Session session;
    private String username;
    private Boolean tutor;
    private String assignedTutor;
    private byte[] buf;

    public byte[] getBuf() {
        return buf;
    }

    public void setBuf(byte[] buf) {
        this.buf = buf;
    }

    public String getAssignedTutor() {
        return assignedTutor;
    }

    public void setAssignedTutor(String assignedTutor) {
        this.assignedTutor = assignedTutor;
    }
    
    public Boolean isTutor() {
        return tutor;
    }

    public void setTutor(Boolean tutor) {
        this.tutor = tutor;
    }

    public Session getSession() {
        return session;
    }

    public void setSession(Session session) {
        this.session = session;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @Override
    public String toString() {
        return "User{" + "session=" + session + ", username=" + username + ", tutor=" + tutor + ", assignedTutor=" + assignedTutor + '}';
    }

    
    
}
