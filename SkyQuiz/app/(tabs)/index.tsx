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
Notifications.setNotificationCategoryAsync("welcome", [
  {
    buttonTitle: "b777",
    identifier: "A",
    options: {
      opensAppToForeground: true,
    },
  },

  {
    buttonTitle: "B787",
    identifier: "B",
    options: {
      opensAppToForeground: false,
    },
  },
 {
    buttonTitle: 'Explanation',
    identifier: 'C',
    options: {
      opensAppToForeground: false,
    },

   },
]);

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    [],
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const [isRepeat,setIsRepeat] = useState(false);

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

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
       // console.log("from categories");
       if (response.actionIdentifier === "A") {

        Notifications.dismissAllNotificationsAsync();
//dismissAllNotificationAsync clears notification as soon user clicks on notification in phone
      } else if (response.actionIdentifier === "B") {

       //suppose user want to close the app when interacted with it.
      } else if (response.actionIdentifier === "C") {
       // we can call specific method based on requirement.
       schedulePushNotificationExplanation();
      }
      });



    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
      }}
    >
      <Text>Your expo push token: {expoPushToken}</Text>
      <Text>{`Channels: ${JSON.stringify(
        channels.map((c) => c.id),
        null,
        2,
      )}`}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>
          Title: {notification && notification.request.content.title}{' '}
        </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>
          Data:{' '}
          {notification && JSON.stringify(notification.request.content.data)}
        </Text>
      </View>
      <Button
        title="Press to schedule a notification"
        onPress={async () => {
          await schedulePushNotification();
        }}
      />
      <Button
        title="Cancel All Notifications"
        onPress={async () => {
          await cancelAllNotifications();
        }}
      />
    </View>
  );
}
const cancelAllNotifications = async () => {
  try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All pending notifications have been canceled.');
  } catch (error) {
      console.error('Error canceling notifications:', error);
      }
  };

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Donot repeat",
      body: 'Here is the notification body',
      color: "blue",
      categoryIdentifier: "welcome",
      data: { data: 'goes here', test: { test1: 'more data' } },
    },
    trigger: {
      seconds: 5,
      repeats:false

  },
  });
}
async function schedulePushNotificationExplanation() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Explanation",
      body: 'Here is the Explanation',
      color: "blue",
      data: { data: 'goes here', test: { test1: 'more data' } },
    },
    trigger: {
      seconds: 1,
      repeats:false

  },
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
      console.log(token);
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}
