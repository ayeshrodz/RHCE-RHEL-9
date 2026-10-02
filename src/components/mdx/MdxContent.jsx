import { TeachingContentProvider } from '@/components/interactive/TeachingContent';

/** One MDX boundary for lessons and reference pages, including their widget data. */
export default function MdxContent({ module }) {
  const Content = module.default;
  return (
    <TeachingContentProvider content={module.widgetContent}>
      <Content />
    </TeachingContentProvider>
  );
}
