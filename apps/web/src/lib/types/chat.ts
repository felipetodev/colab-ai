import type { Message} from "ai/react";
import type { Tables } from "./database";

export type Chat = {
  id: Tables<'chats'>['id']
  name: Tables<'chats'>['name']
  messages: Message[]
  folderId: Tables<'chats'>['folder_id']
}
