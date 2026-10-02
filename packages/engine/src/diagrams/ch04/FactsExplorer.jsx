import DataExplorer from './DataExplorer';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('FactsExplorer', (copy) => {
  function FactsExplorer() {
    return <DataExplorer name="ansible_facts" data={copy.data.sampleFacts} initial={['default_ipv4', 'address']} legacyPrefix="ansible_" />;
  }
  return FactsExplorer;
});
