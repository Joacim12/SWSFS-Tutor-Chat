package entity;

import java.util.List;

/**
 *
 * @author joacim
 */
public class Admin {
    List<Profile> users;

    public Admin(List<Profile> users) {
        this.users = users;
    }

    public List<Profile> getUsers() {
        return users;
    }

    public void setUsers(List<Profile> users) {
        this.users = users;
    }
    
}
