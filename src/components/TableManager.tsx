import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';

interface TableManagerProps {
  onClose: () => void;
  onTableCreated: () => void;
}

interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  default: string;
}

export default function TableManager({ onClose, onTableCreated }: TableManagerProps) {
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [columns, setColumns] = useState<ColumnDefinition[]>([
    { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()' },
    { name: 'created_at', type: 'timestamptz', nullable: false, default: 'now()' }
  ]);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_tables');

      if (error) {
        const { data: allTables } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');

        const tableNames = ['categories', 'authors', 'books', 'reviews', 'orders', 'book_authors'];
        setTables(tableNames);
      } else {
        setTables(data || []);
      }
    } catch (error) {
      console.error('Error loading tables:', error);
      setTables(['categories', 'authors', 'books', 'reviews', 'orders', 'book_authors']);
    } finally {
      setLoading(false);
    }
  };

  const addColumn = () => {
    setColumns([...columns, { name: '', type: 'text', nullable: true, default: '' }]);
  };

  const removeColumn = (index: number) => {
    if (index < 2) return;
    setColumns(columns.filter((_, i) => i !== index));
  };

  const updateColumn = (index: number, field: keyof ColumnDefinition, value: any) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setColumns(newColumns);
  };

  const handleCreateTable = async () => {
    if (!newTableName.trim()) {
      alert('Please enter a table name');
      return;
    }

    if (columns.slice(2).some(col => !col.name.trim())) {
      alert('All columns must have a name');
      return;
    }

    setLoading(true);
    try {
      const columnDefinitions = columns.map(col => {
        let def = `${col.name} ${col.type}`;
        if (col.name === 'id') {
          def += ' PRIMARY KEY DEFAULT gen_random_uuid()';
        } else {
          if (!col.nullable) def += ' NOT NULL';
          if (col.default) def += ` DEFAULT ${col.default}`;
        }
        return def;
      }).join(',\n  ');

      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${newTableName} (
          ${columnDefinitions}
        );

        ALTER TABLE ${newTableName} ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Anyone can read ${newTableName}"
          ON ${newTableName} FOR SELECT
          USING (true);

        CREATE POLICY "Authenticated users can insert ${newTableName}"
          ON ${newTableName} FOR INSERT
          TO authenticated
          WITH CHECK (true);

        CREATE POLICY "Authenticated users can update ${newTableName}"
          ON ${newTableName} FOR UPDATE
          TO authenticated
          USING (true)
          WITH CHECK (true);

        CREATE POLICY "Authenticated users can delete ${newTableName}"
          ON ${newTableName} FOR DELETE
          TO authenticated
          USING (true);
      `;

      const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });

      if (error) {
        const alternativeError = await executeRawSQL(createTableSQL);
        if (alternativeError) {
          throw alternativeError;
        }
      }

      setShowCreateForm(false);
      setNewTableName('');
      setColumns([
        { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()' },
        { name: 'created_at', type: 'timestamptz', nullable: false, default: 'now()' }
      ]);
      loadTables();
      onTableCreated();
      alert('Table created successfully!');
    } catch (error) {
      console.error('Error creating table:', error);
      alert('Error creating table. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const executeRawSQL = async (sql: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ sql })
      });

      if (!response.ok) {
        throw new Error('Failed to execute SQL');
      }

      return null;
    } catch (error) {
      return error;
    }
  };

  const handleDeleteTable = async (tableName: string) => {
    if (!confirm(`Are you sure you want to delete the table "${tableName}"? This action cannot be undone!`)) {
      return;
    }

    setLoading(true);
    try {
      const dropTableSQL = `DROP TABLE IF EXISTS ${tableName} CASCADE;`;

      const { error } = await supabase.rpc('exec_sql', { sql: dropTableSQL });

      if (error) {
        const alternativeError = await executeRawSQL(dropTableSQL);
        if (alternativeError) {
          throw alternativeError;
        }
      }

      loadTables();
      onTableCreated();
      alert('Table deleted successfully!');
    } catch (error) {
      console.error('Error deleting table:', error);
      alert('Error deleting table. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Table Manager</h1>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Database Tables</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create New Table
            </button>
          </div>

          {showCreateForm && (
            <div className="mb-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
              <h3 className="text-lg font-semibold mb-4">Create New Table</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table Name
                </label>
                <input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                  placeholder="my_table_name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Columns
                  </label>
                  <button
                    onClick={addColumn}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Column
                  </button>
                </div>

                <div className="space-y-2">
                  {columns.map((col, index) => (
                    <div key={index} className="flex gap-2 items-center bg-white p-2 rounded border">
                      <input
                        type="text"
                        value={col.name}
                        onChange={(e) => updateColumn(index, 'name', e.target.value)}
                        placeholder="column_name"
                        disabled={index < 2}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                      />
                      <select
                        value={col.type}
                        onChange={(e) => updateColumn(index, 'type', e.target.value)}
                        disabled={index < 2}
                        className="px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                      >
                        <option value="text">text</option>
                        <option value="integer">integer</option>
                        <option value="numeric">numeric</option>
                        <option value="boolean">boolean</option>
                        <option value="uuid">uuid</option>
                        <option value="timestamptz">timestamptz</option>
                        <option value="jsonb">jsonb</option>
                      </select>
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={!col.nullable}
                          onChange={(e) => updateColumn(index, 'nullable', !e.target.checked)}
                          disabled={index < 2}
                          className="mr-1"
                        />
                        Required
                      </label>
                      <input
                        type="text"
                        value={col.default}
                        onChange={(e) => updateColumn(index, 'default', e.target.value)}
                        placeholder="default value"
                        disabled={index < 2}
                        className="w-32 px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                      />
                      {index >= 2 && (
                        <button
                          onClick={() => removeColumn(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateTable}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Table'}
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  Note: Creating tables directly through the UI has limitations. For complex schemas with foreign keys and constraints, use migrations instead.
                </p>
              </div>
            </div>
          )}

          {loading && !showCreateForm ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map(table => (
                <div
                  key={table}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{table}</h3>
                      <p className="text-sm text-gray-500 mt-1">Database table</p>
                    </div>
                    <button
                      onClick={() => handleDeleteTable(table)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete table"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
