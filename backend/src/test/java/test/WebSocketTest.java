package test;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.logging.Level;
import java.util.logging.Logger;
import model.ChatControl;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;
import utilities.WebsocketClient;

/**
 *
 * @author joacim
 */
public class WebSocketTest {
    
    WebsocketClient client;

    public WebSocketTest() {
        client = new WebsocketClient();
    }

    @BeforeClass
    public static void setUpClass() {

    }

    @AfterClass
    public static void tearDownClass() {
    }

    @Before
    public void setUp() {
    }

    @After
    public void tearDown() {
    }

    @Test
    public void hello() {
//        client.sendMessage("debug client");
    }

}
