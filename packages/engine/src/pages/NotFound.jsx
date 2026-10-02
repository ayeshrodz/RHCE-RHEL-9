import { Link } from '@/lib/router';

export default function NotFound() {
  return (
    <div className="not-found">
      <p className="page-eyebrow">404</p>
      <h1>That page isn't here</h1>
      <p>It may have moved while the guide was being reorganised.</p>
      <Link className="btn btn-primary" to="/">
        Go to the course overview
      </Link>
    </div>
  );
}
