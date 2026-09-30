import DataExplorer from '../ch03/DataExplorer';
import { statSample } from './statSample';

/** Browse the structure ansible.builtin.stat returns once it is registered. */
export default function StatExplorer({ name = 'motd' }) {
  return <DataExplorer name={name} data={statSample} initial={['stat', 'exists']} title={`register: ${name}`} />;
}
