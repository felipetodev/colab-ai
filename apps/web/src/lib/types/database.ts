export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          created_at: string
          folder_id: string | null
          id: string
          max_tokens: number
          model: string
          name: string
          prompt: string
          temperature: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          folder_id?: string | null
          id?: string
          max_tokens: number
          model: string
          name: string
          prompt: string
          temperature: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          folder_id?: string | null
          id?: string
          max_tokens?: number
          model?: string
          name?: string
          prompt?: string
          temperature?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'agents_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      chats: {
        Row: {
          folder_id: string | null
          id: string
          max_tokens: number
          messages: Json
          model: string
          name: string
          prompt: string
          temperature: number
          user_id: string
        }
        Insert: {
          folder_id?: string | null
          id?: string
          max_tokens: number
          messages?: Json
          model?: string
          name: string
          prompt?: string
          temperature: number
          user_id: string
        }
        Update: {
          folder_id?: string | null
          id?: string
          max_tokens?: number
          messages?: Json
          model?: string
          name?: string
          prompt?: string
          temperature?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'chats_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      documents: {
        Row: {
          content: Json
          created_at: string
          folder_id: string | null
          id: string
          is_trained: boolean
          name: string
          supabase_embeddings_ids: Json | null
          type: string
          user_id: string | null
        }
        Insert: {
          content: Json
          created_at?: string
          folder_id?: string | null
          id?: string
          is_trained?: boolean
          name: string
          supabase_embeddings_ids?: Json | null
          type: string
          user_id?: string | null
        }
        Update: {
          content?: Json
          created_at?: string
          folder_id?: string | null
          id?: string
          is_trained?: boolean
          name?: string
          supabase_embeddings_ids?: Json | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'documents_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      embeddings: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string
          id: string
          name: string | null
          openai_key: string
          openai_org: string
          pinecone_env: string
          pinecone_index: string
          pinecone_key: string
          supabase_secret_key: string
          supabase_url: string
          user_name: string
          vector_db_selected: string
        }
        Insert: {
          avatar_url: string
          id: string
          name?: string | null
          openai_key?: string
          openai_org?: string
          pinecone_env?: string
          pinecone_index?: string
          pinecone_key?: string
          supabase_secret_key?: string
          supabase_url?: string
          user_name: string
          vector_db_selected?: string | null
        }
        Update: {
          avatar_url?: string
          id?: string
          name?: string | null
          openai_key?: string
          openai_org?: string
          pinecone_env?: string
          pinecone_index?: string
          pinecone_key?: string
          supabase_secret_key?: string
          supabase_url?: string
          user_name?: string
          vector_db_selected?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'users_id_fkey'
            columns: ['id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      hnswhandler: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      match_documents: {
        Args: {
          query_embedding: string
          match_count?: number
          filter?: Json
        }
        Returns: Array<{
          id: number
          content: string
          metadata: Json
          similarity: number
        }>
      }
      vector_avg: {
        Args: {
          '': number[]
        }
        Returns: string
      }
      vector_dims: {
        Args: {
          '': string
        }
        Returns: number
      }
      vector_norm: {
        Args: {
          '': string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          '': string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          '': string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          '': unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
