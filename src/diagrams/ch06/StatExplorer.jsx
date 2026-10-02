import DataExplorer from '../ch04/DataExplorer';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('StatExplorer', (copy) => {
  function StatExplorer({ name = 'motd' }) {
    return (
      <DataExplorer name={name} data={copy.data.statSample} initial={['stat', 'exists']} title={formatCopy(copy.text.template, [name])} />
    );
  }
  return StatExplorer;
});
