export type RootStackParamList = {
  Home: undefined;
  ScanLink: { url?: string } | undefined;
  Consent: { companyId: string; schemaId: string } | undefined;
  DynamicForm: { schemaId: string } | undefined;
  ChatList: undefined;
  ChatRoom: { peerId: string; displayName?: string } | undefined;
  Settings: undefined;
};
