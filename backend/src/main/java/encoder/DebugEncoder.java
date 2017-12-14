package encoder;

import entity.ChatDebugger;
import com.google.gson.Gson;
import javax.websocket.EncodeException;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

/**
 *
 * @author joaci
 */
public class DebugEncoder implements Encoder.Text<ChatDebugger>{

    @Override
    public String encode(ChatDebugger chatDebugger) throws EncodeException {
        return new Gson().toJson(chatDebugger);
    }

    @Override
    public void init(EndpointConfig config) {
    }

    @Override
    public void destroy() {
    }
    
}
