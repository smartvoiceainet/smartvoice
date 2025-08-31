import NextAuth, { DefaultSession } from 'next-auth';
import { UserRole } from '@/models/User';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id. */
      id: string;
      /** User's role for Voice AI access */
      role?: UserRole | string;
      /** Whether user has Voice AI features enabled */
      isVoiceAiEnabled?: boolean;
      /** Whether user has active Voice AI access based on role and enabled status */
      hasVoiceAiAccess?: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** User's id */
    id?: string;
    /** User's role for Voice AI access */
    role?: UserRole | string;
    /** Whether user has Voice AI features enabled */
    isVoiceAiEnabled?: boolean;
  }
}
