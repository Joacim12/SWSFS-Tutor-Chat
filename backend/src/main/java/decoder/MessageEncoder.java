package decoder;

import com.google.gson.Gson;

import javax.websocket.EncodeException;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;
import entity.Message;

/**
 * Created by jvetterlain
 */
public class MessageEncoder implements Encoder.Text<Message> {

    @Override
    public String encode(Message message) throws EncodeException {
        return new Gson().toJson(message);
    }

    @Override
    public void init(EndpointConfig endpointConfig) {
        // do nothing
    }

    @Override
    public void destroy() {
        // do nothing
    }
}
