package utilities;

import java.io.IOException;
import java.net.URI;
import javax.faces.lifecycle.ClientWindow;
import javax.websocket.ClientEndpoint;
import javax.websocket.CloseReason;
import javax.websocket.ContainerProvider;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.WebSocketContainer;

/**
 *
 * @author joacim
 */
@ClientEndpoint
public class WebsocketClient {

    private final String uri = "wss://cphbusiness.tk/chat/debug/null";
    private Session session;

    public WebsocketClient() {
        try {
            WebSocketContainer container = ContainerProvider.
                    getWebSocketContainer();
            container.connectToServer(this, new URI(uri));
        } catch (Exception ex) {

        }
    }

    @OnOpen
    public void onOpen(Session session) {
        this.session = session;
        System.out.println(session.getId());
    }

    @OnMessage
    public void onMessage(String message, Session session) {
    }

    public void sendMessage(String message) {
        try {
            session.getBasicRemote().sendText(message);
        } catch (IOException ex) {

        }
    }

}
