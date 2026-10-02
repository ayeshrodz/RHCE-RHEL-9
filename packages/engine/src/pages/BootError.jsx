/** Content is loaded and validated before it is used; a failure shows a plain message. */
export default function BootError({ error }) {
  return (
    <main className="boot-error" role="alert">
      <h1>This page could not load</h1>
      <p>{error.message}</p>
      <p>Check your connection and reload the page.</p>
    </main>
  );
}
