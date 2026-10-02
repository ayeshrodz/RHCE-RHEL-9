import { createContext, useContext } from 'react';

/** The page (chapter + section) currently being rendered. */
export const PageContext = createContext(null);

/** Stable storage namespace for widgets on the current page. */
export function usePageKey() {
  return useContext(PageContext)?.key ?? 'global';
}
