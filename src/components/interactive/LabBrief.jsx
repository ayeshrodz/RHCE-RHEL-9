import { useEffect, useState } from 'react';

let catalogPromise;
export function loadLabCatalog() {
  return (catalogPromise ??= fetch(`${import.meta.env.BASE_URL}lab/graders.json`)
    .then((response) => {
      if (!response.ok) throw new Error('Lab requirements could not be loaded.');
      return response.json();
    })
    .catch((error) => {
      catalogPromise = undefined;
      throw error;
    }));
}

export default function LabBrief({ name }) {
  const [exercise, setExercise] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    loadLabCatalog()
      .then((catalog) => active && setExercise(catalog.exercises[name]))
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [name]);
  if (error) return <p role="status">{error} Use the task requirements and verification below.</p>;
  if (!exercise) return null;
  return (
    <div className="lab-brief">
      <p>{exercise.brief}</p>
      <details>
        <summary>Prerequisites and verification</summary>
        <ul>
          {exercise.prerequisites.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <p>
          Check results on workstation with <code>lab grade {name}</code>. Checks read project files and host state.
        </p>
        {Object.keys(exercise.checkpoints).length > 1 && (
          <p>
            Intermediate checkpoints:{' '}
            {Object.keys(exercise.checkpoints)
              .filter((c) => c !== 'final')
              .map((c) => (
                <code key={c}>
                  lab grade {name} --checkpoint {c}{' '}
                </code>
              ))}
          </p>
        )}
        {exercise.intentionalFaults && <p>{exercise.intentionalFaults}</p>}
        <p>Run your playbook again and inspect unexpected changes. Reboot explicitly where the task asks you to check persistence.</p>
      </details>
      <details>
        <summary>Independent variation</summary>
        <p>{exercise.variation}</p>
      </details>
    </div>
  );
}
