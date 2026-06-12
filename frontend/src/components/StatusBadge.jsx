export default function StatusBadge({ type, children }) {
  const classMap = {
    success: 'badge badge-success',
    warning: 'badge badge-warning',
    danger: 'badge badge-danger',
    info: 'badge badge-info',
  };

  return <span className={classMap[type] || 'badge badge-info'}>{children}</span>;
}
