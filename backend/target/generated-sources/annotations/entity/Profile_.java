package entity;

import entity.Message;
import javax.annotation.Generated;
import javax.persistence.metamodel.ListAttribute;
import javax.persistence.metamodel.SingularAttribute;
import javax.persistence.metamodel.StaticMetamodel;

@Generated(value="EclipseLink-2.5.2.v20140319-rNA", date="2017-12-12T23:17:37")
@StaticMetamodel(Profile.class)
public class Profile_ { 

    public static volatile SingularAttribute<Profile, String> assignedTutor;
    public static volatile SingularAttribute<Profile, byte[]> buf;
    public static volatile ListAttribute<Profile, Message> messages;
    public static volatile SingularAttribute<Profile, Boolean> soundEnabled;
    public static volatile SingularAttribute<Profile, String> username;
    public static volatile SingularAttribute<Profile, Boolean> tutor;
    public static volatile SingularAttribute<Profile, String> token;

}