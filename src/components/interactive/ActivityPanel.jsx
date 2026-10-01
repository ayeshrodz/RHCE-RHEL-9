/** Shared card chrome for knowledge checks and browser practice. */
export function ActivityPanel({ title, meta, titleAs: Title = 'p', titleId, className = '', children, ...props }) {
  return (
    <section className={`quiz activity-panel ${className}`} {...props}>
      {title && (
        <header className="quiz-head">
          <Title id={titleId} className="quiz-title">
            {title}
          </Title>
          {meta && <span className="quiz-score">{meta}</span>}
        </header>
      )}
      {children}
    </section>
  );
}

export function ActivityFeedback({ correct, label, children }) {
  return (
    <p role="status" className={`quiz-explain ${correct ? 'is-correct' : 'is-wrong'}`}>
      <strong>{label} </strong>
      {children}
    </p>
  );
}
