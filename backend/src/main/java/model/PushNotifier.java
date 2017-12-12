package model;

import com.google.gson.JsonObject;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;

/**
 *
 * @author joaci
 */
public class PushNotifier {
    
    private final static String URL = "https://cphbusiness.tk/";
    

    public void sendTutorNotification(String token, String to,String tutor) {
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpPost httpPost = new HttpPost("https://fcm.googleapis.com/fcm/send");
        httpPost.setHeader("Content-type", "application/json");
        httpPost.setHeader("Authorization", "key=AAAAdJe6NHg:APA91bGtqcE4d0Tpt8yZxdfA30wR7vsvUAHlO4IFJ6C1_UhU1WR-ToW_dOX5gdZPDYSSctWmA3YgYsUJNjEHLEUZ53zDS1qGHkRuiIpQ3mReeFK8nczo9ePDJDpaTxOd-3DVuR5bI1zZ");
        try {
            JsonObject j = new JsonObject();
            j.addProperty("to", token);
            JsonObject notification = new JsonObject();
            notification.addProperty("title", "TutorChat");
            notification.addProperty("body", "Hi " + to + "\n"+tutor+" is online now. \nClick to open TutorChat");
            notification.addProperty("icon", "https://www.vulgaris-medical.com/sites/default/files/styles/big-lightbox/public/field/image/actualites/2016/02/12/le-chat-source-de-bienfaits-pour-votre-sante.jpg"); // no images on server currently
            notification.addProperty("click_action", URL);
            j.add("notification", notification);
            StringEntity stringEntity = new StringEntity(j.toString());
            httpPost.getRequestLine();
            httpPost.setEntity(stringEntity);
            httpClient.execute(httpPost);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }
}
