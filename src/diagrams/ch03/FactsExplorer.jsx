import DataExplorer from './DataExplorer';
import { sampleFacts } from './sampleFacts';

/** Browse a sample ansible_facts result and see every way to reference a fact. */
export default function FactsExplorer() {
  return <DataExplorer name="ansible_facts" data={sampleFacts} initial={['default_ipv4', 'address']} legacyPrefix="ansible_" />;
}
