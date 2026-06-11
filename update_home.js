const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, 'app8/client/src/App.tsx');
let content = fs.readFileSync(appTsxPath, 'utf8');

const newHomeJSX = `          {view === 'home' && (
            <div className="flex-1 overflow-y-auto p-8 scrollbar-thin bg-slate-50/30">
              <div className="flex flex-col gap-8 max-w-[1600px] mx-auto">
                {/* --- Tab Navigation --- */}
                <div className="flex p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-2xl w-fit border border-slate-200">
                  <button onClick={() => setHomeTab('circuit')} className={\`px-8 py-3 rounded-xl text-sm font-black transition-all \${homeTab === 'circuit' ? 'bg-white text-indigo-600 shadow-md shadow-slate-200/50' : 'text-slate-500 hover:text-slate-700'}\`}>Circuit Summary (New)</button>
                  <button onClick={() => setHomeTab('overview')} className={\`px-8 py-3 rounded-xl text-sm font-black transition-all \${homeTab === 'overview' ? 'bg-white text-indigo-600 shadow-md shadow-slate-200/50' : 'text-slate-500 hover:text-slate-700'}\`}>Overview (Classic)</button>
                </div>

                {homeTab === 'circuit' && dashboardV2Stats && (
                  <>
                    {/* --- Stats Cards (V2) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                      {/* Card 1.1: ONU Type Breakdown */}
                      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Layout size={18} /></div>
                          <h3 className="font-black text-slate-700 text-sm">จำนวน ONU (ตาม Type)</h3>
                        </div>
                        <div className="space-y-3 flex-1">
                          {dashboardV2Stats.card11_type_breakdown?.slice(0,3).map((t: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-500">{t.type}</span>
                              <span className="font-black text-indigo-600">{Number(t.total).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card 1.2: FE Only */}
                      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><Shield size={18} /></div>
                            <h3 className="font-black text-slate-700 text-sm">ONU Port 100M</h3>
                          </div>
                          <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-sm">{Number(dashboardV2Stats.card12_fe_only?.total || 0).toLocaleString()}</span>
                        </div>
                        <div className="space-y-2 flex-1">
                          {dashboardV2Stats.card12_fe_only?.brands?.slice(0,4).map((b: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-xs border-b border-slate-50 pb-1">
                              <span className="font-bold text-slate-500">{b.brand}</span>
                              <span className="font-black text-rose-500">{Number(b.circuit_count).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card 1.3: Service Names */}
                      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Database size={18} /></div>
                          <h3 className="font-black text-slate-700 text-sm">ข้อมูลแยกตาม Service</h3>
                        </div>
                        <div className="mb-2">
                          <select 
                            multiple
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-100 h-16 scrollbar-thin"
                            value={selectedServices}
                            onChange={(e) => setSelectedServices(Array.from(e.target.selectedOptions, o => o.value))}
                          >
                            {serviceNames.map((s, i) => (
                              <option key={i} value={s.service_name}>{s.service_name} ({Number(s.circuit_count).toLocaleString()})</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2 flex-1 overflow-y-auto max-h-[80px] scrollbar-thin">
                          {dashboardV2Stats.card13_by_service?.map((s: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-500 truncate max-w-[150px]">{s.service_name}</span>
                              <span className="font-black text-blue-600">{Number(s.circuit_count).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card 1.4: Speed Mismatch */}
                      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><AlertCircle size={18} /></div>
                            <h3 className="font-black text-slate-700 text-sm">สปีดไม่ถึงแพ็กเกจ</h3>
                          </div>
                          <span className="font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-sm">{dashboardV2Stats.card14_speed_mismatch?.reduce((a:any,b:any)=>a+Number(b.mismatch_count),0).toLocaleString()}</span>
                        </div>
                        <div className="space-y-2 flex-1">
                          {dashboardV2Stats.card14_speed_mismatch?.map((m: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-[11px]">
                              <span className="font-bold text-slate-500 truncate">{m.brand}</span>
                              <span className="font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{Number(m.mismatch_count).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* --- Circuit Table --- */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
                      <div className="px-8 py-6 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Zap size={24} />
                          </div>
                          <div>
                            <h2 className="text-xl font-black text-slate-800">สรุปข้อมูลระดับวงจร (Circuit Summary)</h2>
                            <p className="text-xs font-bold text-slate-400 mt-1">รวมศูนย์ข้อมูลอุปกรณ์จากทุกตาราง โดยใช้ Circuit ID เป็นหลัก</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                              type="text" 
                              value={circuitSearchInput}
                              onChange={(e) => setCircuitSearchInput(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') { setCircuitSearch(circuitSearchInput); setCircuitPage(1); } }}
                              placeholder="ค้นหาวงจร, ยี่ห้อ..."
                              className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-[250px] focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                            />
                          </div>
                          <button onClick={handleCircuitExport} disabled={isExportingCircuit} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black shadow-md hover:bg-emerald-700 transition-all disabled:opacity-50">
                            <Download size={16} /> {isExportingCircuit ? 'Exporting...' : 'Export Excel'}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-auto scrollbar-thin">
                        <table className="w-full text-left whitespace-nowrap">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                              <th onClick={() => { if(circuitSortField==='circuit_norm') setCircuitSortOrder(o=>o==='ASC'?'DESC':'ASC'); else {setCircuitSortField('circuit_norm'); setCircuitSortOrder('ASC');}}} className="sticky top-0 z-10 bg-slate-50 px-6 py-4 text-[11px] font-black uppercase text-slate-500 cursor-pointer hover:text-indigo-600">หมายเลขวงจร</th>
                              <th onClick={() => { if(circuitSortField==='speed') setCircuitSortOrder(o=>o==='ASC'?'DESC':'ASC'); else {setCircuitSortField('speed'); setCircuitSortOrder('ASC');}}} className="sticky top-0 z-10 bg-slate-50 px-6 py-4 text-[11px] font-black uppercase text-slate-500 cursor-pointer hover:text-indigo-600">ความเร็ว</th>
                              <th onClick={() => { if(circuitSortField==='onu_brand') setCircuitSortOrder(o=>o==='ASC'?'DESC':'ASC'); else {setCircuitSortField('onu_brand'); setCircuitSortOrder('ASC');}}} className="sticky top-0 z-10 bg-slate-50 px-6 py-4 text-[11px] font-black uppercase text-slate-500 cursor-pointer hover:text-indigo-600">ONU (Records)</th>
                              <th onClick={() => { if(circuitSortField==='olt_brand') setCircuitSortOrder(o=>o==='ASC'?'DESC':'ASC'); else {setCircuitSortField('olt_brand'); setCircuitSortOrder('ASC');}}} className="sticky top-0 z-10 bg-slate-50 px-6 py-4 text-[11px] font-black uppercase text-slate-500 cursor-pointer hover:text-indigo-600">ONU (Get OLT)</th>
                              <th onClick={() => { if(circuitSortField==='wifi_brand') setCircuitSortOrder(o=>o==='ASC'?'DESC':'ASC'); else {setCircuitSortField('wifi_brand'); setCircuitSortOrder('ASC');}}} className="sticky top-0 z-10 bg-slate-50 px-6 py-4 text-[11px] font-black uppercase text-slate-500 cursor-pointer hover:text-indigo-600">WiFi Router</th>
                              <th onClick={() => { if(circuitSortField==='effective_max_speed') setCircuitSortOrder(o=>o==='ASC'?'DESC':'ASC'); else {setCircuitSortField('effective_max_speed'); setCircuitSortOrder('ASC');}}} className="sticky top-0 z-10 bg-slate-50 px-6 py-4 text-[11px] font-black uppercase text-slate-500 cursor-pointer hover:text-indigo-600">Max Speed รวม</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {circuitData.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-3 text-sm font-black text-indigo-600 flex items-center gap-2">
                                  {row.circuit_norm}
                                  {row.has_onu && row.has_olt && row.has_wifi ? <span className="w-2 h-2 rounded-full bg-slate-800" title="พบในทุกตาราง"></span> :
                                   row.has_wifi ? <span className="w-2 h-2 rounded-full bg-green-500" title="พบใน WiFi Router"></span> :
                                   row.has_olt ? <span className="w-2 h-2 rounded-full bg-blue-500" title="พบใน ONU Get OLT"></span> :
                                   <span className="w-2 h-2 rounded-full bg-indigo-400" title="พบเฉพาะ ONU Records"></span>}
                                </td>
                                <td className="px-6 py-3 text-sm font-bold text-slate-600">{row.speed || '-'}</td>
                                <td className="px-6 py-3">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-black text-slate-700">{row.has_onu ? (row.onu_brand || 'Pending Mapping') : '-'}</span>
                                    <span className="text-[10px] font-bold text-slate-400">{row.has_onu ? row.onu_model : ''}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-3">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-black text-blue-600">{row.has_olt ? (row.olt_brand || 'Pending Mapping') : '-'}</span>
                                    <span className="text-[10px] font-bold text-blue-400">{row.has_olt ? row.olt_model : ''}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-3">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-black text-emerald-600">{row.has_wifi ? (row.wifi_brand || 'Pending Mapping') : '-'}</span>
                                    <span className="text-[10px] font-bold text-emerald-500">{row.has_wifi ? row.wifi_model : ''}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-3 text-sm font-black text-amber-600">{row.effective_max_speed || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="shrink-0 border-t border-slate-100 bg-white">
                        <PaginationControls total={circuitTotal} limit={limit} page={circuitPage} setLimit={setLimit} setPage={setCircuitPage} jumpPage={circuitJumpPage} setJumpPage={setCircuitJumpPage} />
                      </div>
                    </div>

                    {/* --- No WiFi Section --- */}
                    {noWifiData.length > 0 && (
                      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                          <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl"><Shield size={20} /></div>
                          <div>
                            <h3 className="font-black text-slate-800">กลุ่ม ONU ที่ไม่มี WiFi ต่อพ่วง (Bridge Mode / FE)</h3>
                            <p className="text-xs font-bold text-slate-400">แยกตามยี่ห้อ (Top 10)</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {noWifiData.map((d, idx) => (
                            <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-1">
                              <span className="text-[10px] font-black uppercase text-slate-400">{d.source}</span>
                              <span className="text-sm font-black text-slate-700 truncate" title={d.brand}>{d.brand}</span>
                              <span className="text-xl font-black text-indigo-600 mt-2">{Number(d.circuit_count).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* --- Classic Overview (Tab B) --- */}
                {homeTab === 'overview' && dashboardStats && dashboardStats.summary && (
                  <div className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { label: 'รายการทั้งหมด', value: dashboardStats.summary.total_records, icon: <Layout size={20} />, color: 'bg-indigo-600', sub: 'รายการอุปกรณ์รวม' },
                        { label: 'ONU All In One', value: dashboardStats.summary.all_in_one_count, icon: <Zap size={20} />, color: 'bg-emerald-500', sub: 'WiFi ในตัว' },
                        { label: 'ONU + WiFi Router', value: dashboardStats.summary.wifi_router_count, icon: <Wifi size={20} />, color: 'bg-blue-500', sub: 'ต่อพ่วงภายนอก' },
                        { label: 'ONU Bridge Only', value: dashboardStats.summary.only_onu_count, icon: <Shield size={20} />, color: 'bg-slate-700', sub: 'ไม่มี WiFi' },
                      ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4 group hover:shadow-md transition-all">
                          <div className="flex items-center justify-between">
                            <div className={\`w-12 h-12 \${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform\`}>
                              {stat.icon}
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{stat.sub}</span>
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{Number(stat.value).toLocaleString()}</h3>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between group hover:border-amber-200 transition-all">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                            <AlertCircle size={28} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">รอดำเนินการ (ONU)</p>
                            <h3 className="text-2xl font-black text-amber-600 tracking-tight">{Number(dashboardStats.summary.pending_onu_mapping).toLocaleString()} <span className="text-sm text-slate-300 ml-1">รายการ</span></h3>
                          </div>
                        </div>
                        <button onClick={() => { setView('cpe'); setMappingTab('onu'); setPage(1); }} className="px-6 py-3 bg-amber-600 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-100 hover:bg-amber-700 transition-all">จัดการ</button>
                      </div>
                      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between group hover:border-rose-200 transition-all">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                            <AlertCircle size={28} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">รอดำเนินการ (WiFi)</p>
                            <h3 className="text-2xl font-black text-rose-600 tracking-tight">{Number(dashboardStats.summary.pending_wifi_mapping).toLocaleString()} <span className="text-sm text-slate-300 ml-1">รายการ</span></h3>
                          </div>
                        </div>
                        <button onClick={() => { setView('cpe'); setMappingTab('wifi'); setPage(1); }} className="px-6 py-3 bg-rose-600 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all">จัดการ</button>
                      </div>
                      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                            <AlertCircle size={28} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">รอดำเนินการ (Get OLT)</p>
                            <h3 className="text-2xl font-black text-indigo-600 tracking-tight">{Number(dashboardStats.summary.pending_onu_get_olt_mapping || 0).toLocaleString()} <span className="text-sm text-slate-300 ml-1">รุ่น</span></h3>
                          </div>
                        </div>
                        <button onClick={() => { setView('cpe'); setMappingTab('onu-get-olt'); setPage(1); }} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">จัดการ</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-black text-slate-800 flex items-center gap-3"><Zap className="text-emerald-500" /> All-In-One ONU Breakdown</h3>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ตามยี่ห้อ</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                          {(dashboardStats.all_in_one_by_brand || []).slice(0, 8).map((item: any, i: number) => {
                            const max = Math.max(...(dashboardStats.all_in_one_by_brand || []).map((x: any) => parseInt(x.count)), 1);
                            const pct = (parseInt(item.count) / max) * 100;
                            return (
                              <div key={i} className="space-y-1.5">
                                <div className="flex justify-between text-[11px] font-black uppercase">
                                  <span className="text-slate-500">{item.brand}</span>
                                  <span className="text-emerald-600">{Number(item.count).toLocaleString()}</span>
                                </div>
                                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: \`\${pct}%\` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-black text-slate-800 flex items-center gap-3"><Wifi className="text-blue-500" /> WiFi Router Breakdown</h3>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ตามยี่ห้อมาตรฐาน</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                          {(dashboardStats.wifi_router_by_brand || []).slice(0, 8).map((item: any, i: number) => {
                            const max = Math.max(...(dashboardStats.wifi_router_by_brand || []).map((x: any) => parseInt(x.count)), 1);
                            const pct = (parseInt(item.count) / max) * 100;
                            return (
                              <div key={i} className="space-y-1.5">
                                <div className="flex justify-between text-[11px] font-black uppercase">
                                  <span className="text-slate-500">{item.brand}</span>
                                  <span className="text-blue-600">{Number(item.count).toLocaleString()}</span>
                                </div>
                                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: \`\${pct}%\` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}`;

const startMarker = "{view === 'home' && (";
const startIdx = content.indexOf(startMarker, content.indexOf('<main'));

let openBrackets = 0;
let endIdx = -1;

for (let i = startIdx; i < content.length; i++) {
  if (content[i] === '{') openBrackets++;
  else if (content[i] === '}') {
    openBrackets--;
    // This looks for the matching ')' from `(view === 'home' && (` then the enclosing `}` if wrapped
    if (openBrackets === 0 && content.substring(i-2, i+1) === ')}' ) { 
      // Found the end of the block. But the block actually ends with ")}\n"
      endIdx = i + 1;
      break;
    }
  }
}

// Fallback logic using exact string
if (endIdx === -1) {
    const endMarker = `           </div>
          )}`;
    endIdx = content.indexOf(endMarker, startIdx) + endMarker.length;
}


if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + newHomeJSX + content.substring(endIdx);
  fs.writeFileSync(appTsxPath, content);
  console.log('Successfully replaced home view block');
} else {
  console.log('Could not find boundaries: startIdx =', startIdx, 'endIdx =', endIdx);
}
