import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database, Edit2, Trash2, Plus, Table as TableIcon } from 'lucide-react';
import TableManager from './TableManager';

type TableName = 'categories' | 'authors' | 'books' | 'reviews' | 'orders';

export default function AdminPanel() {
  const [selectedTable, setSelectedTable] = useState<TableName>('categories');
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRow, setEditingRow] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showTableManager, setShowTableManager] = useState(false);

  const tables: TableName[] = ['categories', 'authors', 'books', 'reviews', 'orders'];

  useEffect(() => {
    loadTableData();
  }, [selectedTable]);

  const loadTableData = async () => {
    setLoading(true);
    try {
      const { data: tableData, error } = await supabase
        .from(selectedTable)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading data from table:', selectedTable, error);
        throw error;
      }

      console.log('Loaded data from', selectedTable, ':', tableData);
      setData(tableData || []);
      if (tableData && tableData.length > 0) {
        setColumns(Object.keys(tableData[0]));
      } else {
        const emptyColumns = await getTableColumns(selectedTable);
        setColumns(emptyColumns);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const getTableColumns = async (tableName: string): Promise<string[]> => {
    const columnMap: Record<TableName, string[]> = {
      categories: ['id', 'name', 'description', 'created_at'],
      authors: ['id', 'name', 'bio', 'country', 'created_at'],
      books: ['id', 'title', 'category_id', 'description', 'price', 'stock', 'isbn', 'published_year', 'cover_image', 'created_at'],
      reviews: ['id', 'book_id', 'user_name', 'rating', 'comment', 'created_at'],
      orders: ['id', 'customer_name', 'customer_email', 'book_id', 'quantity', 'total_price', 'status', 'created_at'],
    };
    return columnMap[tableName as TableName] || [];
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const { error } = await supabase
        .from(selectedTable)
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadTableData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error deleting record');
    }
  };

  const handleSave = async (rowData: any) => {
    try {
      const { id, created_at, ...dataToSave } = rowData;

      if (isCreating) {
        const { error } = await supabase
          .from(selectedTable)
          .insert([dataToSave]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(selectedTable)
          .update(dataToSave)
          .eq('id', id);

        if (error) throw error;
      }

      setEditingRow(null);
      setIsCreating(false);
      loadTableData();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving record: ' + (error as any).message);
    }
  };

  const handleCreate = () => {
    const newRow: any = {};
    columns.forEach(col => {
      if (col !== 'id' && col !== 'created_at') {
        newRow[col] = '';
      }
    });
    setEditingRow(newRow);
    setIsCreating(true);
  };

  const renderEditForm = () => {
    if (!editingRow) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">
            {isCreating ? 'Create New Record' : 'Edit Record'}
          </h3>
          <div className="space-y-4">
            {columns
              .filter(col => col !== 'id' && col !== 'created_at')
              .map(col => (
                <div key={col}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {col}
                  </label>
                  <input
                    type="text"
                    value={editingRow[col] || ''}
                    onChange={(e) => setEditingRow({
                      ...editingRow,
                      [col]: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => handleSave(editingRow)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditingRow(null);
                setIsCreating(false);
              }}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (showTableManager) {
    return (
      <TableManager
        onClose={() => setShowTableManager(false)}
        onTableCreated={loadTableData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <button
              onClick={() => setShowTableManager(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              <TableIcon className="w-5 h-5" />
              Manage Tables
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4 px-6 overflow-x-auto">
              {tables.map(table => (
                <button
                  key={table}
                  onClick={() => setSelectedTable(table)}
                  className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    selectedTable === table
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {table.charAt(0).toUpperCase() + table.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedTable.charAt(0).toUpperCase() + selectedTable.slice(1)} Table
              </h2>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add New
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No records found. Click "Add New" to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map(col => (
                        <th
                          key={col}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {col}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        {columns.map(col => (
                          <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {typeof row[col] === 'string' && row[col].length > 50
                              ? row[col].substring(0, 50) + '...'
                              : String(row[col] ?? '')}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setEditingRow(row)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {renderEditForm()}
    </div>
  );
}
