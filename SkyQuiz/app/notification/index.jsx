import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router,Link } from 'expo-router'


const Home = () => {
  const [notificationContent, setNotificationContent] = useState(null);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      setNotificationContent(response.notification.request.content);
    });
    return () => subscription.remove();
  }, []);

  return (
    <View>
      <Text>Notification Screen</Text>
      {notificationContent ? (
        <View>
          <Text>Title: {notificationContent.title}</Text>
          <Text>Body: {notificationContent.body}</Text>
        </View>
      ) : (
        <Text>No notification received yet.</Text>
      )}
      <Link href="/test">Home</Link>
    </View>
  );
}

export default Home


