package entity;

import java.util.List;

/**
 * a class that removes the session attribute from the Profile class, 
 * else gson gets caught in a circular reference.
 * @author joacim
 */
public class ProfileJson {

    private String username;
    private List<Message> messages;
    private Boolean tutor;
    private String assignedTutor;
    private byte[] buf;
    private String token;
    
    /**
     * 
     * @param profile takes in a normal profile and converts it to a "ProfileJson"
     * which only difference is the session attribute removed.
     */
    public ProfileJson(Profile profile) {
        this.username=profile.getUsername();
        this.messages = profile.getMessages();
        this.tutor = profile.isTutor();
        this.assignedTutor = profile.getAssignedTutor();
        this.buf = profile.getBuf();
        this.token = profile.getToken();
    }
    
}
