import type { LayoutProps, PageProps } from 'next/app';

declare module 'next' {
  export type PageComponent<P = {}, IP = P> = React.ComponentType<P> & {
    getLayout?: (page: React.ReactElement) => React.ReactNode;
  };
}