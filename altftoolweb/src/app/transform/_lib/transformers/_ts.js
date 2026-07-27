/** Shared TypeScript sample for the TypeScript-input converters. */
export const TS_SAMPLE = `export interface User {
  id: number;
  name: string;
  email?: string;
  roles: string[];
  address: {
    city: string;
    postcode: string;
  };
}

export type Status = "active" | "inactive" | "pending";`;

/** A TypeScript sample that contains runnable code (for transpile tools). */
export const TS_CODE_SAMPLE = `interface User {
  id: number;
  name: string;
}

export const greet = (user: User): string => \`Hello, \${user.name}\`;

export const admin: User = { id: 1, name: "Ada" };`;
