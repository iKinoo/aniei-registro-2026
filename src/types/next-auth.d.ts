import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    folioRegistro?: string;
    role?: string;
  }
  interface Session {
    user: DefaultSession['user'] & { folioRegistro?: string; role?: string };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    folioRegistro?: string;
    role?: string;
  }
}
