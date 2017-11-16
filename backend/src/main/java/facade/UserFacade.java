package facade;

import entitydb.Message;
import entitydb.Profile;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.RollbackException;

/**
 *
 * @author jvetterlain
 */
public class UserFacade {

    private final EntityManagerFactory EMF;

    public UserFacade(String persistenceUnit) {
        this.EMF = Persistence.createEntityManagerFactory(persistenceUnit);
    }

    public static void main(String[] args) {
        UserFacade u = new UserFacade("PU");
        u.tester();
    }

    public void tester() {
        Profile u = new Profile();
        u.setMessages(new ArrayList());
//        Message m = new Message();
//        m.setCommand("message");
//        m.setContent("Hey");
//        m.setFromProfile("t");
//        m.setToProfile("Joacim");
//        u.getMessages().add(m);
        u.setRank("tutor");
        u.setUsername("t");
        createProfile(u);
//        User u = getUserById("Joacim");
//        u.setMessages(new ArrayList());
//        u.getMessages().add(m);
//        updateUser(u);
//          updateUser(getUserById("joacim"));
//        System.out.println(getUserById("Joacim").getMessages());

    }

    private EntityManager getEntityManager() {
        return EMF.createEntityManager();
    }

    public Profile getProfileById(String profilename) {
        return getEntityManager().find(Profile.class, profilename);
    }

    public List<Profile> getProfiles() {
        return getEntityManager().createQuery("SELECT p FROM Profile p", Profile.class).getResultList();
    }

    public Profile createProfile(Profile profile) {
        EntityManager em = getEntityManager();
        Profile userInDB = null;
        try {
            em.getTransaction().begin();
            em.persist(profile);
            em.getTransaction().commit();
            userInDB = em.find(Profile.class, profile.getUsername());
        } catch (RollbackException r) {
            em.getTransaction().rollback();
        } finally {
            em.close();
        }
        return userInDB;
    }

    public Profile updateProfile(Profile profile) {
        EntityManager em = getEntityManager();
        Profile userInDB = em.find(Profile.class, profile.getUsername());
        try {
            em.getTransaction().begin();
            userInDB = em.merge(profile);
            em.getTransaction().commit();
        } catch (RollbackException r) {
            em.getTransaction().rollback();
        } finally {
            em.close();
        }
        return userInDB;
    }
}
