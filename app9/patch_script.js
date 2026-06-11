const fs = require('fs');
let content = fs.readFileSync('/home/nopparus2/www/app9/src/App.tsx', 'utf8');

// Chunk 1
content = content.replace(
  "  const [mappingConfig, setMappingConfig] = useState({ siteName: '', neName: '', province: '', brand: '' });\n  const [editMappingConfig, setEditMappingConfig] = useState({ siteName: '', neName: '', province: '', brand: '' });",
  "  const [mappingConfig, setMappingConfig] = useState<any[]>([{ label: 'Site Name', masterColumn: '', surveyColumn: '' }]);\n  const [editMappingConfig, setEditMappingConfig] = useState<any[]>([{ label: 'Site Name', masterColumn: '', surveyColumn: '' }]);"
);

// Chunk 2
content = content.replace(
  "setEditMappingConfig(proj.mapping_config || { siteName: '', neName: '', province: '', brand: '' });",
  "setEditMappingConfig(Array.isArray(proj.mapping_config) ? proj.mapping_config : [{ label: 'Site Name', masterColumn: proj.mapping_config?.siteName || '', surveyColumn: proj.mapping_config?.siteName || '' }]);"
);

// Chunk 3: Edit mode UI
const editUI = `            <div className="mb-6 pt-4 border-t border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold text-teal-400 text-lg">System Field Mapping</h3>
                  <p className="text-sm text-slate-400">Select which master data columns map to which survey fields (used for Relocate Site feature).</p>
                </div>
                <button 
                  onClick={() => setEditMappingConfig([...(Array.isArray(editMappingConfig) ? editMappingConfig : []), { label: '', masterColumn: '', surveyColumn: '' }])}
                  className="px-3 py-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-lg text-sm transition-colors border border-teal-500/30"
                >
                  + Add Mapping
                </button>
              </div>
              
              <div className="space-y-3">
                {(() => {
                  const arr = Array.isArray(editMappingConfig) ? editMappingConfig : [];
                  const masterDataset = masterDatasets.find(md => md.id === editingProject.master_dataset_id);
                  const masterColumns = masterDataset?.schema_config || [];

                  if (arr.length === 0) return <div className="text-sm text-slate-500 italic">No mappings defined.</div>;

                  return arr.map((mapping, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-slate-800/30 p-3 rounded-lg border border-slate-700">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-400 mb-1">Display Label</label>
                        <input 
                          type="text" 
                          value={mapping.label || ''} 
                          onChange={e => {
                            const newArr = [...arr];
                            newArr[idx].label = e.target.value;
                            setEditMappingConfig(newArr);
                          }}
                          placeholder="e.g. Site Name"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-teal-500 outline-none"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-400 mb-1">Master Column (Target)</label>
                        <select 
                          value={mapping.masterColumn || ''} 
                          onChange={e => {
                            const newArr = [...arr];
                            newArr[idx].masterColumn = e.target.value;
                            setEditMappingConfig(newArr);
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-teal-500 outline-none"
                        >
                          <option value="">-- Select Master Column --</option>
                          {masterColumns.map((col: any) => (
                            <option key={col.name} value={col.name}>{col.label || col.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-400 mb-1">Survey Column (Current)</label>
                        <select 
                          value={mapping.surveyColumn || ''} 
                          onChange={e => {
                            const newArr = [...arr];
                            newArr[idx].surveyColumn = e.target.value;
                            setEditMappingConfig(newArr);
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-teal-500 outline-none"
                        >
                          <option value="">-- Select Survey Column --</option>
                          {editSchema.map(f => (
                            <option key={f.name} value={f.name}>{f.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="pt-6">
                        <button 
                          onClick={() => {
                            const newArr = [...arr];
                            newArr.splice(idx, 1);
                            setEditMappingConfig(newArr);
                          }}
                          className="p-2 text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors border border-red-400/20"
                        >
                          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>`;

content = content.replace(
  /<div className="mb-6 pt-4 border-t border-slate-800">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<h3 className="font-semibold text-teal-400 mb-4 text-lg">Edit Form Fields Configuration<\/h3>/,
  editUI + '\n            \n            <h3 className="font-semibold text-teal-400 mb-4 text-lg">Edit Form Fields Configuration</h3>'
);


// Chunk 4: New mode UI
const newUI = `                  <div className="pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-semibold text-teal-400 text-lg">System Field Mapping</h3>
                        <p className="text-sm text-slate-400">Select which master data columns map to which survey fields (used for Relocate Site feature).</p>
                      </div>
                      <button 
                        onClick={() => setMappingConfig([...(Array.isArray(mappingConfig) ? mappingConfig : []), { label: '', masterColumn: '', surveyColumn: '' }])}
                        className="px-3 py-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-lg text-sm transition-colors border border-teal-500/30"
                      >
                        + Add Mapping
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {(() => {
                        const arr = Array.isArray(mappingConfig) ? mappingConfig : [];
                        const masterDataset = masterDatasets.find(md => md.id === selectedMasterDatasetId);
                        const masterColumns = masterDataset?.schema_config || [];

                        if (arr.length === 0) return <div className="text-sm text-slate-500 italic">No mappings defined.</div>;

                        return arr.map((mapping, idx) => (
                          <div key={idx} className="flex gap-3 items-start bg-slate-800/30 p-3 rounded-lg border border-slate-700">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-slate-400 mb-1">Display Label</label>
                              <input 
                                type="text" 
                                value={mapping.label || ''} 
                                onChange={e => {
                                  const newArr = [...arr];
                                  newArr[idx].label = e.target.value;
                                  setMappingConfig(newArr);
                                }}
                                placeholder="e.g. Site Name"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-teal-500 outline-none"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-slate-400 mb-1">Master Column (Target)</label>
                              <select 
                                value={mapping.masterColumn || ''} 
                                onChange={e => {
                                  const newArr = [...arr];
                                  newArr[idx].masterColumn = e.target.value;
                                  setMappingConfig(newArr);
                                }}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-teal-500 outline-none"
                              >
                                <option value="">-- Select Master Column --</option>
                                {masterColumns.map((col: any) => (
                                  <option key={col.name} value={col.name}>{col.label || col.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-slate-400 mb-1">Survey Column (Current)</label>
                              <select 
                                value={mapping.surveyColumn || ''} 
                                onChange={e => {
                                  const newArr = [...arr];
                                  newArr[idx].surveyColumn = e.target.value;
                                  setMappingConfig(newArr);
                                }}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-teal-500 outline-none"
                              >
                                <option value="">-- Select Survey Column --</option>
                                {headers.map(h => (
                                  <option key={h} value={h}>{h}</option>
                                ))}
                              </select>
                            </div>
                            <div className="pt-6">
                              <button 
                                onClick={() => {
                                  const newArr = [...arr];
                                  newArr.splice(idx, 1);
                                  setMappingConfig(newArr);
                                }}
                                className="p-2 text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors border border-red-400/20"
                              >
                                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                              </button>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>`;

content = content.replace(
  /<div className="pt-4 border-t border-slate-800">\s*<h3 className="font-semibold text-teal-400 mb-4 text-lg">System Field Mapping<\/h3>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<div className="pt-4 border-t border-slate-800">\s*<h3 className="font-semibold text-teal-400 mb-4 text-lg">Configure Form Fields/,
  newUI + '\n\n                  <div className="pt-4 border-t border-slate-800">\n                    <h3 className="font-semibold text-teal-400 mb-4 text-lg">Configure Form Fields'
);

// Chunk 5: ProjectView relocation table
const tableMatch = /const mapping = project\.mapping_config \|\| \{\};[\s\S]*?<\/table>/;
const newTable = `{(() => {
                        const mapping = Array.isArray(project.mapping_config) 
                          ? project.mapping_config 
                          : [
                              { label: 'Site Name', masterColumn: project.mapping_config?.siteName || 'site_name', surveyColumn: project.mapping_config?.siteName || 'site_name' },
                              { label: 'NE Name', masterColumn: project.mapping_config?.neName || 'ne_name', surveyColumn: project.mapping_config?.neName || 'ne_name' },
                              { label: 'Province', masterColumn: project.mapping_config?.province || 'province', surveyColumn: project.mapping_config?.province || 'province' },
                              { label: 'Brand', masterColumn: project.mapping_config?.brand || 'brand', surveyColumn: project.mapping_config?.brand || 'brand' }
                            ].filter(m => m.masterColumn);
                        
                        const getSurveyVal = (obj: any, key: string) => {
                          if (!obj || !key) return '-';
                          return obj.survey_data?.[key] || obj.data?.[key] || obj[key] || '-';
                        };
                        const getMasterVal = (obj: any, key: string) => {
                          if (!obj || !key) return '-';
                          return obj.data?.[key] || obj[key] || '-';
                        };

                        return (
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
                                <td className="p-3 font-medium text-slate-500">IP Address</td>
                                <td className="p-3 text-slate-300 font-mono">{relocatingTask.ip_address}</td>
                                <td className="p-3 text-slate-300 font-mono">{targetSite.ip_address}</td>
                              </tr>
                              {mapping.map((m: any, idx: number) => (
                                <tr key={idx}>
                                  <td className="p-3 font-medium text-slate-500">{m.label}<br/><span className="text-xs text-slate-600">({m.surveyColumn} / {m.masterColumn})</span></td>
                                  <td className="p-3 text-slate-300">{getSurveyVal(relocatingTask, m.surveyColumn)}</td>
                                  <td className="p-3 text-slate-300">{getMasterVal(targetSite, m.masterColumn)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>`;
content = content.replace(tableMatch, newTable);


// Also replace the display mapping inside `<option key={s.ip_address} value={s.ip_address}>` loop for `targetSite` select
const selectOptionsMatch = /const mapping = project\.mapping_config \|\| \{\};\s*const siteNameKey = mapping\.siteName \|\| 'site_name';\s*const displaySiteName = s\.data\?\.\[siteNameKey\] \|\| s\.site_name \|\| '-';/;
const newSelectOptions = `const mapping = Array.isArray(project.mapping_config) ? project.mapping_config : [];
                          const siteNameMapping = mapping.find((m: any) => m.label?.toLowerCase().includes('site') || m.label?.toLowerCase().includes('ชื่อ'));
                          const siteNameKey = siteNameMapping ? siteNameMapping.masterColumn : (project.mapping_config?.siteName || 'site_name');
                          const displaySiteName = s.data?.[siteNameKey] || s.site_name || '-';`;

content = content.replace(selectOptionsMatch, newSelectOptions);


fs.writeFileSync('/home/nopparus2/www/app9/src/App.tsx', content);
