package entity;

import javax.annotation.Generated;
import javax.persistence.metamodel.SingularAttribute;
import javax.persistence.metamodel.StaticMetamodel;

@Generated(value="EclipseLink-2.5.2.v20140319-rNA", date="2017-11-16T23:47:38")
@StaticMetamodel(Message.class)
public class Message_ { 

    public static volatile SingularAttribute<Message, String> toProfile;
    public static volatile SingularAttribute<Message, String> fromProfile;
    public static volatile SingularAttribute<Message, Long> id;
    public static volatile SingularAttribute<Message, String> command;
    public static volatile SingularAttribute<Message, String> content;

}