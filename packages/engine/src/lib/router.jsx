// Routing helpers for a program's pages. A program's pages are addressed relative to the
// program ("/ch03/inventory"); these wrappers add the program's id, so components never
// build a full URL and a program can be mounted under any id.
import { forwardRef } from 'react';
import { Link as RouterLink, NavLink as RouterNavLink, useLocation, useNavigate as useRouterNavigate } from 'react-router-dom';
import { program } from './course';

/** "/ch03/x" → "/rhel9-ansible/ch03/x"; anything not rooted (hashes, objects) is left alone. */
export function programPath(to) {
  return typeof to === 'string' && to.startsWith('/') ? `/${program.id}${to === '/' ? '' : to}` : to;
}

/** The current location with the program prefix removed ("/rhel9-ansible/ch03/x" → "/ch03/x"). */
export function useProgramLocation() {
  const location = useLocation();
  const prefix = `/${program.id}`;
  const pathname = location.pathname.startsWith(prefix) ? location.pathname.slice(prefix.length) || '/' : location.pathname;
  return { ...location, pathname };
}

export const Link = forwardRef(function Link({ to, ...props }, ref) {
  return <RouterLink ref={ref} to={programPath(to)} {...props} />;
});

export const NavLink = forwardRef(function NavLink({ to, ...props }, ref) {
  return <RouterNavLink ref={ref} to={programPath(to)} {...props} />;
});

export function useNavigate() {
  const navigate = useRouterNavigate();
  return (to, options) => navigate(typeof to === 'number' ? to : programPath(to), options);
}
