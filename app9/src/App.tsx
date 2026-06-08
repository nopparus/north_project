import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Download, CheckCircle, Lock, User, FileSpreadsheet, LogOut, ChevronRight, Settings, Trash2, Search, Edit, Eye, X, ArrowUp, ArrowDown, ArrowUpDown, UploadCloud } from 'lucide-react';

const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const API_BASE = '/app9/api';

const Login = ({ setToken }: { setToken: (t: string) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/login`, { username, password });
      localStorage.setItem('app9_token', res.data.token);
      setToken(res.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-500"></div>
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-teal-500/10 rounded-full">
            <Lock className="w-8 h-8 text-teal-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-white mb-2">Site Survey Pro</h2>
        <p className="text-slate-400 text-center mb-8">Sign in to manage survey projects</p>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm text-center">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow" 
                placeholder="Enter username"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow" 
                placeholder="Enter password"
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
            Sign In
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

const Dashboard = ({ token, setToken }: { token: string, setToken: (t: string) => void }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const navigate = useNavigate();
  const user = parseJwt(token);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('app9_token');
    setToken('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <ClipboardCheck className="w-6 h-6 text-teal-400" />
          </div>
          <h1 className="text-xl font-bold">Site Survey Pro</h1>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <button onClick={() => navigate('/admin')} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
              <Settings className="w-4 h-4" />
              <span>Admin</span>
            </button>
          )}
          <button onClick={handleLogout} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="w-full px-6 mx-auto mt-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full">
          <h2 className="text-lg font-semibold mb-4">Assigned Projects</h2>
          <div className="space-y-3">
            {projects.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No assigned projects found.</p>
              </div>
            ) : (
              projects.map(proj => (
                <div 
                  key={proj.project_id} 
                  onClick={() => navigate(`/project/${proj.project_id}`)}
                  className="border border-slate-800 bg-slate-800/30 p-4 rounded-lg flex items-center justify-between hover:border-teal-500/50 transition-colors group cursor-pointer"
                >
                  <div>
                    <h3 className="font-medium text-white">{proj.project_name}</h3>
                    <p className="text-sm text-slate-400">Created: {new Date(proj.created_at).toLocaleDateString()} | Mode: {proj.display_mode === 'table' ? 'Table' : 'Form'}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-teal-400" />
                </div>
              ))
            )}
          </div>
        </div>
        
      </main>
    </div>
  );
};

// Missing icon fix
const ClipboardCheck = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const AdminOltTab = ({ token }: { token: string }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(100);
  
  const [oltData, setOltData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isEditModal, setIsEditModal] = useState(false);
  const [isViewModal, setIsViewModal] = useState(false);


  useEffect(() => {
    fetchOltData();
  }, [page, limit, search, sortField, sortOrder]);

  useEffect(() => {
    setPageInput(page.toString());
  }, [page]);

  const fetchOltData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/olt-base?page=${page}&limit=${limit}&search=${search}&sortField=${sortField}&sortOrder=${sortOrder}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOltData(res.data.data);
      setTotalItems(res.data.total);
      setTotalPages(Math.ceil(res.data.total / limit));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (ne_ip: string) => {
    if (!confirm(`Are you sure you want to delete ${ne_ip}?`)) return;
    try {
      await axios.delete(`${API_BASE}/olt-base/${ne_ip}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOltData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setLoading(true);
    setMessage('Uploading file...');
    setProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_BASE}/upload-olt-base`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      const jobId = res.data.jobId;
      if (jobId) {
        pollProgress(jobId);
      } else {
        setMessage(res.data.message || 'Data uploaded successfully!');
        setLoading(false);
        setFile(null);
      }
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Upload failed');
      setLoading(false);
    }
  };

  const pollProgress = (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE}/upload-progress/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const job = res.data;
        
        setProgress(job.progress);
        setTotal(job.total || 100);
        
        if (job.status === 'completed') {
          clearInterval(interval);
          setMessage(job.message);
          setLoading(false);
          setFile(null);
          fetchOltData(); // Refresh table
        } else if (job.status === 'error') {
          clearInterval(interval);
          setMessage(`Error: ${job.message}`);
          setLoading(false);
        } else {
          setMessage(job.message || 'Processing...');
        }
      } catch (err) {
        console.error(err);
      }
    }, 1000);
  };

  return (
    <div className="bg-slate-950 text-slate-100">
      <div className="w-full">

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Upload Base OLT Data (CSV/Excel)</h2>
          <p className="text-slate-400 text-sm mb-6">Upload the master OLT list (e.g. OLT_export.csv) to initialize site baseline data. File must contain columns like NE_IP, Operator, Province, etc.</p>
          
          <form onSubmit={handleUpload} className="space-y-4">
            <label className="border-2 border-dashed border-slate-700 hover:border-teal-500 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-800/50">
              <FileSpreadsheet className="w-10 h-10 text-slate-400 mb-3" />
              <span className="text-sm font-medium text-slate-300">{file ? file.name : 'Select OLT_export.csv File'}</span>
              <span className="text-xs text-slate-500 mt-1">.csv, .xlsx, .xls formats accepted</span>
              <input 
                type="file" 
                accept=".csv, .xlsx, .xls"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="hidden" 
                disabled={loading}
                required
              />
            </label>
            
            {loading && progress > 0 && (
              <div className="w-full bg-slate-800 rounded-full h-4 mb-4 border border-slate-700 overflow-hidden relative">
                <div 
                  className="bg-teal-500 h-4 transition-all duration-300 ease-out" 
                  style={{ width: `${(progress / total) * 100}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                  {Math.round((progress / total) * 100)}% ({progress} / {total})
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || !file}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Processing Data...' : 'Upload Base Data'}
              {!loading && <CheckCircle className="w-5 h-5" />}
            </button>
          </form>
          {message && <div className="mt-4 p-4 bg-slate-800 border border-slate-700 rounded-lg text-teal-400 font-medium text-center">{message}</div>}
        </div>

        {/* Data Table Section */}
        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold">Master OLT Data ({totalItems} records)</h2>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <label>Show</label>
                <select 
                  value={limit} 
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="bg-slate-800 border border-slate-700 rounded p-1 text-white focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <label>entries</label>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search IP, Name, Province..." 
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                <tr>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
                    onClick={() => {
                      if (sortField === 'ne_ip') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortField('ne_ip'); setSortOrder('asc'); }
                    }}
                  >
                    <div className="flex items-center gap-1">NE IP {sortField === 'ne_ip' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
                    onClick={() => {
                      if (sortField === 'ne_name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortField('ne_name'); setSortOrder('asc'); }
                    }}
                  >
                    <div className="flex items-center gap-1">Name {sortField === 'ne_name' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
                    onClick={() => {
                      if (sortField === 'province') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortField('province'); setSortOrder('asc'); }
                    }}
                  >
                    <div className="flex items-center gap-1">Province {sortField === 'province' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
                    onClick={() => {
                      if (sortField === 'operator') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortField('operator'); setSortOrder('asc'); }
                    }}
                  >
                    <div className="flex items-center gap-1">Operator {sortField === 'operator' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                  </th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {oltData.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No data found</td></tr>
                ) : (
                  oltData.map((row) => (
                    <tr key={row.ne_ip} className="bg-slate-900 hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-medium text-teal-400">{row.ne_ip}</td>
                      <td className="px-4 py-3 text-slate-300 truncate max-w-[200px]" title={row.ne_name}>{row.ne_name || '-'}</td>
                      <td className="px-4 py-3 text-slate-300">{row.province || '-'}</td>
                      <td className="px-4 py-3 text-slate-300">{row.operator || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => { setSelectedRow(row); setIsViewModal(true); }}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 p-1.5 rounded transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => { setSelectedRow(row); setIsEditModal(true); }}
                            className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 p-1.5 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(row.ne_ip)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1.5 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4 text-sm text-slate-400">
            <div>
              Showing {Math.min((page - 1) * limit + 1, totalItems)} to {Math.min(page * limit, totalItems)} of {totalItems} entries
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                Prev
              </button>
              
              <div className="flex items-center gap-2 px-2">
                <span>Page</span>
                <input 
                  type="number" 
                  value={pageInput}
                  onChange={e => setPageInput(e.target.value)}
                  onBlur={() => {
                    let p = parseInt(pageInput);
                    if (isNaN(p) || p < 1) p = 1;
                    if (p > totalPages) p = totalPages;
                    setPage(p);
                    setPageInput(p.toString());
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      let p = parseInt(pageInput);
                      if (isNaN(p) || p < 1) p = 1;
                      if (p > totalPages) p = totalPages;
                      setPage(p);
                      setPageInput(p.toString());
                    }
                  }}
                  className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-center text-white focus:outline-none focus:border-teal-500"
                />
                <span>of {totalPages}</span>
              </div>

              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {(isViewModal || isEditModal) && selectedRow && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                {isEditModal ? <Edit className="w-5 h-5 text-amber-400" /> : <Eye className="w-5 h-5 text-blue-400" />}
                {isEditModal ? 'Edit OLT Data' : 'View OLT Data'} - {selectedRow.ne_ip}
              </h3>
              <button onClick={() => { setIsViewModal(false); setIsEditModal(false); }} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(selectedRow).filter(k => k !== 'created_at').map(key => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">{key.replace(/_/g, ' ')}</label>
                    {isEditModal ? (
                      <input 
                        type="text" 
                        value={selectedRow[key] || ''} 
                        onChange={(e) => {
                          let val = e.target.value;
                          if (key === 'asset_code') {
                            val = val.replace(/[^0-9]/g, '').slice(0, 15);
                          }
                          setSelectedRow({...selectedRow, [key]: val});
                        }}
                        disabled={key === 'ne_ip'}
                        maxLength={key === 'asset_code' ? 15 : undefined}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    ) : (
                      <div className="bg-slate-800/50 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 min-h-[42px] break-words">
                        {selectedRow[key] || '-'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {isEditModal && (
              <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
                <button 
                  onClick={() => setIsEditModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    try {
                      await axios.put(`${API_BASE}/olt-base/${selectedRow.ne_ip}`, selectedRow, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      setIsEditModal(false);
                      fetchOltData();
                    } catch (err: any) {
                      alert(err.response?.data?.error || 'Update failed');
                    }
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors font-medium"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


const AdminProjectsTab = ({ token }: { token: string }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [step, setStep] = useState(1); // 1: Upload, 2: Schema, 3: Success
  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [ipKey, setIpKey] = useState('');
  const [displayMode, setDisplayMode] = useState('form');
  const [formSchema, setFormSchema] = useState<any[]>([]);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [editSchema, setEditSchema] = useState<any[]>([]);
  const [editDisplayMode, setEditDisplayMode] = useState('form');

  const handleUpdateProject = async () => {
    setLoading(true);
    try {
      await axios.put(`${API_BASE}/projects/${editingProject.project_id}/schema`, {
        formSchema: editSchema.map((f: any) => ({
          name: f.name,
          label: f.label,
          type: f.type,
          options: f.type === 'select' && typeof f.options === 'string' ? f.options.split(',').map((o: string) => o.trim()) : f.options,
          editable: f.editable !== false,
          visible: f.visible !== false,
          isFilter: f.isFilter === true
        })),
        displayMode: editDisplayMode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingProject(null);
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };



  const handleExportProject = async (id: number, name: string) => {
    try {
      const response = await axios.get(`${API_BASE}/projects/${id}/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Survey_${name.replace(/[^a-z0-9]/gi, '_')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      alert('Failed to export project data');
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this project? This will also delete all survey data collected for it.')) return;
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete project');
    } finally {
      setLoading(false);
    }
  };

  const updateEditSchemaField = (index: number, key: string, value: any) => {
    const newSchema = [...editSchema];
    newSchema[index][key] = value;
    setEditSchema(newSchema);
  };
  
  const moveEditSchemaField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newSchema = [...editSchema];
      const temp = newSchema[index - 1];
      newSchema[index - 1] = newSchema[index];
      newSchema[index] = temp;
      setEditSchema(newSchema);
    } else if (direction === 'down' && index < editSchema.length - 1) {
      const newSchema = [...editSchema];
      const temp = newSchema[index + 1];
      newSchema[index + 1] = newSchema[index];
      newSchema[index] = temp;
      setEditSchema(newSchema);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadClick = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post(`${API_BASE}/parse-survey-excel`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      setHeaders(res.data.headers);
      setParsedData(res.data.data);
      setIpKey(res.data.ipKey);
      
      setFormSchema(res.data.headers.map((h: string) => ({
        name: h,
        label: h,
        type: 'text',
        options: '',
        editable: true,
        visible: true,
        isFilter: false
      })));
      setStep(2);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!projectName) return alert('Project name required');
    setLoading(true);
    
    const formattedSchema = formSchema.map(f => ({
      name: f.name,
      label: f.label,
      type: f.type,
      options: f.type === 'select' ? f.options.split(',').map((o: string) => o.trim()) : [],
      editable: f.editable !== false,
      visible: f.visible !== false,
      isFilter: f.isFilter === true
    }));

    try {
      await axios.post(`${API_BASE}/create-survey-project`, {
        projectName,
        displayMode,
        formSchema: formattedSchema,
        data: parsedData,
        ipKey
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStep(3);
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  const updateSchemaField = (index: number, key: string, value: any) => {
    const newSchema = [...formSchema];
    newSchema[index][key] = value;
    setFormSchema(newSchema);
  };
  
  const moveSchemaField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newSchema = [...formSchema];
      const temp = newSchema[index - 1];
      newSchema[index - 1] = newSchema[index];
      newSchema[index] = temp;
      setFormSchema(newSchema);
    } else if (direction === 'down' && index < formSchema.length - 1) {
      const newSchema = [...formSchema];
      const temp = newSchema[index + 1];
      newSchema[index + 1] = newSchema[index];
      newSchema[index] = temp;
      setFormSchema(newSchema);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100">
      <div className="w-full space-y-6">
        
        {editingProject ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-teal-400">Edit Project Settings - {editingProject.project_name}</h2>
              <button onClick={() => setEditingProject(null)} className="text-slate-400 hover:text-white p-2 bg-slate-800 rounded"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">Display Mode for Surveyors</label>
              <select value={editDisplayMode} onChange={e => setEditDisplayMode(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white">
                <option value="form">Form View (Detail by Detail)</option>
                <option value="table">Table View (Excel-like)</option>
              </select>
            </div>
            
            <h3 className="font-semibold text-teal-400 mb-4 text-lg">Edit Form Fields Configuration</h3>
            <div className="space-y-3">
            {editSchema.map((field, i) => (
              <div key={field.name} className="p-4 bg-slate-800/40 border border-slate-700 rounded-lg">
                <div className="flex gap-4 items-start">
                  <div className="flex flex-col gap-1 pt-1">
                    <button onClick={() => moveEditSchemaField(i, 'up')} disabled={i === 0} className="text-slate-500 hover:text-teal-400 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                    <button onClick={() => moveEditSchemaField(i, 'down')} disabled={i === editSchema.length - 1} className="text-slate-500 hover:text-teal-400 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Label (Source: {field.name})</label>
                        <input type="text" value={field.label} onChange={e => updateEditSchemaField(i, 'label', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
                      </div>
                      <div className="w-1/3">
                        <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Input Type</label>
                        <select value={field.type} onChange={e => updateEditSchemaField(i, 'type', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                          <option value="text">Text Box</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="select">Dropdown</option>
                        </select>
                      </div>
                    </div>
                    {field.type === 'select' && (
                      <div>
                        <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Dropdown Options (Comma separated)</label>
                        <input type="text" value={field.options} onChange={e => updateEditSchemaField(i, 'options', e.target.value)} placeholder="Yes, No, N/A" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
                      </div>
                    )}
                    <div className="flex gap-6 mt-2 pt-2 border-t border-slate-700/50">
                       <label className="flex items-center gap-2 cursor-pointer group">
                         <input type="checkbox" checked={field.editable !== false} onChange={e => updateEditSchemaField(i, 'editable', e.target.checked)} className="w-4 h-4 accent-teal-500" />
                         <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Editable by user</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer group">
                         <input type="checkbox" checked={field.visible !== false} onChange={e => updateEditSchemaField(i, 'visible', e.target.checked)} className="w-4 h-4 accent-teal-500" />
                         <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Visible to user</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer group border-l border-slate-700 pl-4">
                         <input type="checkbox" checked={field.isFilter === true} onChange={e => updateEditSchemaField(i, 'isFilter', e.target.checked)} className="w-4 h-4 accent-amber-500" />
                         <span className="text-sm text-amber-500/80 group-hover:text-amber-400 transition-colors">Use as Filter</span>
                       </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
            
            <div className="mt-8 flex gap-4">
              <button onClick={() => setEditingProject(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg py-3 font-medium transition-colors">Cancel Editing</button>
              <button onClick={handleUpdateProject} disabled={loading} className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 text-white font-bold rounded-lg py-3 shadow-lg transition-colors">
                {loading ? 'Saving Changes...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Create Project Block */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><UploadCloud className="w-5 h-5 text-teal-400"/> Create New Project</h2>
              
              {step === 1 && (
                <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
                  <label className="flex-1 w-full border border-dashed border-slate-600 hover:border-teal-500 rounded-lg p-4 flex items-center justify-center gap-3 cursor-pointer transition-colors bg-slate-800/50">
                    <FileSpreadsheet className="w-6 h-6 text-slate-400" />
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-medium text-slate-300">{file ? file.name : 'Select Survey Excel File (.xlsx)'}</span>
                    </div>
                    <input type="file" accept=".xlsx, .xls" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" />
                  </label>
                  <button 
                    onClick={handleUploadClick} disabled={!file || loading}
                    className="w-full sm:w-auto px-8 py-4 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
                  >
                    {loading ? 'Reading...' : 'Start Config'}
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Project Name</label>
                      <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white" placeholder="e.g. Q3 Survey" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Display Mode for Surveyors</label>
                      <select value={displayMode} onChange={e => setDisplayMode(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white">
                        <option value="form">Form View (Detail by Detail)</option>
                        <option value="table">Table View (Excel-like)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-800">
                    <h3 className="font-semibold text-teal-400 mb-4 text-lg">Configure Form Fields ({headers.length})</h3>
                    <div className="space-y-3">
                    {formSchema.map((field, i) => (
                      <div key={field.name} className="p-4 bg-slate-800/40 border border-slate-700 rounded-lg">
                        <div className="flex gap-4 items-start">
                          <div className="flex flex-col gap-1 pt-1">
                            <button onClick={() => moveSchemaField(i, 'up')} disabled={i === 0} className="text-slate-500 hover:text-teal-400 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                            <button onClick={() => moveSchemaField(i, 'down')} disabled={i === formSchema.length - 1} className="text-slate-500 hover:text-teal-400 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Label (Source: {field.name})</label>
                                <input type="text" value={field.label} onChange={e => updateSchemaField(i, 'label', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
                              </div>
                              <div className="w-1/3">
                                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Input Type</label>
                                <select value={field.type} onChange={e => updateSchemaField(i, 'type', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                                  <option value="text">Text Box</option>
                                  <option value="checkbox">Checkbox</option>
                                  <option value="select">Dropdown</option>
                                </select>
                              </div>
                            </div>
                            {field.type === 'select' && (
                              <div>
                                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Dropdown Options (Comma separated)</label>
                                <input type="text" value={field.options} onChange={e => updateSchemaField(i, 'options', e.target.value)} placeholder="Yes, No, N/A" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
                              </div>
                            )}
                            <div className="flex gap-6 mt-2 pt-2 border-t border-slate-700/50">
                               <label className="flex items-center gap-2 cursor-pointer group">
                                 <input type="checkbox" checked={field.editable !== false} onChange={e => updateSchemaField(i, 'editable', e.target.checked)} className="w-4 h-4 accent-teal-500" />
                                 <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Editable by user</span>
                               </label>
                               <label className="flex items-center gap-2 cursor-pointer group">
                                 <input type="checkbox" checked={field.visible !== false} onChange={e => updateSchemaField(i, 'visible', e.target.checked)} className="w-4 h-4 accent-teal-500" />
                                 <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Visible to user</span>
                               </label>
                               <label className="flex items-center gap-2 cursor-pointer group border-l border-slate-700 pl-4">
                                 <input type="checkbox" checked={field.isFilter === true} onChange={e => updateSchemaField(i, 'isFilter', e.target.checked)} className="w-4 h-4 accent-amber-500" />
                                 <span className="text-sm text-amber-500/80 group-hover:text-amber-400 transition-colors">Use as Filter</span>
                               </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                  
                  <div className="mt-8 flex gap-4">
                    <button onClick={() => setStep(1)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-xl py-3 font-medium transition-colors">Back</button>
                    <button onClick={handleCreateProject} disabled={loading || !projectName} className="flex-2 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 text-white font-bold rounded-xl py-3 px-8 shadow-lg transition-colors">
                      {loading ? 'Creating...' : 'Finish & Create Project'}
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-teal-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">Project Created Successfully!</h3>
                  <p className="text-slate-400 mb-8">The project is now active and assigned to surveyors.</p>
                  <button onClick={() => { setStep(1); setFile(null); setProjectName(''); }} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700">Create another project</button>
                </div>
              )}
            </div>

            {/* All Projects Block */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-teal-400"/> Manage Existing Projects</h2>
              <div className="space-y-4">
                {projects.length === 0 && <p className="text-slate-500 text-center py-8">No projects created yet.</p>}
                {projects.map(proj => (
                  <div key={proj.project_id} className="border border-slate-800 bg-slate-800/40 p-5 rounded-xl flex justify-between items-center group hover:bg-slate-800/70 transition-colors">
                    <div>
                      <h3 className="font-bold text-white text-lg">{proj.project_name}</h3>
                      <div className="flex gap-4 text-sm text-slate-400 mt-2">
                        <span>Created: {new Date(proj.created_at).toLocaleDateString()}</span>
                        <span className="uppercase text-teal-500 font-medium tracking-wide border border-teal-500/30 bg-teal-500/10 px-2 rounded">{proj.display_mode}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleExportProject(proj.project_id, proj.project_name)} 
                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors border border-emerald-500/30 flex items-center gap-2 font-medium"
                        title="Export Excel"
                      >
                        <Download className="w-4 h-4" /> Export Excel
                      </button>
                      <button 
                        onClick={() => {
                          const w = window.open(`/app9/project/${proj.project_id}`, '_blank');
                          w?.focus();
                        }} 
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-400 rounded-lg transition-colors border border-slate-700 flex items-center gap-2 font-medium"
                        title="View Data"
                      >
                        <Eye className="w-4 h-4" /> View Data
                      </button>
                      <button 
                        onClick={() => {
                          setEditingProject(proj);
                          setEditSchema(proj.form_schema.map((f: any) => ({...f, options: Array.isArray(f.options) ? f.options.join(', ') : f.options})));
                          setEditDisplayMode(proj.display_mode || 'form');
                        }} 
                        className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg transition-colors border border-amber-500/30 flex items-center gap-2 font-medium"
                        title="Edit Settings"
                      >
                        <Edit className="w-4 h-4" /> Edit Configuration
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(proj.project_id)} 
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/30 flex items-center gap-2 font-medium"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
      </div>
    </div>
  );
};


const AdminPanel = ({ token }: { token: string }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'olt' | 'projects'>('olt');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="w-full mb-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-teal-400" />
            Admin Control Panel
          </h1>
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white flex items-center gap-1">
            <LogOut className="w-4 h-4" /> Exit Admin
          </button>
        </div>
        
        {/* Folder Tab Menu */}
        <div className="flex gap-1 border-b border-slate-800">
          <button 
            onClick={() => setActiveTab('olt')}
            className={`px-6 py-3 font-medium rounded-t-lg transition-colors ${activeTab === 'olt' ? 'bg-slate-900 text-teal-400 border-t-2 border-teal-500' : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            Master OLT Data
          </button>
          <button 
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-3 font-medium rounded-t-lg transition-colors ${activeTab === 'projects' ? 'bg-slate-900 text-teal-400 border-t-2 border-teal-500' : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            Survey Projects Management
          </button>
        </div>
      </div>

      <div className="pt-2">
        {activeTab === 'olt' ? <AdminOltTab token={token} /> : <AdminProjectsTab token={token} />}
      </div>
    </div>
  );
};
const ProjectView = ({ token }: { token: string }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [viewingTask, setViewingTask] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [filters, setFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const fetchProjectAndTasks = async () => {
    try {
      const projRes = await axios.get(`${API_BASE}/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setProject(projRes.data);
      
      const tasksRes = await axios.get(`${API_BASE}/projects/${id}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(tasksRes.data);
    } catch (error) {
      console.error(error);
      alert('Failed to load project details');
      navigate('/');
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setFormData(task.survey_data || {});
  };

  const handleSaveSurvey = async () => {
    try {
      await axios.put(`${API_BASE}/tasks/${selectedTask.task_id}`, 
        { survey_data: formData, status: 'Completed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Survey saved successfully!');
      setSelectedTask(null);
      fetchProjectAndTasks();
    } catch (error) {
      console.error(error);
      alert('Failed to save survey');
    }
  };


  const filteredTasks = tasks.filter(t => {
    return Object.entries(filters).every(([k, v]) => {
      if (!v) return true;
      return t.survey_data?.[k] === v;
    });
  });

  if (!project) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center">
        <div className="flex items-center gap-4 cursor-pointer hover:text-teal-400 transition-colors" onClick={() => navigate('/')}>
          <ChevronRight className="w-5 h-5 text-slate-500 rotate-180" />
          <h1 className="text-xl font-bold">{project.project_name}</h1>
        </div>
      </header>

      <main className="w-full px-6 mx-auto">
        {project.form_schema && project.form_schema.some((f: any) => f.isFilter) && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 shadow-xl flex flex-wrap gap-4 items-center">
            <span className="text-sm font-semibold text-slate-400 flex items-center gap-2"><Search className="w-4 h-4"/> Filters:</span>
            {project.form_schema.filter((f: any) => f.isFilter).map((f: any) => {
              const uniqueVals = Array.from(new Set(tasks.map(t => String(t.survey_data?.[f.name] || '')).filter(Boolean))).sort();
              return (
                <select 
                  key={f.name}
                  value={filters[f.name] || ''}
                  onChange={e => setFilters({...filters, [f.name]: e.target.value})}
                  className="bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm rounded-lg text-white focus:border-amber-500 outline-none"
                >
                  <option value="">All {f.label}</option>
                  {uniqueVals.map((val: any) => <option key={val} value={val}>{val}</option>)}
                </select>
              )
            })}
            {Object.values(filters).some(Boolean) && (
              <button onClick={() => setFilters({})} className="text-xs text-amber-500 hover:text-amber-400 underline ml-2">Clear All</button>
            )}
          </div>
        )}
        {project.display_mode === 'table' ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-[calc(100vh-120px)] overflow-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 sticky left-0">
              <h2 className="text-xl font-semibold text-white">Table View Survey - {project.project_name}</h2>
              <button 
                onClick={async () => {
                  try {
                    await Promise.all(tasks.map(t => axios.put(`${API_BASE}/tasks/${t.task_id}`, { survey_data: t.survey_data, status: 'Completed' }, { headers: { Authorization: `Bearer ${token}` } })));
                    alert('All records saved successfully!');
                    fetchProjectAndTasks();
                  } catch (e) {
                    alert('Failed to save some records');
                  }
                }}
                className="px-6 py-2 bg-teal-500 hover:bg-teal-600 rounded-lg text-white font-medium shadow-lg"
              >
                Save All Records
              </button>
            </div>
            
            <table className="w-full text-sm text-left whitespace-nowrap">
               <thead className="bg-slate-800 text-slate-400">
                 <tr>
                    <th className="px-2 py-2 text-xs uppercase tracking-wider font-medium rounded-tl-lg sticky left-0 z-10 bg-slate-800 w-8"></th>
                    <th className="px-3 py-2 text-xs uppercase tracking-wider font-medium sticky left-8 z-10 bg-slate-800">IP Address</th>
                    <th className="px-3 py-2 text-xs uppercase tracking-wider font-medium">NE Name</th>
                    {project.form_schema && project.form_schema.filter((f: any) => f.visible !== false).map((f: any) => (
                      <th key={f.name} className="px-3 py-2 text-xs uppercase tracking-wider font-medium">{f.label}</th>
                    ))}
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/50">
                 {filteredTasks.map(t => (
                    <tr key={t.task_id} className="hover:bg-slate-800/30 transition-colors">
                       <td className="px-2 py-1 sticky left-0 z-10 bg-slate-900 border-r border-slate-800 text-center">
                         <button onClick={() => setViewingTask(t)} className="text-slate-500 hover:text-teal-400 p-0.5" title="View All Raw Data">
                           <Eye className="w-4 h-4" />
                         </button>
                       </td>
                       <td className="px-3 py-1 font-medium text-teal-400 sticky left-8 z-10 bg-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">{t.ip_address}</td>
                       <td className="px-3 py-1 text-slate-300">{t.ne_name || t.site_name || '-'}</td>
                       {project.form_schema && project.form_schema.filter((f: any) => f.visible !== false).map((f: any) => (
                          <td key={f.name} className="px-3 py-1">
                            {f.editable === false ? (
                              <span className="text-slate-300">
                                {f.type === 'checkbox' ? (t.survey_data?.[f.name] === 'true' ? 'Yes' : 'No') : (t.survey_data?.[f.name] || '-')}
                              </span>
                            ) : f.type === 'select' ? (
                              <select 
                                value={t.survey_data?.[f.name] || ''} 
                                onChange={e => {
                                  const newTasks = [...tasks];
                                  const taskIdx = newTasks.findIndex(x => x.task_id === t.task_id);
                                  newTasks[taskIdx].survey_data = { ...newTasks[taskIdx].survey_data, [f.name]: e.target.value };
                                  setTasks(newTasks);
                                }} 
                                className="bg-slate-800 border border-slate-700 px-2 py-1 text-sm rounded w-32 text-white focus:border-teal-500 outline-none"
                              >
                                <option value="">Select...</option>
                                {f.options?.map((opt: string) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : f.type === 'checkbox' ? (
                              <label className="flex items-center justify-center w-full h-full">
                                <input 
                                  type="checkbox" 
                                  checked={t.survey_data?.[f.name] === 'true'} 
                                  onChange={e => {
                                    const newTasks = [...tasks];
                                    const taskIdx = newTasks.findIndex(x => x.task_id === t.task_id);
                                    newTasks[taskIdx].survey_data = { ...newTasks[taskIdx].survey_data, [f.name]: e.target.checked ? 'true' : 'false' };
                                    setTasks(newTasks);
                                  }} 
                                  className="w-4 h-4 accent-teal-500 rounded bg-slate-800 border-slate-700 cursor-pointer"
                                />
                              </label>
                            ) : (
                              <input 
                                type="text" 
                                value={t.survey_data?.[f.name] || ''} 
                                onChange={e => {
                                  const newTasks = [...tasks];
                                  const taskIdx = newTasks.findIndex(x => x.task_id === t.task_id);
                                  newTasks[taskIdx].survey_data = { ...newTasks[taskIdx].survey_data, [f.name]: e.target.value };
                                  setTasks(newTasks);
                                }} 
                                className="bg-slate-800 border border-slate-700 px-2 py-1 text-sm rounded w-40 text-white focus:border-teal-500 outline-none transition-colors"
                              />
                            )}
                          </td>
                       ))}
                    </tr>
                 ))}
               </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
              <h2 className="text-lg font-semibold mb-4 text-white">Sites to Survey ({filteredTasks.length} / {tasks.length})</h2>
              <div className="space-y-2">
                {filteredTasks.map(task => (
                  <div 
                    key={task.task_id} 
                    onClick={() => handleTaskClick(task)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTask?.task_id === task.task_id 
                        ? 'bg-teal-900/30 border-teal-500 text-teal-100' 
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="font-medium text-white">{task.ip_address}</div>
                    <div className="text-xs text-slate-400 mt-1">{task.ne_name || task.site_name}</div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-300">{task.province || '-'}</span>
                      <span className={`text-xs flex items-center gap-1 ${task.status === 'Completed' ? 'text-teal-400' : 'text-amber-400'}`}>
                        {task.status === 'Completed' ? <CheckCircle className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-amber-400" />}
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              {selectedTask ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[calc(100vh-120px)] overflow-hidden">
                  <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                      Survey Form - {selectedTask.ip_address}
                      <button onClick={() => setViewingTask(selectedTask)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-teal-400 transition-colors" title="View All Raw Data">
                        <Eye className="w-5 h-5" />
                      </button>
                    </h2>
                    <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-white">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-800">
                      <div>
                        <span className="block text-xs text-slate-500 uppercase">NE Name</span>
                        <span className="text-sm text-slate-300">{selectedTask.ne_name || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 uppercase">Province</span>
                        <span className="text-sm text-slate-300">{selectedTask.province || '-'}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {project.form_schema && project.form_schema.filter((f: any) => f.visible !== false).map((field: any) => (
                        <div key={field.name}>
                          <label className="block text-sm font-medium text-slate-400 mb-1">{field.label}</label>
                          {field.editable === false ? (
                            <div className="w-full bg-slate-800/30 border border-transparent rounded-lg px-4 py-2 text-slate-300">
                              {field.type === 'checkbox' ? (formData[field.name] === 'true' ? 'Yes' : 'No') : (formData[field.name] || '-')}
                            </div>
                          ) : field.type === 'select' ? (
                            <select 
                              value={formData[field.name] || ''} 
                              onChange={e => setFormData({...formData, [field.name]: e.target.value})} 
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors"
                            >
                              <option value="">Select...</option>
                              {field.options?.map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : field.type === 'checkbox' ? (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={formData[field.name] === 'true'} 
                                onChange={e => setFormData({...formData, [field.name]: e.target.checked ? 'true' : 'false'})} 
                                className="w-5 h-5 accent-teal-500 rounded bg-slate-800 border-slate-700"
                              />
                              <span className="text-sm text-slate-300">Yes</span>
                            </label>
                          ) : (
                            <input 
                              type="text" 
                              value={formData[field.name] || ''}
                              onChange={e => setFormData({...formData, [field.name]: e.target.value})}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 border-t border-slate-800 shrink-0 flex justify-end">
                    <button 
                      onClick={handleSaveSurvey}
                      className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Save Survey
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-[calc(100vh-120px)] flex flex-col items-center justify-center text-slate-500">
                  <ClipboardCheck className="w-16 h-16 opacity-20 mb-4" />
                  <p>Select a site from the list to start surveying</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {viewingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-6 border-b border-slate-800">
                <h3 className="text-xl font-bold text-teal-400 flex items-center gap-2">
                  <Eye className="w-6 h-6" />
                  All Raw Data: {viewingTask.ip_address}
                </h3>
                <button onClick={() => setViewingTask(null)} className="text-slate-400 hover:text-white p-2 bg-slate-800 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-950/50">
                <div className="grid grid-cols-1 gap-1 border border-slate-800 rounded-lg overflow-hidden bg-slate-900">
                  {Object.entries(viewingTask.survey_data || {}).map(([key, value], i) => (
                    <div key={key} className={`flex ${i % 2 === 0 ? 'bg-slate-800/30' : 'bg-transparent'} hover:bg-slate-800/80 transition-colors`}>
                      <div className="w-1/3 p-3 font-medium text-slate-400 text-sm border-r border-slate-800 truncate" title={key}>{key}</div>
                      <div className="w-2/3 p-3 text-white text-sm break-words">{String(value || '-')}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('app9_token') || '');

  return (
    <BrowserRouter basename="/app9">
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login setToken={setToken} />} />
        <Route path="/admin" element={token ? <AdminPanel token={token} /> : <Navigate to="/login" />} />
        <Route path="/" element={token ? <Dashboard token={token} setToken={setToken} /> : <Navigate to="/login" />} />
        <Route path="/project/:id" element={token ? <ProjectView token={token} /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
