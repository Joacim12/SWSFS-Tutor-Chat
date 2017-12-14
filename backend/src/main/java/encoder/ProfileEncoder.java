package encoder;

import com.google.gson.Gson;
import entity.Profile;
import javax.websocket.EncodeException;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

/**
 *
 * @author joacim
 */
public class ProfileEncoder  implements Encoder.Text<Profile>{

    @Override
    public String encode(Profile profile) throws EncodeException {
        Profile p = new Profile();
        p.setAssignedTutor(profile.getAssignedTutor());
        p.setBuf(profile.getBuf());
        p.setMessages(profile.getMessages());
        p.setSoundEnabled(profile.isSoundEnabled());
        p.setToken(profile.getToken());
        p.setTutor(profile.isTutor());
        p.setUsername(profile.getUsername());
        return new Gson().toJson(p);
    }

    @Override
    public void init(EndpointConfig config) {
    }

    @Override
    public void destroy() {
    }

}
