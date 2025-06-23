// types/next.d.ts
import 'next';

declare module 'next' {
  export type PageProps<
    P = Record<string, unknown>,
    Q = Record<string, string | string[] | undefined>
  > = {
    params: P;
    searchParams: Q;
  };
}