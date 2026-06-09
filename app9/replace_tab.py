import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace AdminOltTab with AdminMasterDatasetsTab
pattern = re.compile(r'const AdminOltTab = \(\{ token \}: \{ token: string \}\) => \{.*?\n\};\n', re.DOTALL)

replacement = """const AdminMasterDatasetsTab = ({ token }: { token: string }) => {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [primaryKeyColumn, setPrimaryKeyColumn] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const res = await axios.get(`${API_BASE}/master-datasets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDatasets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !datasetName || !primaryKeyColumn) return;
    
    setLoading(true);
    setMessage('Uploading dataset...');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dataset_name', datasetName);
    formData.append('primary_key_column', primaryKeyColumn);

    try {
      const res = await axios.post(`${API_BASE}/master-datasets`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      setMessage(`Successfully imported ${res.data.importedCount} records.`);
      setFile(null);
      setDatasetName('');
      setPrimaryKeyColumn('');
      fetchDatasets();
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this master dataset? All associated records will be deleted.')) return;
    try {
      await axios.delete(`${API_BASE}/master-datasets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDatasets();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100">
      <div className="w-full">

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-teal-400">Upload New Master Dataset</h2>
          <p className="text-slate-400 text-sm mb-6">Upload a master list (Excel/CSV) to initialize site baseline data. This dataset can be used by multiple survey projects.</p>
          
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Dataset Name</label>
                <input 
                  type="text" 
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  placeholder="e.g. Master OLT 2026"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Primary Key Column (Exact header name)</label>
                <input 
                  type="text" 
                  value={primaryKeyColumn}
                  onChange={(e) => setPrimaryKeyColumn(e.target.value)}
                  placeholder="e.g. IP Address, Asset No, NE_IP"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <label className="border-2 border-dashed border-slate-700 hover:border-teal-500 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-800/50">
              <FileSpreadsheet className="w-10 h-10 text-slate-400 mb-3" />
              <span className="text-sm font-medium text-slate-300">{file ? file.name : 'Select Dataset File (.csv, .xlsx)'}</span>
              <input 
                type="file" 
                accept=".csv, .xlsx, .xls"
                onChange={e => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                  setMessage('');
                }}
                className="hidden" 
                disabled={loading}
                required
              />
            </label>

            <button 
              type="submit" 
              disabled={loading || !file || !datasetName || !primaryKeyColumn}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <><RefreshCw className="w-5 h-5 animate-spin" /> Uploading...</> : <><UploadCloud className="w-5 h-5" /> Import Dataset</>}
            </button>
          </form>
          {message && <div className="mt-4 p-4 bg-slate-800 border border-slate-700 rounded-lg text-teal-400 font-medium text-center">{message}</div>}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Existing Master Datasets</h2>
          
          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <table className="w-full text-sm text-left">
              <thead className="text-slate-400 bg-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Dataset Name</th>
                  <th className="px-4 py-3 font-medium">Primary Key</th>
                  <th className="px-4 py-3 font-medium">Created Date</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {datasets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      No datasets found. Upload one above.
                    </td>
                  </tr>
                ) : (
                  datasets.map(dataset => (
                    <tr key={dataset.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{dataset.dataset_name}</td>
                      <td className="px-4 py-3 text-slate-300"><span className="bg-slate-800 px-2 py-1 rounded text-xs border border-slate-700">{dataset.primary_key_column}</span></td>
                      <td className="px-4 py-3 text-slate-400">{new Date(dataset.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => handleDelete(dataset.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1.5 rounded transition-colors"
                          title="Delete Dataset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
"""

new_content = pattern.sub(replacement, content, count=1)

with open('src/App.tsx', 'w') as f:
    f.write(new_content)

print("Replacement done.")
