import { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const quiz = [
    {
      question: "What type of avionics suite is used in the Boeing 777?",
      options: [
        { text: "Rockwell Collins", isCorrect: false, id: "a1" },
        { text: "Honeywell", isCorrect: true, id: "a2" },
        { text: "Garmin", isCorrect: false, id: "a3" },
        { text: "Thales", isCorrect: false, id: "a4" },
      ],
      level: "easy",
      systemType: "Avionics and Instrumentation",
      explanation: "The Boeing 777 uses the Honeywell avionics suite, which includes advanced navigation, communication, and flight management systems."
    },
    {
      question: "How many primary flight displays (PFDs) are in the B777 cockpit?",
      options: [
        { text: "1", isCorrect: false, id: "b1" },
        { text: "2", isCorrect: true, id: "b2" },
        { text: "3", isCorrect: false, id: "b3" },
        { text: "4", isCorrect: false, id: "b4" },
      ],
      level: "easy",
      systemType: "Avionics and Instrumentation",
      explanation: "The Boeing 777 cockpit has two Primary Flight Displays (PFDs), providing essential flight information to the pilots."
    },
    {
      question: "What is the purpose of the Integrated Standby Flight Display (ISFD) in the B777?",
      options: [
        { text: "Backup navigation system", isCorrect: false, id: "c1" },
        { text: "Standby attitude indicator", isCorrect: true, id: "c2" },
        { text: "Weather radar display", isCorrect: false, id: "c3" },
        { text: "Flight management system", isCorrect: false, id: "c4" },
      ],
      level: "medium",
      systemType: "Avionics and Instrumentation",
      explanation: "The Integrated Standby Flight Display (ISFD) in the B777 serves as a standby attitude indicator, providing crucial flight attitude information in case of primary display failure."
    },
    {
      question: "Describe the function of the Electronic Flight Instrument System (EFIS) on the B777.",
      options: [
        { text: "Controls autopilot settings", isCorrect: false, id: "d1" },
        { text: "Displays flight data such as altitude and speed", isCorrect: true, id: "d2" },
        { text: "Manages fuel flow", isCorrect: false, id: "d3" },
        { text: "Monitors hydraulic pressure", isCorrect: false, id: "d4" },
      ],
      level: "medium",
      systemType: "Avionics and Instrumentation",
      explanation: "The Electronic Flight Instrument System (EFIS) on the B777 displays essential flight data such as altitude, airspeed, and navigation information to the pilots."
    },
    {
      question: "What is the role of the Engine Indicating and Crew Alerting System (EICAS)?",
      options: [
        { text: "Provides weather updates", isCorrect: false, id: "e1" },
        { text: "Displays engine parameters and alerts crew of system failures", isCorrect: true, id: "e2" },
        { text: "Controls landing gear", isCorrect: false, id: "e3" },
        { text: "Manages cabin lighting", isCorrect: false, id: "e4" },
      ],
      level: "easy",
      systemType: "Avionics and Instrumentation",
      explanation: "The Engine Indicating and Crew Alerting System (EICAS) in the B777 displays engine parameters and alerts the crew of any system failures or abnormalities."
    },
    {
      question: "How many main AC generators are on the Boeing 777, and where are they located?",
      options: [
        { text: "2, in the wings", isCorrect: true, id: "f1" },
        { text: "2, in the engines", isCorrect: false, id: "f2" },
        { text: "3, in the engines", isCorrect: false, id: "f3" },
        { text: "3, in the tail", isCorrect: false, id: "f4" },
      ],
      level: "medium",
      systemType: "Electrical System",
      explanation: "The Boeing 777 has two main AC generators located in the wings, which provide electrical power to various systems onboard the aircraft."
    },
    {
      question: "Explain the function of the Auxiliary Power Unit (APU) in the B777.",
      options: [
        { text: "Provides thrust during takeoff", isCorrect: false, id: "g1" },
        { text: "Supplies electrical power and pneumatic pressure on the ground", isCorrect: true, id: "g2" },
        { text: "Controls flight surfaces", isCorrect: false, id: "g3" },
        { text: "Manages fuel distribution", isCorrect: false, id: "g4" },
      ],
      level: "easy",
      systemType: "Electrical System",
      explanation: "The Auxiliary Power Unit (APU) in the B777 supplies electrical power and pneumatic pressure while the aircraft is on the ground, enhancing its self-sufficiency."
    },
    {
      question: "What types of batteries are used in the B777 electrical system?",
      options: [
        { text: "Nickel-Cadmium", isCorrect: true, id: "h1" },
        { text: "Lead-Acid", isCorrect: false, id: "h2" },
        { text: "Lithium-Ion", isCorrect: false, id: "h3" },
        { text: "Alkaline", isCorrect: false, id: "h4" },
      ],
      level: "medium",
      systemType: "Electrical System",
      explanation: "The B777 electrical system uses Nickel-Cadmium batteries, known for their reliability and performance in aviation applications."
    },
    {
      question: "Describe the purpose of the Backup Electrical System (BES) in the B777.",
      options: [
        { text: "Provides emergency power to critical systems", isCorrect: true, id: "i1" },
        { text: "Powers the entertainment system", isCorrect: false, id: "i2" },
        { text: "Manages cabin pressure", isCorrect: false, id: "i3" },
        { text: "Controls navigation lights", isCorrect: false, id: "i4" },
      ],
      level: "medium",
      systemType: "Electrical System",
      explanation: "The Backup Electrical System (BES) in the B777 provides emergency power to critical systems in case of a main power failure, ensuring continued operation"
}
];
  const [expoPushToken, setExpoPushToken] = useState('');
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    [],
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const [isSendNotification,setIsSendNotification] = useState(true);
  const [quizNo,setQuizNo] = useState(1);



  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => token && setExpoPushToken(token),
    );

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then((value) =>
        setChannels(value ?? []),
      );
    }
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });



    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        );

    };
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(async response => {
      console.log(" addNotificationReceivedListener =  " + isSendNotification);
      if(quizNo < quiz.length-1)
      setQuizNo((prevState) => prevState + 1);
      else
      setQuizNo(0)
      if(isSendNotification)
      schedulePushNotification();
          });

    return () => subscription.remove();
  }, [quizNo,isSendNotification]);


  async function cancelAllNotifications () {
      try {
        await listScheduledNotifications();
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('All pending notifications have been canceled.');
        await listScheduledNotifications();
    } catch (error) {
        console.error('Error canceling notifications:', error);
        }
 };

 const listScheduledNotifications = async () => {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  console.log('Scheduled notifications:', notifications);
};

 async function schedulePushNotification() {


    console.log('schedulePushNotification ' + isSendNotification + quizNo);
      await Notifications.scheduleNotificationAsync({
      content: {
        title: "You've got Quiz! 📬",
        body: quiz[quizNo].question,
        data: { quizOptions: quiz[quizNo].options,  Explanation: quiz[quizNo].explanation  },
      },
      trigger: { seconds: 1 },
    });

  }

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
     // console.log(token);
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
      }}
    >
      <Text>Your expo push token: {expoPushToken}</Text>
      <Text>{`Question #: ${quizNo}`}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text  style={{ backgroundColor: 'orange' }}>
          Title: {notification && notification.request.content.title}{' '}
        </Text>
        <Text style={{ backgroundColor: 'skyblue' }}>Body: {notification && notification.request.content.body}</Text>
        <Text>
          Options:{'   '}
          {notification && JSON.stringify(notification.request.content.data.quizOptions)}
        </Text>

        <Text>
          Explanation:{' '}
          {notification && JSON.stringify(notification.request.content.data.Explanation)}
        </Text>

      </View>
      <Button
        title="Press to schedule a notification"
        onPress={async () => {
          await schedulePushNotification();
        }}
      />
        <Button
        title={isSendNotification? "Stop Notification " + isSendNotification : "Send Notification " + isSendNotification}
        onPress={()=>setIsSendNotification(isSendNotification => !isSendNotification)}
      />
      <Button
        title= "Cancel all notification"
        onPress={async () => {
          await cancelAllNotifications();
        }}
        />
    </View>
  );
}



