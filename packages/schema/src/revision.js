/**
 * A short, stable fingerprint of a question's wording, options and answer.
 * Stored with each answer, so an answer given to an older version of a question
 * is not shown as an answer to the edited one. Part of the contract: the compiler
 * writes it into manifests and the engine computes it for stored answers.
 */
export function questionRevision(question) {
  const text = JSON.stringify([question.q, question.options, question.answer]);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16);
}
