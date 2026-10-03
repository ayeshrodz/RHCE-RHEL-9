/** The report contract is program data, derived from typed exercises rather than engine source. */
export function reportCatalog(exercises) {
  return {
    exercises: Object.fromEntries(
      Object.entries(exercises).map(([id, exercise]) => [
        id,
        {
          version: exercise.version,
          lesson: exercise.lesson,
          checkpoints: Object.fromEntries(
            Object.entries(exercise.checkpoints).map(([name, checkpoint]) => {
              const checks = checkpoint.checks ?? [];
              return [
                name,
                {
                  files: checkpoint.files ?? [],
                  groups: Object.fromEntries(Object.keys(checkpoint.groups ?? {}).map((group) => [group, []])),
                  local: checks.filter((check) => check.on === 'control').map(({ id }) => ({ id })),
                  probes: checks.filter((check) => check.on !== 'control').map(({ id, targets }) => ({ id, targets })),
                },
              ];
            }),
          ),
        },
      ]),
    ),
  };
}
