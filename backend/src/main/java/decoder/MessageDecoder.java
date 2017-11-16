package decoder;

import com.google.gson.Gson;
import entity.Message;

import javax.websocket.DecodeException;
import javax.websocket.Decoder;
import javax.websocket.EndpointConfig;

/**
 * Created jvetterlain
 */
public class MessageDecoder implements Decoder.Text<Message> {

    @Override
    public Message decode(String jsonMessage) throws DecodeException {
        System.setProperty("file.encoding","UTF-8");
        System.out.println(jsonMessage);
        return new Gson().fromJson(jsonMessage, Message.class);
    }

    @Override
    public boolean willDecode(String jsonMessage) {
        return (jsonMessage != null);
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
