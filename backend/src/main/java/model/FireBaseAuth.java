package model;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Class responsible for authenticating users via firebase.
 * @author joacim
 */
public class FireBaseAuth {
    private static final String BASE_URL = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/";
    private String firebaseKey;
    
    /**
     * my api key, you can create your own in the firebase console.
     */
    public FireBaseAuth() {
       firebaseKey = "AIzaSyClmWE8_C1mdd1HHgZpPXCEuk4niJaUNVU";
    }
    
    
    /**
     * 
     * @param token should be a freshly generated token, that a client receives 
     * when succesfully logging into frontend
     * @return the clients email, if the token is valid, else null
     */
    public String validateUser(String token) {
        HttpURLConnection urlRequest = null;
        String email = null;
        try {
            URL url = new URL(BASE_URL+"getAccountInfo?key="+firebaseKey);
            urlRequest = (HttpURLConnection) url.openConnection();
            urlRequest.setDoOutput(true);
            urlRequest.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            OutputStream os = urlRequest.getOutputStream();
            OutputStreamWriter osw = new OutputStreamWriter(os, "UTF-8");
            osw.write("{\"idToken\":\""+token+"\"}");
            osw.flush();
            osw.close();
            urlRequest.connect();
            JsonParser jp = new JsonParser();
            JsonElement root = jp.parse(new InputStreamReader((InputStream) urlRequest.getContent())); 
            JsonObject rootobj = root.getAsJsonObject();
            email = rootobj.get("users").getAsJsonArray().get(0).getAsJsonObject().get("email").getAsString();
        } catch (Exception e) {
            return null;
        } finally {
            urlRequest.disconnect();
        }
        return email;
    }
}
