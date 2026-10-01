import { Link } from 'react-router';
import Icon from './Icon.jsx';
import './Breadcrumbs.css';

/** items: [{ name, to }] — the last item is the current page. */
export default function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="crumbs" role="list">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.to}>
              {last ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <>
                  <Link to={item.to}>{item.name}</Link>
                  <Icon name="chevronRight" size={12} />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
