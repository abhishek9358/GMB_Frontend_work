// import { useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { BarChart3 } from "lucide-react";
// import { generateIndexing } from "@/lib/gscDummy";
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

// export default function SearchConsoleIndexing() {
//   const data = generateIndexing();
//   const indexedPct = Math.round((data.indexed / Math.max(1, data.totalKnown)) * 100);
//   const [urls, setUrls] = useState("");
//   const [message, setMessage] = useState<string | null>(null);

//   const submit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const list = urls
//       .split(/\n|,/) // allow comma or newline
//       .map((s) => s.trim())
//       .filter((s) => s.length > 0);
//     if (list.length === 0) {
//       setMessage("Please enter at least one URL.");
//       return;
//     }
//     setMessage(`Submitted ${list.length} URL(s) for indexing. You'll see updates here once processed.`);
//     setUrls("");
//   };

//   const chartData = [
//     { name: "Indexed", value: data.indexed, color: "#22c55e" },
//     { name: "Not indexed", value: data.notIndexed, color: "#f59e0b" },
//   ];

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><BarChart3 className="w-6 h-6"/>Search Console • Indexing</h1>
//         <span className="text-xs text-gray-500">Business: {data.business.name} • Simulated data</span>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* First row - Coverage cards and Chart */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Coverage</CardTitle>
//             <CardDescription>Known pages and index status.</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="p-4 rounded-lg bg-green-50 border border-green-100">
//                 <p className="text-xs text-green-700">Indexed</p>
//                 <p className="text-2xl font-semibold text-green-800">{data.indexed}</p>
//               </div>
//               <div className="p-4 rounded-lg bg-blue-50 border border-amber-100">
//                 <p className="text-xs text-blue-700">Not indexed</p>
//                 <p className="text-2xl font-semibold text-amber-800">{data.notIndexed}</p>
//               </div>
//               <div className="col-span-2 p-4 rounded-lg bg-gray-50 border border-gray-100">
//                 <p className="text-xs text-gray-600">Indexed %</p>
//                 <p className="text-2xl font-semibold text-gray-900">{indexedPct}%</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Coverage chart</CardTitle>
//             <CardDescription>Visual breakdown of indexed vs not indexed.</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="h-64">
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie dataKey="value" data={chartData} nameKey="name" innerRadius={50} outerRadius={80}>
//                     {chartData.map((e, i) => (
//                       <Cell key={i} fill={e.color} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                   <Legend />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Index Coverage Over Time</CardTitle>
//             <CardDescription>Timeline showing indexed vs not indexed pages</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               <div className="flex gap-4 mb-4">
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-gray-400 rounded"></div>
//                   <span className="text-sm">Not indexed</span>
//                   <span className="text-sm font-semibold">{data.notIndexed}</span>
//                   <span className="text-xs text-gray-500">6 reasons</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-green-500 rounded"></div>
//                   <span className="text-sm">Indexed</span>
//                   <span className="text-sm font-semibold">{data.indexed}</span>
//                 </div>
//               </div>
              
//               <div className="h-48 relative">
//                 {/* Simplified timeline chart */}
//                 <div className="absolute bottom-6 left-8 right-0 h-32 flex items-end gap-1">
//                   {Array.from({length: 30}, (_, i) => {
//                     const indexedHeight = Math.random() * 0.6 + 0.4; // 40-100% indexed
//                     return (
//                       <div key={i} className="flex-1 flex flex-col">
//                         <div 
//                           className="bg-gray-400 w-full" 
//                           style={{height: `${(1 - indexedHeight) * 100}%`}}
//                         ></div>
//                         <div 
//                           className="bg-green-500 w-full" 
//                           style={{height: `${indexedHeight * 100}%`}}
//                         ></div>
//                       </div>
//                     );
//                   })}
//                 </div>
                
//                 {/* Y-axis labels */}
//                 <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-500">
//                   <span>240</span>
//                   <span>160</span>
//                   <span>80</span>
//                   <span>0</span>
//                 </div>
                
//                 {/* X-axis dates */}
//                 <div className="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-gray-500">
//                   <span>10/06</span>
//                   <span>21/06</span>
//                   <span>02/07</span>
//                   <span>13/07</span>
//                   <span>24/07</span>
//                   <span>04/08</span>
//                   <span>15/08</span>
//                   <span>26/08</span>
//                 </div>
//               </div>
              
//               <div className="pt-4 border-t">
//                 <div className="flex items-center gap-2 text-green-600 cursor-pointer hover:text-green-700">
//                   <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
//                     <span className="text-xs">✓</span>
//                   </div>
//                   <span className="text-sm font-medium">View data about indexed pages</span>
//                   <span className="text-xs">›</span>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Second row - Request indexing spanning all 3 columns */}
//         <Card className="lg:col-span-3">
//           <CardHeader>
//             <CardTitle>Request indexing</CardTitle>
//             <CardDescription>Paste page URLs to request indexing. Not indexed pages: {data.notIndexed}.</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={submit} className="space-y-3">
//               <textarea
//                 value={urls}
//                 onChange={(e)=>setUrls(e.target.value)}
//                 placeholder={data.suggestedUrls.slice(0,3).join("\n")}
//                 rows={5}
//                 className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <div className="flex items-center gap-2 flex-wrap">
//                 {data.suggestedUrls.map((u)=> (
//                   <button type="button" key={u} onClick={()=> setUrls((p)=> (p ? p+"\n" : "") + u)} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">
//                     {u}
//                   </button>
//                 ))}
//               </div>
//               <button type="submit" className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700">Submit indexing request</button>
//               {message && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">{message}</div>}
//             </form>
//           </CardContent>
//         </Card>

//         {/* Third row - Issues table spanning all 3 columns */}
//         <Card className="lg:col-span-3">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
//                 <span className="text-xs text-gray-600">i</span>
//               </div>
//               Why pages aren't indexed
//             </CardTitle>
//             <CardDescription>Pages that aren't indexed can't be served on Google</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="overflow-auto">
//               <table className="min-w-full text-sm">
//                 <thead>
//                   <tr className="text-left text-gray-600 border-b">
//                     <th className="py-3 pr-4 font-normal">Reason</th>
//                     <th className="py-3 pr-4 font-normal">Source</th>
//                     <th className="py-3 pr-4 font-normal">Validation</th>
//                     <th className="py-3 pr-4 font-normal">Trend</th>
//                     <th className="py-3 pr-4 font-normal text-right">Pages</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {data.issues.map((it, index) => (
//                     <tr key={it.reason} className="border-b border-gray-100 hover:bg-gray-50">
//                       <td className="py-3 pr-4 font-medium text-gray-900">{it.reason}</td>
//                       <td className="py-3 pr-4 text-gray-600">
//                         {it.reason.includes('Crawled') || it.reason.includes('Discovered') ? 'Google systems' : 'Website'}
//                       </td>
//                       <td className="py-3 pr-4">
//                         <div className="flex items-center gap-2">
//                           <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
//                             <span className="text-xs text-white">!</span>
//                           </div>
//                           <span className="text-gray-600 text-sm">Not Started</span>
//                         </div>
//                       </td>
//                       <td className="py-3 pr-4">
//                         <div className="w-16 h-6 bg-gray-100 rounded flex items-center justify-center">
//                           <div className="w-12 h-1 bg-gray-300 rounded"></div>
//                         </div>
//                       </td>
//                       <td className="py-3 text-right font-medium">{it.pages}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//               <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
//                 <div className="flex items-center gap-2">
//                   <span>Rows per page:</span>
//                   <select className="border border-gray-300 rounded px-2 py-1">
//                     <option>10</option>
//                   </select>
//                 </div>
//                 <div className="flex items-center gap-4">
//                   <span>1-6 of 6</span>
//                   <div className="flex gap-1">
//                     <button className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 disabled:opacity-50" disabled>
//                       <span className="text-xs">‹</span>
//                     </button>
//                     <button className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 disabled:opacity-50" disabled>
//                       <span className="text-xs">›</span>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { generateIndexing } from "@/lib/gscDummy";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function SearchConsoleIndexing() {
  const data = generateIndexing();
  const indexedPct = Math.round((data.indexed / Math.max(1, data.totalKnown)) * 100);
  const [urls, setUrls] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const list = urls
      .split(/\n|,/) // allow comma or newline
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (list.length === 0) {
      setMessage("Please enter at least one URL.");
      return;
    }
    setMessage(`Submitted ${list.length} URL(s) for indexing. You'll see updates here once processed.`);
    setUrls("");
  };

  const chartData = [
    { name: "Indexed", value: data.indexed, color: "#22c55e" },
    { name: "Not indexed", value: data.notIndexed, color: "#f59e0b" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><BarChart3 className="w-6 h-6"/>Search Console • Indexing</h1>
        <span className="text-xs text-gray-500">Business: {data.business.name} • Simulated data</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* First row - Coverage cards and Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Coverage</CardTitle>
            <CardDescription className="text-black">Known pages and index status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                <p className="text-xs text-green-700">Indexed</p>
                <p className="text-2xl font-semibold text-green-800">{data.indexed}</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-amber-100">
                <p className="text-xs text-blue-700">Not indexed</p>
                <p className="text-2xl font-semibold text-amber-800">{data.notIndexed}</p>
              </div>
              <div className="col-span-2 p-4 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-600">Indexed %</p>
                <p className="text-2xl font-semibold text-gray-900">{indexedPct}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coverage chart</CardTitle>
            <CardDescription className="text-black">Visual breakdown of indexed vs not indexed.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie dataKey="value" data={chartData} nameKey="name" innerRadius={50} outerRadius={80}>
                    {chartData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request indexing</CardTitle>
            <CardDescription className="text-black">Paste page URLs to request indexing. Not indexed pages: {data.notIndexed}.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-3">
              <textarea
                value={urls}
                onChange={(e)=>setUrls(e.target.value)}
                placeholder={data.suggestedUrls.slice(0,3).join("\n")}
                rows={5}
                className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2 flex-wrap">
                {data.suggestedUrls.map((u)=> (
                  <button type="button" key={u} onClick={()=> setUrls((p)=> (p ? p+"\n" : "") + u)} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">
                    {u}
                  </button>
                ))}
              </div>
              <button type="submit" className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700">Submit indexing request</button>
              {message && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">{message}</div>}
            </form>
          </CardContent>
        </Card>

        {/* Second row - Index Coverage Over Time spanning all 3 columns */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Index Coverage Over Time</CardTitle>
            <CardDescription>Timeline showing indexed vs not indexed pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                  <span className="text-sm">Not indexed</span>
                  <span className="text-sm font-semibold">{data.notIndexed}</span>
                  <span className="text-xs text-gray-500">6 reasons</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Indexed</span>
                  <span className="text-sm font-semibold">{data.indexed}</span>
                </div>
              </div>
              
              <div className="h-48 relative">
                {/* Timeline chart using real data */}
                <div className="absolute bottom-6 left-8 right-0 h-32 flex items-end gap-px">
                  {data.timeline.slice(-30).map((day, i) => {
                    const maxTotal = Math.max(...data.timeline.map(d => d.total));
                    const totalHeight = (day.total / maxTotal) * 100;
                    const indexedHeight = (day.indexed / day.total) * totalHeight;
                    const notIndexedHeight = totalHeight - indexedHeight;
                    
                    return (
                      <div key={i} className="flex-1 flex flex-col justify-end h-full group relative">
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                          <div>Date: {new Date(day.date).toLocaleDateString()}</div>
                          <div>Indexed: {day.indexed}</div>
                          <div>Not indexed: {day.notIndexed}</div>
                          <div>Total: {day.total}</div>
                        </div>
                        
                        {/* Not indexed (gray) */}
                        <div 
                          className="bg-gray-400 w-full transition-all duration-200 group-hover:bg-gray-500" 
                          style={{height: `${notIndexedHeight}%`}}
                        ></div>
                        {/* Indexed (green) */}
                        <div 
                          className="bg-green-500 w-full transition-all duration-200 group-hover:bg-green-600" 
                          style={{height: `${indexedHeight}%`}}
                        ></div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-500">
                  <span>{Math.max(...data.timeline.map(d => d.total))}</span>
                  <span>{Math.round(Math.max(...data.timeline.map(d => d.total)) * 0.67)}</span>
                  <span>{Math.round(Math.max(...data.timeline.map(d => d.total)) * 0.33)}</span>
                  <span>0</span>
                </div>
                
                {/* X-axis dates */}
                <div className="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-gray-500">
                  {[0, 5, 10, 15, 20, 25, 29].map(index => {
                    const date = new Date(data.timeline.slice(-30)[index]?.date);
                    return (
                      <span key={index}>
                        {date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                      </span>
                    );
                  })}
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-green-600 cursor-pointer hover:text-green-700">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                  <span className="text-sm font-medium">View data about indexed pages</span>
                  <span className="text-xs">›</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Third row - Issues table spanning all 3 columns */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xs text-gray-600">i</span>
              </div>
              Why pages aren't indexed
            </CardTitle>
            <CardDescription>Pages that aren't indexed can't be served on Google</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-black border-t">
                    <th className="py-3 pr-4 font-normal">Reason</th>
                    <th className="py-3 pr-4 font-normal">Source</th>
                    <th className="py-3 pr-4 font-normal">Validation</th>
                    <th className="py-3 pr-4 font-normal">Trend</th>
                    <th className="py-3 pr-4 font-normal text-right">Pages</th>
                  </tr>
                </thead>
                <tbody>
                  {data.issues.map((it, index) => (
                    <tr key={it.reason} className="border-black border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-3 pr-4 font-medium text-gray-900">{it.reason}</td>
                      <td className="py-3 pr-4 text-gray-600">
                        {it.reason.includes('Crawled') || it.reason.includes('Discovered') ? 'Google systems' : 'Website'}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">!</span>
                          </div>
                          <span className="text-gray-600 text-sm">Not Started</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="w-16 h-6 bg-gray-100 rounded flex items-center justify-center">
                          <div className="w-12 h-1 bg-gray-300 rounded"></div>
                        </div>
                      </td>
                      <td className="py-3 text-right font-medium">{it.pages}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <select className="border border-gray-300 rounded px-2 py-1">
                    <option>10</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <span>1-6 of 6</span>
                  <div className="flex gap-1">
                    <button className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 disabled:opacity-50" disabled>
                      <span className="text-xs">‹</span>
                    </button>
                    <button className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 disabled:opacity-50" disabled>
                      <span className="text-xs">›</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}