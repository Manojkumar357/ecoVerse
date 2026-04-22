import{c as b,x as g,h as i,l as e}from"./index-DDAhxD6v.js";import{S as w}from"./SignupAnimatedBackground-can1OgHj.js";import{B as f}from"./bell-BQY-woqA.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=b("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]]);function k(){const{username:n}=g(),[d,c]=i.useState([]),[m,h]=i.useState(!0),[x,p]=i.useState(null);i.useEffect(()=>{let t=!0;return(async()=>{try{const s=await fetch("/api/me/profile",{headers:{"X-Username":n||""}}).then(l=>l.json()),a=(s==null?void 0:s.role)==="teacher"?"/api/teacher/announcements":"/api/student/announcements",o=await fetch(a,{headers:{"X-Username":n||""}}).then(l=>l.json());if(!t)return;c(Array.isArray(o)?o:[])}finally{t&&h(!1)}})(),()=>{t=!1}},[n]);const u=[...d].sort((t,s)=>new Date(s.createdAt).getTime()-new Date(t.createdAt).getTime());return e.jsxs(w,{elementCount:20,className:"text-white",children:[e.jsx("div",{className:"absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse"}),e.jsx("div",{className:"absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse",style:{animationDelay:"1s"}}),e.jsxs("div",{className:"relative z-10 max-w-5xl mx-auto",children:[e.jsxs("div",{className:"bg-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-8 mb-8 hover:bg-white/10 transition-all duration-300 group",children:[e.jsxs("div",{className:"flex items-center gap-3 mb-2",children:[e.jsx(f,{size:36,className:"text-yellow-300 group-hover:scale-110 transition-transform"}),e.jsx("h1",{className:"text-4xl font-bold text-white/95 group-hover:text-white transition-colors",children:"Announcements"})]}),e.jsx("p",{className:"mt-2 text-white/70 group-hover:text-white/80 transition-colors",children:"Stay updated with the latest news and important updates"})]}),m?e.jsx("div",{className:"bg-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-8 text-center",children:e.jsxs("div",{className:"flex items-center justify-center gap-3",children:[e.jsx("div",{className:"w-8 h-8 rounded-full border-2 border-white/30 border-t-white/90 animate-spin"}),e.jsx("p",{className:"text-white/70",children:"Loading announcements..."})]})}):e.jsxs("div",{className:"space-y-4",children:[d.length===0&&e.jsxs("div",{className:"bg-gradient-to-r from-blue-500/10 to-transparent backdrop-blur-2xl border border-blue-400/30 shadow-2xl rounded-2xl p-12 text-center",children:[e.jsx(v,{size:48,className:"mx-auto mb-4 text-white/50"}),e.jsx("p",{className:"text-white/70 text-lg",children:"No announcements yet. Check back soon for updates!"})]}),u.map((t,s)=>{const r=x===t.id,a=new Date(t.createdAt),o=Date.now()-a.getTime()<24*60*60*1e3;return e.jsx("div",{className:"group cursor-pointer",style:{animation:`fadeInUp 0.6s ease-out ${s*.1}s both`},children:e.jsxs("div",{onClick:()=>p(r?null:t.id),className:`relative overflow-hidden rounded-2xl border transition-all duration-300 ${r?"bg-gradient-to-br from-white/15 to-white/5 border-white/30 shadow-2xl":"bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:from-white/15 hover:to-white/10 hover:border-white/30 hover:shadow-xl"}`,children:[o&&e.jsx("div",{className:"absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 animate-pulse"}),e.jsx("div",{className:"absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"}),e.jsxs("div",{className:"p-6 relative z-10",children:[e.jsxs("div",{className:"flex items-start justify-between mb-3",children:[e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-3 mb-2",children:[e.jsx("h3",{className:"text-xl font-bold text-white/95 group-hover:text-white transition-colors flex-1",children:t.title}),o&&e.jsx("span",{className:"text-xs bg-gradient-to-r from-yellow-400/30 to-orange-400/30 text-yellow-200 px-3 py-1 rounded-full border border-yellow-400/50 animate-pulse",children:"🔥 New"})]}),t.body&&e.jsx("p",{className:`text-sm text-white/70 transition-all ${r?"":"line-clamp-2"}`,children:t.body})]}),e.jsx("div",{className:"text-2xl transform transition-transform duration-300 ml-4",style:{transform:r?"rotate(180deg)":"rotate(0deg)"},children:"▼"})]}),e.jsxs("div",{className:"flex items-center gap-4 text-xs text-white/60 group-hover:text-white/70 transition-colors",children:[e.jsxs("span",{className:"flex items-center gap-1",children:["📅 ",a.toLocaleDateString()]}),e.jsxs("span",{className:"flex items-center gap-1",children:["🕐 ",a.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})]})]}),r&&t.body&&e.jsxs("div",{className:"mt-4 pt-4 border-t border-white/20 animate-in fade-in slide-in-from-top-2 duration-300",children:[e.jsx("div",{className:"prose prose-invert max-w-none",children:e.jsx("p",{className:"text-white/85 leading-relaxed whitespace-pre-wrap",children:t.body})}),e.jsx("div",{className:"mt-4 flex items-center gap-2 text-xs text-white/60",children:e.jsxs("span",{className:"flex items-center gap-1",children:["✓ Posted ",a.toLocaleDateString(void 0,{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})]})})]})]})]})},t.id)})]})]}),e.jsx("style",{children:`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .prose-invert {
          --tw-prose-body: rgba(255, 255, 255, 0.85);
          --tw-prose-headings: rgba(255, 255, 255, 0.95);
          --tw-prose-lead: rgba(255, 255, 255, 0.75);
          --tw-prose-links: #60a5fa;
          --tw-prose-bold: rgba(255, 255, 255, 0.95);
          --tw-prose-counters: #60a5fa;
          --tw-prose-bullets: rgba(255, 255, 255, 0.3);
          --tw-prose-hr: rgba(255, 255, 255, 0.1);
          --tw-prose-quotes: rgba(255, 255, 255, 0.7);
          --tw-prose-quote-borders: rgba(59, 130, 246, 0.5);
          --tw-prose-captions: rgba(255, 255, 255, 0.7);
          --tw-prose-code: rgba(255, 255, 255, 0.9);
          --tw-prose-pre-bg: rgba(0, 0, 0, 0.2);
          --tw-prose-pre-border: rgba(255, 255, 255, 0.1);
          --tw-prose-th-borders: rgba(255, 255, 255, 0.2);
          --tw-prose-td-borders: rgba(255, 255, 255, 0.1);
        }
      `})]})}export{k as default};
