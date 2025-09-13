export type RootStackParamList = {
  Home: undefined;
  ScanLink: { url?: string } | undefined;
  Consent: { token: string } | undefined;
  DynamicForm: { token: string } | undefined;
  ChatList: undefined;
  ChatRoom: { peerId: string; displayName?: string } | undefined;
  Settings: undefined;
};
