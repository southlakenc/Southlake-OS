from pathlib import Path
p=Path('/mnt/data/southlake-v08/src/main.jsx')
s=p.read_text()
s=s.replace("RefreshCw, StickyNote}","RefreshCw, StickyNote, ClipboardList, Flag}")
s=s.replace("const [jobTitle,setJobTitle]=useState(''),[jobLocation,setJobLocation]=useState('');", """const [jobTitle,setJobTitle]=useState(''),[jobLocation,setJobLocation]=useState('');
 const [changes,setChanges]=useState([]),[flags,setFlags]=useState([]);
 const [coTitle,setCoTitle]=useState(''),[coDetails,setCoDetails]=useState(''),[coSource,setCoSource]=useState('email'),[coAmount,setCoAmount]=useState('');
 const [flagTitle,setFlagTitle]=useState(''),[flagDetails,setFlagDetails]=useState(''),[flagTeams,setFlagTeams]=useState([]);
 const [featureReady,setFeatureReady]=useState(true);""")
s=s.replace("useEffect(()=>{if(selected&&session)loadJobDetails()},[selected,session]);", "useEffect(()=>{if(selected&&session){loadJobDetails();loadFeatures(selected)}},[selected,session]);")
marker=' async function signIn(e)'
insert=""" async function loadFeatures(jobId){
  const [c,f]=await Promise.all([
   supabase.from('job_change_orders').select('*').eq('job_id',jobId).order('created_at',{ascending:false}),
   supabase.from('job_coordination_flags').select('*').eq('job_id',jobId).order('created_at',{ascending:false})
  ]);
  if(c.error||f.error){setFeatureReady(false);setChanges([]);setFlags([])}
  else{setFeatureReady(true);setChanges(c.data||[]);setFlags(f.data||[])}
 }
 async function addChange(e){e.preventDefault();if(!selected||!coTitle.trim())return;
  const {error}=await supabase.from('job_change_orders').insert({job_id:selected,title:coTitle.trim(),description:coDetails.trim(),source:coSource,amount:coAmount===''?null:Number(coAmount),created_by:session.user.id});
  if(error){setNotice(error.message);return}setCoTitle('');setCoDetails('');setCoAmount('');await loadFeatures(selected);setNotice('Change order saved as draft.');
 }
 async function changeStatus(id,status){
  const {error}=await supabase.from('job_change_orders').update({status}).eq('id',id);
  if(error)setNotice(error.message);else await loadFeatures(selected);
 }
 async function addFlag(e){e.preventDefault();if(!selected||!flagTitle.trim())return;
  const {error}=await supabase.from('job_coordination_flags').insert({job_id:selected,title:flagTitle.trim(),details:flagDetails.trim(),affected_departments:flagTeams,created_by:session.user.id});
  if(error){setNotice(error.message);return}setFlagTitle('');setFlagDetails('');setFlagTeams([]);await loadFeatures(selected);setNotice('Coordination item created.');
 }
 async function resolveFlag(id){
  const {error}=await supabase.from('job_coordination_flags').update({status:'resolved',resolved_at:new Date().toISOString()}).eq('id',id);
  if(error)setNotice(error.message);else await loadFeatures(selected);
 }
"""
s=s.replace(marker,insert+marker)
s=s.replace("['photos','Photos'],['messages','Messages']", "['photos','Photos'],['messages','Messages'],['changes','Change orders'],['coordination','Coordination']")
# tabs visible on all job pages, not just overview; shared job header
s=s.replace("{tab==='assignments'&&<div className=\"panel\">", """{job&&['assignments','notes','photos','messages','changes','coordination'].includes(tab)&&<div className="job-context"><span><b>{job.title}</b> · {job.location||'No location'}</span><div className="tabs context-tabs">{tabs.map(([id,label])=><button key={id} className={tab===id?'selected':''} onClick={()=>navigate(id)}>{label}</button>)}</div></div>}
 {tab==='assignments'&&<div className="panel">""")
needle=' </section></main><footer>'
new=""" {tab==='changes'&&<div className="panel feature-panel"><div className="feature-heading"><ClipboardList/><div><h2>Change orders</h2><p className="muted">Track scope changes separately from informal chat. Drafts are not approvals.</p></div></div>
 {!featureReady?<p className="feature-warning">Feature database tables not installed yet. Apply the included SQL migration in Supabase before using this screen.</p>:!job?<p>Select a job first.</p>:<><form className="feature-form" onSubmit={addChange}><label>Change order title<input required value={coTitle} onChange={e=>setCoTitle(e.target.value)} placeholder="e.g. Additional floor prep"/></label><label>Description<textarea value={coDetails} onChange={e=>setCoDetails(e.target.value)} placeholder="What changed? Include the source and who requested it."/></label><div className="form-pair"><label>Request source<select value={coSource} onChange={e=>setCoSource(e.target.value)}><option value="email">Email</option><option value="text">Text message</option><option value="phone">Phone call</option><option value="onsite">On site</option><option value="other">Other</option></select></label><label>Estimated amount ($)<input type="number" min="0" step="0.01" value={coAmount} onChange={e=>setCoAmount(e.target.value)} placeholder="Optional"/></label></div><button className="primary"><Plus size={16}/> Add draft change order</button></form><div className="feature-list">{changes.map(c=><article className="feature-item" key={c.id}><div className="feature-item-head"><strong>{c.title}</strong><span className={'chip chip-'+c.status}>{c.status}</span></div><p>{c.description||'No description provided.'}</p><small>Source: {c.source} · {c.amount===null?'Amount pending':Number(c.amount).toLocaleString('en-US',{style:'currency',currency:'USD'})} · {new Date(c.created_at).toLocaleDateString()}</small><div className="feature-actions">{c.status==='draft'&&<button className="secondary" onClick={()=>changeStatus(c.id,'submitted')}>Mark submitted</button>}{c.status==='submitted'&&<><button className="secondary" onClick={()=>changeStatus(c.id,'approved')}>Record approval</button><button className="secondary" onClick={()=>changeStatus(c.id,'rejected')}>Reject</button></>}{c.status==='approved'&&<button className="secondary" onClick={()=>changeStatus(c.id,'completed')}>Mark completed</button>}</div></article>)}{changes.length===0&&<p className="muted">No change orders yet.</p>}</div></>}
 </div>}
 {tab==='coordination'&&<div className="panel feature-panel"><div className="feature-heading"><Flag/><div><h2>Team coordination</h2><p className="muted">Raise dependencies between Flooring, Fixtures and Merchandise.</p></div></div>
 {!featureReady?<p className="feature-warning">Feature database tables not installed yet. Apply the included SQL migration in Supabase before using this screen.</p>:!job?<p>Select a job first.</p>:<><form className="feature-form" onSubmit={addFlag}><label>Coordination issue<input required value={flagTitle} onChange={e=>setFlagTitle(e.target.value)} placeholder="e.g. Fixture layout needs flooring dimensions"/></label><label>Details<textarea value={flagDetails} onChange={e=>setFlagDetails(e.target.value)} placeholder="What does the other team need to know?"/></label><div className="check-row">{['Flooring','Fixtures','Merchandise'].map(team=><label key={team}><input type="checkbox" checked={flagTeams.includes(team)} onChange={e=>setFlagTeams(old=>e.target.checked?[...old,team]:old.filter(x=>x!==team))}/>{team}</label>)}</div><button className="primary"><Plus size={16}/> Flag for coordination</button></form><div className="feature-list">{flags.map(f=><article className="feature-item" key={f.id}><div className="feature-item-head"><strong>{f.title}</strong><span className={'chip chip-'+f.status}>{f.status}</span></div><p>{f.details||'No details provided.'}</p><small>Teams: {(f.affected_departments||[]).join(', ')||'All teams'} · {new Date(f.created_at).toLocaleDateString()}</small>{f.status==='open'&&<div className="feature-actions"><button className="secondary" onClick={()=>resolveFlag(f.id)}>Mark resolved</button></div>}</article>)}{flags.length===0&&<p className="muted">No coordination items yet.</p>}</div></>}
 </div>}
"""
assert needle in s
s=s.replace(needle,new+needle)
p.write_text(s)
css=Path('/mnt/data/southlake-v08/src/style.css')
with css.open('a') as f:f.write('''
/* v0.8 shared job features */
.job-context{margin-bottom:18px;padding:14px 16px 0;background:#fff;border:1px solid #e2e7eb;border-radius:13px;overflow:hidden}.job-context>span{display:block;font-size:13px;color:#64727c;margin-bottom:10px}.context-tabs{margin-bottom:0}.feature-heading{display:flex;align-items:center;gap:12px;margin-bottom:22px}.feature-heading>svg{width:28px;height:28px;color:#997348}.feature-heading h2{margin:0}.feature-heading p{margin:4px 0}.feature-form{display:grid;gap:12px;padding:18px;background:#f7f8f9;border-radius:12px}.feature-form label{display:grid;gap:7px}.feature-form input,.feature-form textarea,.feature-form select{width:100%}.feature-form textarea{min-height:90px}.form-pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}.feature-form .primary{justify-self:start}.feature-list{margin-top:20px}.feature-item{padding:18px 0;border-bottom:1px solid #e6e9eb}.feature-item p{white-space:pre-wrap;color:#4a5b68;font-size:13px}.feature-item small{color:#77858e}.feature-item-head{display:flex;justify-content:space-between;gap:12px;align-items:center}.chip{padding:5px 9px;background:#e8edf0;border-radius:20px;font-size:11px;text-transform:capitalize}.chip-approved,.chip-resolved,.chip-completed{background:#dff3e7;color:#246344}.chip-open,.chip-submitted{background:#fff0d7;color:#795416}.chip-rejected{background:#fbe7e5;color:#913f3f}.feature-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.feature-actions button{padding:8px 12px;border-radius:8px;border:1px solid #d9e0e5;background:#fff}.check-row{display:flex;flex-wrap:wrap;gap:18px}.check-row label{display:flex;align-items:center;gap:6px}.check-row input{width:auto}.feature-warning{padding:14px;background:#fff2dc;color:#75521b;border-radius:9px}
@media(max-width:600px){.form-pair{grid-template-columns:1fr}.feature-panel{padding:16px}.feature-form{padding:12px}.context-tabs{overflow-x:auto}}
''')
