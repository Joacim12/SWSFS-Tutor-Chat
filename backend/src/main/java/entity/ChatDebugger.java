package entity;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author joaci
 */
public class ChatDebugger {
    private List<ProfileJson> profiles;
    private String command;
    private Message message;

    public ChatDebugger() {
    }

    public Message getMessage() {
        return message;
    }

    public void setMessage(Message message) {
        this.message = message;
    }
    
    public String getCommand() {
        return command;
    }

    public void setCommand(String command) {
        this.command = command;
    }

    public List<ProfileJson> getProfiles() {
        return profiles;
    }

    public void setProfiles(List<Profile> profiles) {
        this.profiles = new ArrayList();
        profiles.forEach(profile->{this.profiles.add(new ProfileJson(profile));});
       
    }
    
}
