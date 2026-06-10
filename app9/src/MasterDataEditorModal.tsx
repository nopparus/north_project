import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Trash2, Edit, Check } from 'lucide-react';

import { Pagination } from './components/Pagination';
import { usePagination } from './hooks/usePagination';
import { useDraggableScroll } from './hooks/useDraggableScroll';

const API_BASE = '/app9/api';

export const MasterDataEditorModal = ({ token, dataset, onClose }: { token: string; dataset: any; onClose: () => void }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [schemaConfig, setSchemaConfig] = useState<any[]>(dataset.schema_config || []);
  const [editingColumn, setEditingColumn] = useState<{ oldName: string; newName: string } | null>(null);
  
  const {
    currentPage,
    itemsPerPage,
    totalItems,
    paginatedItems: currentRecords,
    onPageChange,
    onItemsPerPageChange,
  } = usePagination(records, 10);

  const { scrollRef, events: dragEvents, isDragging } = useDraggableScroll();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/master-datasets/${dataset.id}/records`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!window.confirm('Delete this record permanently?')) return;
    try {
      await axios.delete(`${API_BASE}/master-datasets/${dataset.id}/records/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(records.filter(r => r.id !== recordId));
    } catch (err) {
      alert('Failed to delete record');
    }
  };

  const handleUpdateRecord = async (recordId: string, newData: any) => {
    try {
      await axios.put(`${API_BASE}/master-datasets/${dataset.id}/records/${recordId}`, { data: newData }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(records.map(r => r.id === recordId ? { ...r, data: newData } : r));
    } catch (err) {
      alert('Failed to update record');
    }
  };

  const handleRenameColumn = async () => {
    if (!editingColumn || !editingColumn.newName.trim()) return;
    setLoading(true);
    try {
      await axios.put(`${API_BASE}/master-datasets/${dataset.id}/schema`, {
        oldName: editingColumn.oldName,
        newName: editingColumn.newName.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newSchema = schemaConfig.map(c => c.name === editingColumn.oldName ? { ...c, name: editingColumn.newName.trim(), label: editingColumn.newName.trim() } : c);
      setSchemaConfig(newSchema);
      
      const newRecords = records.map(r => {
        const newData = { ...r.data };
        if (newData[editingColumn.oldName] !== undefined) {
          newData[editingColumn.newName.trim()] = newData[editingColumn.oldName];
          delete newData[editingColumn.oldName];
        }
        return { ...r, data: newData };
      });
      setRecords(newRecords);
      
      setEditingColumn(null);
    } catch (err) {
      alert('Failed to rename column');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Edit className="w-5 h-5 text-teal-400" /> 
              Edit Data: {dataset.dataset_name}
            </h2>
            <p className="text-slate-400 text-sm mt-1">{records.length} records • Primary Key: <span className="text-teal-400">{dataset.primary_key_column}</span></p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div 
          ref={scrollRef}
          {...dragEvents}
          className={`flex-1 overflow-auto custom-scrollbar p-6 relative ${isDragging ? 'cursor-grabbing select-none' : 'cursor-auto'}`}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400">Loading records...</div>
          ) : (
            <table className="w-full text-sm text-left border-collapse min-w-max">
              <thead className="sticky top-0 bg-slate-900 z-10 shadow-sm border-b border-slate-800">
                <tr>
                  <th className="px-3 py-3 font-semibold text-slate-300 border-b border-slate-800 w-16 text-center">Actions</th>
                  {schemaConfig.map((col) => (
                    <th key={col.name} className="px-3 py-3 font-semibold text-slate-300 border-b border-slate-800 whitespace-nowrap min-w-[150px] group">
                      {editingColumn?.oldName === col.name ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            className="bg-slate-800 border border-teal-500 rounded px-2 py-1 text-white text-xs w-full"
                            value={editingColumn?.newName || ''}
                            onChange={e => {
                              if (editingColumn) {
                                setEditingColumn({ ...editingColumn, newName: e.target.value });
                              }
                            }}
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && handleRenameColumn()}
                          />
                          <button onClick={handleRenameColumn} className="text-teal-400 hover:text-teal-300"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setEditingColumn(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <span>{col.label} {col.name === dataset.primary_key_column && <span className="text-amber-500 text-xs ml-1">(PK)</span>}</span>
                          <button 
                            onClick={() => setEditingColumn({ oldName: col.name, newName: col.name })}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-teal-400 transition-all rounded hover:bg-slate-800"
                            title="Rename Column"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {currentRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => handleDeleteRecord(record.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors" title="Delete Row">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                    {schemaConfig.map((col) => (
                      <td key={col.name} className="px-3 py-2">
                        <input
                          type="text"
                          value={record.data[col.name] || ''}
                          className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-teal-500 focus:bg-slate-800 focus:outline-none w-full px-2 py-1 text-slate-300 focus:text-white transition-colors"
                          onChange={e => {
                            const newData = { ...record.data, [col.name]: e.target.value };
                            setRecords(records.map(r => r.id === record.id ? { ...r, data: newData } : r));
                          }}
                          onBlur={() => handleUpdateRecord(record.id, record.data)}
                          disabled={col.name === dataset.primary_key_column}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </div>
    </div>
  );
};
