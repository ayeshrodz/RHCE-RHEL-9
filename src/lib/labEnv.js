// Which practice environment the reader uses. Chosen once (on any exercise)
// and remembered site-wide, so every <Env> block shows the matching commands.
import { useStored } from '@/lib/storage';

export const ENVS = [
  { id: 'classroom', label: 'Red Hat classroom' },
  { id: 'home', label: 'Home lab' },
];

export function useLabEnv() {
  return useStored('labEnv', 'home');
}

/** "lab start control-handlers" -> "control-handlers" */
export function exerciseName(classroom) {
  return classroom ? classroom.trim().split(/\s+/).pop() : null;
}
