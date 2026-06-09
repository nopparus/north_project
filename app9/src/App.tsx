import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Download, CheckCircle, Lock, User, UserPlus, FileSpreadsheet, LogOut, ChevronRight, Settings, Trash2, Search, Edit, Eye, X, ArrowUp, ArrowDown, ArrowUpDown, UploadCloud, ImagePlus, FileUp, RefreshCw, AlertCircle, RotateCcw } from 'lucide-react';

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

const compressFile = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        size: file.size,
        type: file.type,
        data: reader.result as string
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

const downloadFile = (fileObj: any) => {
  if (!fileObj || !fileObj.data) return;
  const link = document.createElement('a');
  link.href = fileObj.data;
  link.download = fileObj.name || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const API_BASE = '/app9/api';

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('app9_token');
      window.location.href = '/app9/login';
    }
    return Promise.reject(error);
  }
);

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

const AdminMasterDatasetsTab = ({ token }: { token: string }) => {
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


const AdminProjectsTab = ({ token }: { token: string }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [masterDatasets, setMasterDatasets] = useState<any[]>([]);
  const [selectedMasterDatasetId, setSelectedMasterDatasetId] = useState('');
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
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [deleteInput, setDeleteInput] = useState('');

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

  const handleDeleteProject = async (id: string) => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteConfirm(null);
      setDeleteInput('');
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
    fetchMasterDatasets();
  }, []);

  const fetchMasterDatasets = async () => {
    try {
      const res = await axios.get(`${API_BASE}/master-datasets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMasterDatasets(res.data);
      if (res.data.length > 0) setSelectedMasterDatasetId(res.data[0].id);
    } catch (err) {
      console.error('Failed to fetch master datasets', err);
    }
  };

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
        masterDatasetId: selectedMasterDatasetId,
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
                  <div className="flex flex-col gap-1 pt-1 items-center">
                    <button onClick={() => moveEditSchemaField(i, 'up')} disabled={i === 0} className="text-slate-500 hover:text-teal-400 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                    <button onClick={() => moveEditSchemaField(i, 'down')} disabled={i === editSchema.length - 1} className="text-slate-500 hover:text-teal-400 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                    <button 
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete the field "${field.label}"?`)) {
                          setEditSchema(editSchema.filter((_, idx) => idx !== i));
                        }
                      }}
                      className="text-red-400 hover:text-red-300 mt-2 p-1 hover:bg-red-500/10 rounded transition-colors"
                      title="Delete Field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
                          <option value="image">Image Upload</option>
                          <option value="file">File Upload</option>
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

            <div className="mt-4 flex justify-between items-center bg-slate-900/60 p-4 border border-slate-800 rounded-xl">
              <div>
                <h4 className="text-sm font-semibold text-slate-300">สำรวจเพิ่มเติม (เพิ่มคอลัมน์เก็บข้อมูล)</h4>
                <p className="text-xs text-slate-500">คุณสามารถเพิ่มฟิลด์รูปภาพ, ไฟล์ หรือข้อมูลอื่นในการสำรวจได้</p>
              </div>
              <button 
                onClick={() => {
                  const newField = {
                    name: `custom_field_${Date.now()}`,
                    label: `ข้อมูลเพิ่มเติม ${editSchema.length + 1}`,
                    type: 'text',
                    options: '',
                    editable: true,
                    visible: true,
                    isFilter: false
                  };
                  setEditSchema([...editSchema, newField]);
                }}
                className="px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-lg text-sm font-medium transition-colors"
              >
                + เพิ่มฟิลด์ใหม่ (Add Field)
              </button>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Project Name</label>
                      <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white" placeholder="e.g. Q3 Survey" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Source Master Dataset</label>
                      <select value={selectedMasterDatasetId} onChange={e => setSelectedMasterDatasetId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white">
                        <option value="">-- None (Standalone) --</option>
                        {masterDatasets.map(md => (
                          <option key={md.id} value={md.id}>{md.dataset_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Display Mode for Surveyors</label>
                      <select value={displayMode} onChange={e => setDisplayMode(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white">
                        <option value="form">Form View</option>
                        <option value="table">Table View</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-800">
                    <h3 className="font-semibold text-teal-400 mb-4 text-lg">Configure Form Fields ({headers.length})</h3>
                    <div className="space-y-3">
                    {formSchema.map((field, i) => (
                      <div key={field.name} className="p-4 bg-slate-800/40 border border-slate-700 rounded-lg">
                        <div className="flex gap-4 items-start">
                          <div className="flex flex-col gap-1 pt-1 items-center">
                            <button onClick={() => moveSchemaField(i, 'up')} disabled={i === 0} className="text-slate-500 hover:text-teal-400 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                            <button onClick={() => moveSchemaField(i, 'down')} disabled={i === formSchema.length - 1} className="text-slate-500 hover:text-teal-400 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                            <button 
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete the field "${field.label}"?`)) {
                                  setFormSchema(formSchema.filter((_, idx) => idx !== i));
                                }
                              }}
                              className="text-red-400 hover:text-red-300 mt-2 p-1 hover:bg-red-500/10 rounded transition-colors"
                              title="Delete Field"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
                                  <option value="image">Image Upload</option>
                                  <option value="file">File Upload</option>
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

                    <div className="mt-4 flex justify-between items-center bg-slate-900/60 p-4 border border-slate-800 rounded-xl">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-300">สำรวจเพิ่มเติม (เพิ่มคอลัมน์เก็บข้อมูล)</h4>
                        <p className="text-xs text-slate-500">คุณสามารถเพิ่มฟิลด์รูปภาพ, ไฟล์ หรือข้อมูลอื่นในการสำรวจได้</p>
                      </div>
                      <button 
                        onClick={() => {
                          const newField = {
                            name: `custom_field_${Date.now()}`,
                            label: `ข้อมูลเพิ่มเติม ${formSchema.length + 1}`,
                            type: 'text',
                            options: '',
                            editable: true,
                            visible: true,
                            isFilter: false
                          };
                          setFormSchema([...formSchema, newField]);
                        }}
                        className="px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-lg text-sm font-medium transition-colors"
                      >
                        + เพิ่มฟิลด์ใหม่ (Add Field)
                      </button>
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
                      <div className="flex gap-4 text-sm text-slate-400 mt-2 items-center">
                        <span>Created: {new Date(proj.created_at).toLocaleDateString()}</span>
                        <span className="uppercase text-teal-500 font-medium tracking-wide border border-teal-500/30 bg-teal-500/10 px-2 rounded text-xs">{proj.display_mode}</span>
                        <span className="text-amber-400 border border-amber-500/30 bg-amber-500/10 px-2 rounded text-xs">
                          Data Source: {proj.master_dataset_name || 'Standalone'}
                        </span>
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
                        onClick={() => { setDeleteConfirm({ id: proj.project_id, name: proj.project_name }); setDeleteInput(''); }} 
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white">ยืนยันการลบโปรเจกต์ (Confirm Delete)</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                คุณกำลังจะลบโปรเจกต์ <span className="font-bold text-red-400">"{deleteConfirm.name}"</span> และข้อมูลสำรวจทั้งหมดที่เกี่ยวข้อง การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
              <p className="text-sm text-slate-400">
                กรุณาพิมพ์ <span className="font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">Delete</span> เพื่อยืนยัน
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="พิมพ์ Delete ที่นี่..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 text-sm"
                autoFocus
              />
            </div>
            <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => { setDeleteConfirm(null); setDeleteInput(''); }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700"
              >
                ยกเลิก (Cancel)
              </button>
              <button
                onClick={() => handleDeleteProject(deleteConfirm.id)}
                disabled={deleteInput !== 'Delete' || loading}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  deleteInput === 'Delete' && !loading
                    ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-lg shadow-red-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {loading ? 'กำลังลบ...' : 'ลบโปรเจกต์ (Delete)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const AdminConfigTab = ({ token }: { token: string }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isCreateModal, setIsCreateModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !role) return;
    setLoading(true);
    setMessage('');
    try {
      await axios.post(`${API_BASE}/users`, { username, password, role }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('User created successfully');
      setUsername('');
      setPassword('');
      setRole('user');
      setIsCreateModal(false);
      fetchUsers();
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsername || !editRole || !editingUser) return;
    setLoading(true);
    setMessage('');
    try {
      await axios.put(`${API_BASE}/users/${editingUser.id}`, {
        username: editUsername,
        password: editPassword || undefined,
        role: editRole
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('User updated successfully');
      setEditingUser(null);
      setEditUsername('');
      setEditPassword('');
      setEditRole('user');
      fetchUsers();
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user "${name}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-teal-400" /> User Management
            </h2>
            <p className="text-slate-400 text-sm mt-1">Manage user accounts and set their system access levels (Roles).</p>
          </div>
          <button 
            onClick={() => setIsCreateModal(true)}
            className="bg-teal-500 hover:bg-teal-600 text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <UserPlus className="w-4 h-4" /> Create User
          </button>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-slate-800 border border-slate-700 rounded-lg text-teal-400 font-medium text-sm text-center">
            {message}
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
              <tr>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Role / Permissions</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {users.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No users found</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="bg-slate-900 hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium text-white">{u.username}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        u.role === 'admin' 
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                          : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                      }`}>
                        {u.role === 'admin' ? 'Administrator' : 'Surveyor'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setEditingUser(u);
                            setEditUsername(u.username);
                            setEditRole(u.role);
                            setEditPassword('');
                          }}
                          className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 p-1.5 rounded transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1.5 rounded transition-colors"
                          title="Delete User"
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
      </div>

      {/* Create User Modal */}
      {isCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-md flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-500"></div>
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-400" /> Create New User
              </h3>
              <button onClick={() => setIsCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Role / Permissions</label>
                  <select 
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="user">Surveyor (Read/Write Tasks)</option>
                    <option value="admin">Administrator (Full Access)</option>
                  </select>
                </div>
              </div>
              <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
                <button 
                  type="button"
                  onClick={() => setIsCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors font-medium"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-md flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-400" /> Edit User - {editingUser.username}
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                  <input 
                    type="text" 
                    value={editUsername}
                    onChange={e => setEditUsername(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500" 
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">New Password (Leave blank to keep current)</label>
                  <input 
                    type="password" 
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500" 
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Role / Permissions</label>
                  <select 
                    value={editRole}
                    onChange={e => setEditRole(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="user">Surveyor (Read/Write Tasks)</option>
                    <option value="admin">Administrator (Full Access)</option>
                  </select>
                </div>
              </div>
              <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
                <button 
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors font-medium"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


const AdminPanel = ({ token }: { token: string }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'olt' | 'projects' | 'config'>('olt');

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
            Master Datasets
          </button>
          <button 
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-3 font-medium rounded-t-lg transition-colors ${activeTab === 'projects' ? 'bg-slate-900 text-teal-400 border-t-2 border-teal-500' : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            Survey Projects Management
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`px-6 py-3 font-medium rounded-t-lg transition-colors ${activeTab === 'config' ? 'bg-slate-900 text-teal-400 border-t-2 border-teal-500' : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            System Settings
          </button>
        </div>
      </div>

      <div className="pt-2">
        {activeTab === 'olt' && <AdminMasterDatasetsTab token={token} />}
        {activeTab === 'projects' && <AdminProjectsTab token={token} />}
        {activeTab === 'config' && <AdminConfigTab token={token} />}
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [allSites, setAllSites] = useState<any[]>([]);
  const [targetSite, setTargetSite] = useState<any>(null);
  const [relocatingTask, setRelocatingTask] = useState<any>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 opacity-40 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-teal-400" />
      : <ArrowDown className="w-3.5 h-3.5 text-teal-400" />;
  };

  const handleRevertRelocation = async (taskId: number) => {
    if (!window.confirm('คุณต้องการยกเลิกการย้ายไซต์กลับเป็น IP ดั้งเดิมและคืนค่าข้อมูลใช่หรือไม่? (Are you sure you want to undo this site relocation?)')) return;
    try {
      await axios.post(`${API_BASE}/tasks/${taskId}/revert-site`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const tasksRes = await axios.get(`${API_BASE}/projects/${id}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
      const updatedTasks = tasksRes.data;
      setTasks(updatedTasks);

      if (selectedTask && (selectedTask.task_id === taskId || selectedTask.survey_data?.['ย้ายมาจาก IP'])) {
        const updatedTask = updatedTasks.find((t: any) => t.task_id === taskId) || updatedTasks.find((t: any) => t.task_id === selectedTask.task_id);
        if (updatedTask) {
          setSelectedTask(updatedTask);
          setFormData(updatedTask.survey_data || {});
        }
      }
      alert('Relocation reverted successfully!');
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error || 'Failed to revert relocation');
    }
  };

  useEffect(() => {
    fetchProjectAndTasks();
    fetchSitesLookup();
  }, [id]);

  const fetchSitesLookup = async () => {
    try {
      const res = await axios.get(`${API_BASE}/sites-lookup`, { headers: { Authorization: `Bearer ${token}` } });
      setAllSites(res.data);
    } catch (err) {
      console.error(err);
    }
  };

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
      const completed = formData['ดำเนินการ แล้วเสร็จ'] !== undefined
        ? (formData['ดำเนินการ แล้วเสร็จ'] === 'true' || formData['ดำเนินการ แล้วเสร็จ'] === true)
        : true;
      await axios.put(`${API_BASE}/tasks/${selectedTask.task_id}`, 
        { survey_data: formData, status: completed ? 'Completed' : 'Pending' },
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

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!sortField) return 0;

    let valA: any = '';
    let valB: any = '';

    if (sortField === 'ip_address') {
      valA = a.ip_address || '';
      valB = b.ip_address || '';
    } else if (sortField === 'ne_name') {
      valA = a.ne_name || a.site_name || '';
      valB = b.ne_name || b.site_name || '';
    } else {
      valA = a.survey_data?.[sortField] || '';
      valB = b.survey_data?.[sortField] || '';
    }

    const isNumA = !isNaN(Number(valA)) && valA !== '';
    const isNumB = !isNaN(Number(valB)) && valB !== '';

    if (isNumA && isNumB) {
      return sortOrder === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
    }

    return sortOrder === 'asc'
      ? String(valA).localeCompare(String(valB), 'th', { sensitivity: 'base' })
      : String(valB).localeCompare(String(valA), 'th', { sensitivity: 'base' });
  });

  const isTaskCompleted = (t: any) => {
    if (t.survey_data && t.survey_data['ดำเนินการ แล้วเสร็จ'] !== undefined) {
      return t.survey_data['ดำเนินการ แล้วเสร็จ'] === 'true' || t.survey_data['ดำเนินการ แล้วเสร็จ'] === true;
    }
    return t.status === 'Completed';
  };

  const totalCount = filteredTasks.length;
  const completedCount = filteredTasks.filter(isTaskCompleted).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-4 items-center">
            {project.form_schema && project.form_schema.some((f: any) => f.isFilter) && (
              <>
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
              </> 
            )}
          </div>

          {/* Progress Bar (Far Right) */}
          <div className="flex items-center gap-3 w-full md:w-auto ml-auto border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
            <div className="text-left md:text-right">
              <span className="text-xs text-slate-400 block font-medium">ความคืบหน้า ({completedCount}/{totalCount})</span>
              <span className="text-sm font-bold text-teal-400">{progressPercent}%</span>
            </div>
            <div className="w-48 bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
              <div 
                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
        {project.display_mode === 'table' ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-[calc(100vh-120px)] overflow-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 sticky left-0">
              <h2 className="text-xl font-semibold text-white">Table View Survey - {project.project_name}</h2>
              <button 
                onClick={async () => {
                  try {
                    await Promise.all(tasks.map(t => {
                      const completed = isTaskCompleted(t);
                      return axios.put(`${API_BASE}/tasks/${t.task_id}`, {
                        survey_data: t.survey_data,
                        status: completed ? 'Completed' : 'Pending'
                      }, { headers: { Authorization: `Bearer ${token}` } });
                    }));
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
                    <th 
                      onClick={() => handleSort('ip_address')}
                      className="px-3 py-2 text-xs uppercase tracking-wider font-medium sticky left-8 z-10 bg-slate-800 cursor-pointer hover:bg-slate-700 transition-colors select-none group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>IP Address</span>
                        {renderSortIndicator('ip_address')}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('ne_name')}
                      className="px-3 py-2 text-xs uppercase tracking-wider font-medium cursor-pointer hover:bg-slate-700 transition-colors select-none group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>NE Name</span>
                        {renderSortIndicator('ne_name')}
                      </div>
                    </th>
                    {project.form_schema && project.form_schema.filter((f: any) => f.visible !== false).map((f: any) => (
                      <th 
                        key={f.name}
                        onClick={() => handleSort(f.name)}
                        className="px-3 py-2 text-xs uppercase tracking-wider font-medium cursor-pointer hover:bg-slate-700 transition-colors select-none group"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{f.label}</span>
                          {renderSortIndicator(f.name)}
                        </div>
                      </th>
                    ))}
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/50">
                 {sortedTasks.map(t => (
                    <tr key={t.task_id} className="hover:bg-slate-800/30 transition-colors">
                       <td className="px-2 py-1 sticky left-0 z-10 bg-slate-900 border-r border-slate-800 text-center">
                         <button onClick={() => setViewingTask(t)} className="text-slate-500 hover:text-teal-400 p-0.5" title="View All Raw Data">
                           <Eye className="w-4 h-4" />
                         </button>
                       </td>
                       <td className="px-3 py-1 font-medium text-teal-400 sticky left-8 z-10 bg-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                          <div className="flex items-center gap-2">
                            <span>{t.ip_address}</span>
                            {t.survey_data?.['ย้ายมาจาก IP'] && (
                              <span 
                                className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block cursor-help"
                                title={`ย้ายมาจาก: ${t.survey_data['ย้ายมาจาก IP']}\nประวัติ: ${t.survey_data['ประวัติการย้ายไซต์']}`}
                              />
                            )}
                            <button
                              onClick={() => {
                                setRelocatingTask(t);
                                setTargetSite(null);
                              }}
                              className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-400 hover:text-teal-400 transition-colors flex items-center justify-center"
                              title="ย้ายสถานที่สำรวจ (Relocate Site)"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                            {t.survey_data?.['ย้ายมาจาก IP'] && (
                              <button
                                onClick={() => handleRevertRelocation(t.task_id)}
                                className="p-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 border border-red-900/40 rounded transition-colors flex items-center justify-center"
                                title="ยกเลิกการย้ายไซต์ (Undo Relocation)"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                       <td className="px-3 py-1 text-slate-300">{t.ne_name || t.site_name || '-'}</td>
                       {project.form_schema && project.form_schema.filter((f: any) => f.visible !== false).map((f: any) => (
                          <td key={f.name} className="px-3 py-1">
                            {f.editable === false ? (
                              <span className="text-slate-300">
                                {f.type === 'checkbox' ? (
                                  t.survey_data?.[f.name] === 'true' ? 'Yes' : 'No'
                                ) : f.type === 'image' ? (
                                  t.survey_data?.[f.name] ? (
                                    <img 
                                      src={t.survey_data[f.name]} 
                                      alt={f.label} 
                                      onClick={() => setPreviewImage(t.survey_data[f.name])}
                                      className="w-8 h-8 object-cover rounded border border-slate-700 cursor-pointer hover:border-teal-400 transition-colors inline-block"
                                    />
                                  ) : '-'
                                ) : f.type === 'file' ? (
                                  t.survey_data?.[f.name] ? (
                                    <button 
                                      onClick={() => downloadFile(t.survey_data[f.name])}
                                      className="text-xs text-teal-400 hover:underline flex items-center gap-1 inline-flex animate-fade-in"
                                      title={typeof t.survey_data[f.name] === 'object' ? t.survey_data[f.name].name : 'Download file'}
                                    >
                                      <Download className="w-3 h-3" /> Download
                                    </button>
                                  ) : '-'
                                ) : (
                                  t.survey_data?.[f.name] || '-'
                                )}
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
                            ) : f.type === 'image' ? (
                              t.survey_data?.[f.name] ? (
                                <div className="flex items-center gap-1">
                                  <img 
                                    src={t.survey_data[f.name]} 
                                    alt={f.label} 
                                    onClick={() => setPreviewImage(t.survey_data[f.name])}
                                    className="w-8 h-8 object-cover rounded border border-slate-700 cursor-pointer hover:border-teal-400 transition-colors inline-block"
                                  />
                                  <button 
                                    onClick={() => {
                                      const newTasks = [...tasks];
                                      const taskIdx = newTasks.findIndex(x => x.task_id === t.task_id);
                                      const updatedData = { ...newTasks[taskIdx].survey_data };
                                      delete updatedData[f.name];
                                      newTasks[taskIdx].survey_data = updatedData;
                                      setTasks(newTasks);
                                    }}
                                    className="text-red-400 hover:text-red-300 p-0.5"
                                    title="Remove Image"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <label className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded px-2 py-0.5 cursor-pointer transition-colors text-xs text-slate-300 gap-1 w-20">
                                  <ImagePlus className="w-3 h-3 text-teal-400" />
                                  <span>Upload</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      try {
                                        const compressed = await compressImage(file);
                                        const newTasks = [...tasks];
                                        const taskIdx = newTasks.findIndex(x => x.task_id === t.task_id);
                                        newTasks[taskIdx].survey_data = { ...newTasks[taskIdx].survey_data, [f.name]: compressed };
                                        setTasks(newTasks);
                                      } catch (err) {
                                        alert('Failed to compress image');
                                      }
                                    }} 
                                    className="hidden"
                                  />
                                </label>
                              )
                            ) : f.type === 'file' ? (
                              t.survey_data?.[f.name] ? (
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => downloadFile(t.survey_data[f.name])}
                                    className="text-xs text-teal-400 hover:underline truncate max-w-[80px] inline-block"
                                    title={typeof t.survey_data[f.name] === 'object' ? t.survey_data[f.name].name : 'Download file'}
                                  >
                                    {typeof t.survey_data[f.name] === 'object' ? t.survey_data[f.name].name : 'Download'}
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const newTasks = [...tasks];
                                      const taskIdx = newTasks.findIndex(x => x.task_id === t.task_id);
                                      const updatedData = { ...newTasks[taskIdx].survey_data };
                                      delete updatedData[f.name];
                                      newTasks[taskIdx].survey_data = updatedData;
                                      setTasks(newTasks);
                                    }}
                                    className="text-red-400 hover:text-red-300 p-0.5"
                                    title="Remove File"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <label className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded px-2 py-0.5 cursor-pointer transition-colors text-xs text-slate-300 gap-1 w-20">
                                  <FileUp className="w-3 h-3 text-teal-400" />
                                  <span>Upload</span>
                                  <input 
                                    type="file" 
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      try {
                                        const dataObj = await compressFile(file);
                                        const newTasks = [...tasks];
                                        const taskIdx = newTasks.findIndex(x => x.task_id === t.task_id);
                                        newTasks[taskIdx].survey_data = { ...newTasks[taskIdx].survey_data, [f.name]: dataObj };
                                        setTasks(newTasks);
                                      } catch (err) {
                                        alert('Failed to upload file');
                                      }
                                    }} 
                                    className="hidden"
                                  />
                                </label>
                              )
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
                    <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-800 space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-800/50">
                        <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                          รายละเอียดสถานที่ (Site Details)
                        </span>
                        <button
                          onClick={() => {
                            setRelocatingTask(selectedTask);
                            setTargetSite(null);
                          }}
                          className="px-3 py-1 bg-slate-850 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-1.5 font-medium"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                          ย้ายสถานที่สำรวจ (Relocate Site)
                        </button>
                      </div>
                      
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                          <div className="col-span-2">
                            <span className="block text-[10px] text-slate-500 uppercase font-semibold">Primary Key (IP)</span>
                            <span className="text-sm text-teal-400 font-semibold font-mono">{selectedTask.ip_address}</span>
                          </div>
                          {selectedTask.master_data ? (
                            Object.entries(selectedTask.master_data)
                              .filter(([k]) => k !== 'created_at' && k !== 'id')
                              .slice(0, 8)
                              .map(([key, value]) => (
                                <div key={key}>
                                  <span className="block text-[10px] text-slate-500 uppercase font-semibold truncate" title={key}>{key}</span>
                                  <span className="text-sm text-slate-300 truncate block" title={String(value || '-')}>{String(value || '-')}</span>
                                </div>
                            ))
                          ) : (
                            <div className="col-span-2 text-xs text-slate-500 italic">No master data available</div>
                          )}
                        {selectedTask.survey_data?.['ย้ายมาจาก IP'] && (
                          <div className="col-span-2 p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-lg mt-1 flex flex-col gap-2">
                            <div>
                              <span className="block text-[9px] text-amber-400 font-bold uppercase tracking-wider mb-0.5">ประวัติการย้ายไซต์ (Relocation History)</span>
                              <span className="text-xs text-amber-200 block leading-relaxed">{selectedTask.survey_data['ประวัติการย้ายไซต์']}</span>
                            </div>
                            <button
                              onClick={() => handleRevertRelocation(selectedTask.task_id)}
                              className="self-start px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-white border border-red-500/30 rounded text-[11px] font-medium transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <RotateCcw className="w-3 h-3" /> ยกเลิกการย้ายไซต์ (Undo Relocation)
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {project.form_schema && project.form_schema.filter((f: any) => f.visible !== false).map((field: any) => (
                        <div key={field.name}>
                          <label className="block text-sm font-medium text-slate-400 mb-1">{field.label}</label>
                          {field.editable === false ? (
                            <div className="w-full bg-slate-800/30 border border-transparent rounded-lg px-4 py-2 text-slate-300">
                              {field.type === 'checkbox' ? (
                                formData[field.name] === 'true' ? 'Yes' : 'No'
                              ) : field.type === 'image' ? (
                                formData[field.name] ? (
                                  <div className="mt-1">
                                    <img 
                                      src={formData[field.name]} 
                                      alt={field.label} 
                                      onClick={() => setPreviewImage(formData[field.name])}
                                      className="max-h-48 rounded border border-slate-700 cursor-pointer hover:opacity-90 transition-opacity"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-slate-500 italic text-sm">No image uploaded</span>
                                )
                              ) : field.type === 'file' ? (
                                formData[field.name] ? (
                                  <div className="flex items-center gap-2 mt-1">
                                    <button 
                                      type="button"
                                      onClick={() => downloadFile(formData[field.name])}
                                      className="text-sm text-teal-400 hover:underline flex items-center gap-2 font-medium"
                                    >
                                      <Download className="w-4 h-4" />
                                      {typeof formData[field.name] === 'object' ? formData[field.name].name : 'Download file'}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-slate-500 italic text-sm">No file uploaded</span>
                                )
                              ) : (
                                formData[field.name] || '-'
                              )}
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
                          ) : field.type === 'image' ? (
                            formData[field.name] ? (
                              <div className="space-y-2">
                                <img 
                                  src={formData[field.name]} 
                                  alt={field.label} 
                                  onClick={() => setPreviewImage(formData[field.name])}
                                  className="max-h-48 rounded border border-slate-700 cursor-pointer hover:opacity-90 transition-opacity block"
                                />
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const newFormData = { ...formData };
                                    delete newFormData[field.name];
                                    setFormData(newFormData);
                                  }}
                                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-medium border border-red-500/20 flex items-center gap-1.5 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Remove Image
                                </button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 hover:border-teal-500 rounded-xl cursor-pointer bg-slate-800/20 hover:bg-slate-800/40 transition-all">
                                <ImagePlus className="w-8 h-8 text-slate-500 mb-2" />
                                <span className="text-sm font-medium text-slate-300">Click to upload/capture image</span>
                                <span className="text-xs text-slate-500 mt-1">Image will be compressed automatically</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      const compressed = await compressImage(file);
                                      setFormData({ ...formData, [field.name]: compressed });
                                    } catch (err) {
                                      alert('Failed to compress image');
                                    }
                                  }} 
                                  className="hidden"
                                />
                              </label>
                            )
                          ) : field.type === 'file' ? (
                            formData[field.name] ? (
                              <div className="p-4 bg-slate-800/40 border border-slate-700 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <FileSpreadsheet className="w-8 h-8 text-teal-400" />
                                  <div>
                                    <div className="text-sm font-medium text-slate-200 truncate max-w-xs">{typeof formData[field.name] === 'object' ? formData[field.name].name : 'Uploaded File'}</div>
                                    <div className="text-xs text-slate-500">{typeof formData[field.name] === 'object' && formData[field.name].size ? `${Math.round(formData[field.name].size / 1024)} KB` : ''}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button 
                                    type="button"
                                    onClick={() => downloadFile(formData[field.name])}
                                    className="p-2 bg-slate-800 hover:bg-slate-700 text-teal-400 rounded-lg transition-colors border border-slate-700"
                                    title="Download File"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      const newFormData = { ...formData };
                                      delete newFormData[field.name];
                                      setFormData(newFormData);
                                    }}
                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20"
                                    title="Remove File"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 hover:border-teal-500 rounded-xl cursor-pointer bg-slate-800/20 hover:bg-slate-800/40 transition-all">
                                <FileUp className="w-8 h-8 text-slate-500 mb-2" />
                                <span className="text-sm font-medium text-slate-300">Click to upload document/file</span>
                                <input 
                                  type="file" 
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      const dataObj = await compressFile(file);
                                      setFormData({ ...formData, [field.name]: dataObj });
                                    } catch (err) {
                                      alert('Failed to upload file');
                                    }
                                  }} 
                                  className="hidden"
                                />
                              </label>
                            )
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
                  {Object.entries(viewingTask.survey_data || {}).map(([key, value], i) => {
                    const isImg = typeof value === 'string' && value.startsWith('data:image/');
                    const isFileObj = typeof value === 'object' && value !== null && (value as any).data && (value as any).name;
                    return (
                      <div key={key} className={`flex ${i % 2 === 0 ? 'bg-slate-800/30' : 'bg-transparent'} hover:bg-slate-800/80 transition-colors`}>
                        <div className="w-1/3 p-3 font-medium text-slate-400 text-sm border-r border-slate-800 truncate" title={key}>{key}</div>
                        <div className="w-2/3 p-3 text-white text-sm break-words">
                          {isImg ? (
                            <img 
                              src={value as string} 
                              alt={key} 
                              onClick={() => setPreviewImage(value as string)}
                              className="max-h-32 rounded border border-slate-700 cursor-pointer hover:opacity-90 transition-opacity"
                            />
                          ) : isFileObj ? (
                            <button 
                              onClick={() => downloadFile(value)}
                              className="text-teal-400 hover:underline flex items-center gap-1 font-medium"
                            >
                              <Download className="w-4 h-4" /> Download {(value as any).name}
                            </button>
                          ) : (
                            String(value || '-')
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {relocatingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in duration-200">
              <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-950/30">
                <h3 className="text-lg font-bold text-teal-400 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin-slow" />
                  ย้ายสถานที่สำรวจ (Relocate Site)
                </h3>
                <button onClick={() => { setRelocatingTask(null); setTargetSite(null); }} className="text-slate-400 hover:text-white p-2 bg-slate-800 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 uppercase font-bold tracking-wider font-semibold">เลือกไซต์ปลายทาง (Target Site)</label>
                  {(() => {
                    const projectIps = new Set(tasks.map((t: any) => t.ip_address));
                    const provinceFilteredSites = allSites.filter((s: any) => 
                      s.province === relocatingTask.province && 
                      !projectIps.has(s.ip_address)
                    );

                    return (
                      <select
                        value={targetSite?.ip_address || ''}
                        onChange={(e) => {
                          const targetIp = e.target.value;
                          if (!targetIp) {
                            setTargetSite(null);
                            return;
                          }
                          const tSite = allSites.find(s => s.ip_address === targetIp);
                          if (tSite) {
                            setTargetSite(tSite);
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-teal-500 transition-colors"
                      >
                        <option value="">-- เลือกไซต์ในจังหวัด {relocatingTask.province || '-'} ที่ยังไม่มีในโปรเจกต์ --</option>
                        {provinceFilteredSites.map(s => (
                          <option key={s.ip_address} value={s.ip_address}>
                            {s.ip_address} - {s.site_name}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>

                {targetSite ? (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <p className="text-sm text-slate-400">
                      โปรดตรวจสอบรายละเอียดเปรียบเทียบสถานที่ต้นทางและปลายทางด้านล่าง:
                    </p>
                    
                    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/20">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-800/20 text-slate-400">
                            <th className="p-3 font-semibold">รายละเอียด (Fields)</th>
                            <th className="p-3 font-semibold text-amber-400">ไซต์ปัจจุบัน (Current)</th>
                            <th className="p-3 font-semibold text-teal-400">ไซต์ปลายทาง (Target)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          <tr>
                            <td className="p-3 font-medium text-slate-500">NE IP Address</td>
                            <td className="p-3 text-slate-300 font-mono">{relocatingTask.ip_address}</td>
                            <td className="p-3 text-slate-300 font-mono">{targetSite.ip_address}</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-medium text-slate-500">Site Name</td>
                            <td className="p-3 text-slate-300">{relocatingTask.site_name || '-'}</td>
                            <td className="p-3 text-slate-300">{targetSite.site_name || '-'}</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-medium text-slate-500">NE Name</td>
                            <td className="p-3 text-slate-300">{relocatingTask.ne_name || '-'}</td>
                            <td className="p-3 text-slate-300">{targetSite.ne_name || '-'}</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-medium text-slate-500">Province</td>
                            <td className="p-3 text-slate-300">{relocatingTask.province || '-'}</td>
                            <td className="p-3 text-slate-300">{targetSite.province || '-'}</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-medium text-slate-500">Brand</td>
                            <td className="p-3 text-slate-300">{relocatingTask.brand || '-'}</td>
                            <td className="p-3 text-slate-300">{targetSite.brand || '-'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-950/10">
                    โปรดเลือกไซต์ปลายทางเพื่อเปรียบเทียบข้อมูลก่อนกดยืนยัน
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-slate-800 bg-slate-950/30 flex justify-end gap-3">
                <button
                  onClick={() => { setRelocatingTask(null); setTargetSite(null); }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                  ยกเลิก (Cancel)
                </button>
                <button
                  onClick={async () => {
                    if (!targetSite) return;
                    try {
                      const completed = (relocatingTask.survey_data?.['ดำเนินการ แล้วเสร็จ'] === 'true' || relocatingTask.survey_data?.['ดำเนินการ แล้วเสร็จ'] === true);
                      await axios.post(`${API_BASE}/tasks/${relocatingTask.task_id}/change-site`, {
                        target_ip_address: targetSite.ip_address,
                        current_survey_data: relocatingTask.survey_data || {},
                        current_status: completed ? 'Completed' : 'Pending'
                      }, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      
                      const targetIp = targetSite.ip_address;
                      const taskId = relocatingTask.task_id;
                      setRelocatingTask(null);
                      setTargetSite(null);

                      const tasksRes = await axios.get(`${API_BASE}/projects/${id}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
                      const updatedTasks = tasksRes.data;
                      setTasks(updatedTasks);

                      const updatedTask = updatedTasks.find((t: any) => t.ip_address === targetIp) || updatedTasks.find((t: any) => t.task_id === taskId);
                      if (updatedTask) {
                        setSelectedTask(updatedTask);
                        setFormData(updatedTask.survey_data || {});
                      }
                      alert('Site moved successfully!');
                    } catch (error) {
                      console.error(error);
                      alert('Failed to change site');
                    }
                  }}
                  disabled={!targetSite}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    targetSite 
                      ? 'bg-teal-500 hover:bg-teal-600 text-white cursor-pointer' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  ยืนยันการย้ายไซต์ (Confirm Relocate)
                </button>
              </div>
            </div>
          </div>
        )}

        {previewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <button 
              onClick={() => setPreviewImage(null)} 
              className="absolute top-4 right-4 text-white/70 hover:text-white p-3 bg-slate-800/80 rounded-full hover:scale-105 transition-transform"
              title="Close Preview"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={previewImage} 
              alt="Preview" 
              className="max-w-full max-h-full rounded shadow-2xl object-contain"
            />
          </div>
        )}


      </main>
    </div>
  );
};

const PathSaver = () => {
  const location = useLocation();
  useEffect(() => {
    localStorage.setItem('app_last_path_site-survey-pro', location.pathname);
  }, [location]);
  return null;
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('app9_token') || '');
  const [customAlert, setCustomAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    window.alert = (message: any) => {
      setCustomAlert({ message: String(message), type: 'info' });
    };
  }, []);

  return (
    <BrowserRouter basename="/app9">
      <PathSaver />
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login setToken={setToken} />} />
        <Route path="/admin" element={token ? <AdminPanel token={token} /> : <Navigate to="/login" />} />
        <Route path="/" element={token ? <Dashboard token={token} setToken={setToken} /> : <Navigate to="/login" />} />
        <Route path="/project/:id" element={token ? <ProjectView token={token} /> : <Navigate to="/login" />} />
      </Routes>

      {customAlert && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              customAlert.message.toLowerCase().includes('failed') || 
              customAlert.message.toLowerCase().includes('error') || 
              customAlert.message.includes('ล้มเหลว') || 
              customAlert.message.includes('ไม่')
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
            }`}>
              {customAlert.message.toLowerCase().includes('failed') || 
              customAlert.message.toLowerCase().includes('error') || 
              customAlert.message.includes('ล้มเหลว') || 
              customAlert.message.includes('ไม่') ? (
                <AlertCircle className="w-6 h-6" />
              ) : (
                <CheckCircle className="w-6 h-6" />
              )}
            </div>
            <h3 className="text-base font-semibold text-white mb-2">
              {customAlert.message.toLowerCase().includes('failed') || 
              customAlert.message.toLowerCase().includes('error') || 
              customAlert.message.includes('ล้มเหลว') || 
              customAlert.message.includes('ไม่') ? 'เกิดข้อผิดพลาด (Error)' : 'แจ้งเตือน (Success)'}
            </h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed whitespace-pre-wrap">{customAlert.message}</p>
            <button
              onClick={() => setCustomAlert(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-sm font-medium border border-slate-700 transition-colors"
            >
              ตกลง (OK)
            </button>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}
