import { createContext, useContext, useMemo } from 'react';

const TeachingContext = createContext({});

/** Page-authored data extends the common interface copy without changing renderers. */
export function TeachingContentProvider({ content, children }) {
  const parent = useContext(TeachingContext);
  const value = useMemo(() => ({ ...parent, ...content }), [parent, content]);
  return <TeachingContext.Provider value={value}>{children}</TeachingContext.Provider>;
}

/** Bind authored data once; interaction state remains in the same reusable component. */
export function defineWidget(name, createRenderer) {
  function AuthoredWidget(props) {
    const copy = useContext(TeachingContext)[name];
    const Renderer = useMemo(() => (copy ? createRenderer(copy) : null), [copy]);
    if (!Renderer) throw new Error(`Missing authored content for ${name}.`);
    return <Renderer {...props} />;
  }
  AuthoredWidget.displayName = name;
  return AuthoredWidget;
}

/** Named values remain code; the surrounding wording belongs to the authored text. */
export function formatCopy(template, values) {
  return template.replace(/\{value(\d+)\}/g, (_, index) => String(values[Number(index)]));
}
