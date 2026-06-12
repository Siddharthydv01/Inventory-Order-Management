import { Search, Inbox } from 'lucide-react';

export default function DataTable({ columns, data, searchValue, onSearchChange, searchPlaceholder }) {
  return (
    <div>
      {onSearchChange && (
        <div className="search-bar" style={{ marginBottom: 20 }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder={searchPlaceholder || 'Search...'}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ paddingLeft: 42 }}
          />
        </div>
      )}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={col.style}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="empty-state">
                    <Inbox size={48} />
                    <p>No data found</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={row.id || idx}>
                  {columns.map((col) => (
                    <td key={col.key} style={col.cellStyle}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
