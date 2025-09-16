import type { LinkingOptions } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import type { RootStackParamList } from './types';
import ChatListScreen from '../screens/ChatListScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import ConsentScreen from '../screens/ConsentScreen';
import DynamicFormScreen from '../screens/DynamicFormScreen';
import HomeScreen from '../screens/HomeScreen';
import ScanLinkScreen from '../screens/ScanLinkScreen';
import SearchScreen from '../screens/SearchScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['lula://'],
  config: {
    screens: {
      Home: 'home',
      Search: 'search',
      ScanLink: 'scan',
      Consent: 'consent',
      DynamicForm: 'form/:schemaId?',
      ChatList: 'chats',
      ChatRoom: 'chat/:peerId',
      Settings: 'settings',
    },
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
        <Stack.Screen name="ScanLink" component={ScanLinkScreen} options={{ title: 'Scan Link' }} />
        <Stack.Screen name="Consent" component={ConsentScreen} />
        <Stack.Screen
          name="DynamicForm"
          component={DynamicFormScreen}
          options={{ title: 'Fill Form' }}
        />
        <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Chats' }} />
        <Stack.Screen
          name="ChatRoom"
          component={ChatRoomScreen}
          options={({ route }) => ({ title: route.params?.displayName ?? 'Chat' })}
        />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
