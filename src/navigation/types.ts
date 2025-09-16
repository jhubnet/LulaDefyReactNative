export type RootStackParamList = {
  Home: undefined;
  ScanLink: { url?: string } | undefined;
  Search: undefined;
  Consent: { token?: string; companyId?: string; schemaId?: string } | undefined;
  DynamicForm: { token?: string; companyId?: string; schemaId?: string } | undefined;
  ChatList: undefined;
  ChatRoom: { peerId: string; displayName?: string } | undefined;
  Settings: undefined;
};
