import southlakeLogo from './assets/southlake-logo.png';
import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {createClient} from '@supabase/supabase-js';
import {LogOut, Plus, Camera, Send, CalendarDays, BriefcaseBusiness, Users, MessageCircle, Image as ImageIcon, RefreshCw, StickyNote, ClipboardList, Flag, Trash2, Pencil} from 'lucide-react';
import './style.css';

const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase=url&&key?createClient(url,key):null;
function App(){
 const [session,setSession]=useState(null),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const [jobs,setJobs]=useState([]),[selected,setSelected]=useState(''),[assignments,setAssignments]=useState([]),[notes,setNotes]=useState([]),[messages,setMessages]=useState([]),[photos,setPhotos]=useState([]);
 const [tab,setTab]=useState('jobs'),[note,setNote]=useState(''),[message,setMessage]=useState(''),[employee,setEmployee]=useState(''),[department,setDepartment]=useState('Flooring'),[assignDate,setAssignDate]=useState(new Date().toISOString().slice(0,10));
 const [jobTitle,setJobTitle]=useState(''),[jobLocation,setJobLocation]=useState('');
 const [changes,setChanges]=useState([]),[flags,setFlags]=useState([]);
 const [coTitle,setCoTitle]=useState(''),[coDetails,setCoDetails]=useState(''),[coSource,setCoSource]=useState('email'),[coAmount,setCoAmount]=useState('');
 const [flagTitle,setFlagTitle]=useState(''),[flagDetails,setFlagDetails]=useState(''),[flagTeams,setFlagTeams]=useState([]);
 const [featureReady,setFeatureReady]=useState(true);
 const historyRef=useRef([]);
 const [historyCount,setHistoryCount]=useState(0);
 const selectedRef=useRef('');
 selectedRef.current=selected;
 function navigate(nextTab,nextJob){
  const previous={tab,selected:selectedRef.current};
  const targetJob=nextJob===undefined?selectedRef.current:nextJob;
  if(previous.tab===nextTab&&previous.selected===targetJob)return;
  historyRef.current.push(previous);
  if(historyRef.current.length>40)historyRef.current.shift();
  setHistoryCount(historyRef.current.length);
  if(nextJob!==undefined)setSelected(nextJob);
  setTab(nextTab);
 }
 function goBack(){
  const previous=historyRef.current.pop();
  if(!previous)return;
  setHistoryCount(historyRef.current.length);
  setSelected(previous.selected);
  setTab(previous.tab);
 }

 useEffect(()=>{if(!supabase)return;supabase.auth.getSession().then(({data})=>setSession(data.session));const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));return()=>subscription.unsubscribe()},[]);
 useEffect(()=>{if(session)loadAll()},[session]);
 async function loadAll(){setBusy(true);const [j,a]=await Promise.all([supabase.from('jobs').select('*').order('created_at',{ascending:false}),supabase.from('assignments').select('*, jobs(title)').order('work_date',{ascending:true})]);if(j.error)setNotice(j.error.message);else{setJobs(j.data||[]);setSelected(old=>old&&j.data?.some(x=>x.id===old)?old:(j.data?.[0]?.id||''))}if(a.error)setNotice(a.error.message);else setAssignments(a.data||[]);setBusy(false)}
 useEffect(()=>{if(selected&&session){loadJobDetails();loadFeatures(selected)}},[selected,session]);
 async function loadJobDetails(){const [n,m,p]=await Promise.all([supabase.from('job_notes').select('*').eq('job_id',selected).order('created_at',{ascending:false}),supabase.from('job_messages').select('*').eq('job_id',selected).order('created_at',{ascending:true}),supabase.from('job_photos').select('*').eq('job_id',selected).order('created_at',{ascending:false})]);if(!n.error)setNotes(n.data||[]);if(!m.error)setMessages(m.data||[]);if(!p.error)setPhotos(p.data||[])}
 async function loadFeatures(jobId){
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
 async function signIn(e){e.preventDefault();setBusy(true);const {error}=await supabase.auth.signInWithPassword({email,password});setNotice(error?.message||'');setBusy(false)}
 async function addJob(e){e.preventDefault();const {data,error}=await supabase.from('jobs').insert({title:jobTitle,location:jobLocation,created_by:session.user.id}).select().single();if(error)setNotice(error.message);else{setJobTitle('');setJobLocation('');await loadAll();navigate('overview',data.id);setNotice('Job created.')}}
 async function addNote(e){e.preventDefault();if(!note.trim()||!selected)return;const {error}=await supabase.from('job_notes').insert({job_id:selected,body:note,created_by:session.user.id});if(error)setNotice(error.message);else{setNote('');await loadJobDetails();setNotice('Note saved.')}}
 async function addMessage(e){e.preventDefault();if(!message.trim()||!selected)return;const {error}=await supabase.from('job_messages').insert({job_id:selected,body:message,created_by:session.user.id});if(error)setNotice(error.message);else{setMessage('');await loadJobDetails()}}
 async function addAssignment(e){e.preventDefault();if(!employee.trim()||!selected)return;const {error}=await supabase.from('assignments').insert({job_id:selected,employee_label:employee.trim(),department,work_date:assignDate,created_by:session.user.id});if(error)setNotice(error.message);else{setEmployee('');await loadAll();setNotice('Assignment added.')}}
 async function removeAssignment(a){
  if(!window.confirm(`Remove ${a.employee_label} from ${a.department} on ${a.work_date}?`))return;
  const {data,error}=await supabase.from('assignments').delete().eq('id',a.id).select('id');
  if(error){setNotice(`Could not remove assignment: ${error.message}`);return}
  if(!data?.length){setNotice('Removal was not permitted. Check assignment database permissions.');return}
  await loadAll();setNotice(`${a.employee_label} removed from this assignment.`);
 }
 async function saveDrawing(blob){
  if(!selected||!blob)return;
  setBusy(true);
  const filename=`drawing-${new Date().toISOString().replace(/[:.]/g,'-')}.png`;
  const path=`${selected}/${Date.now()}-${filename}`;
  const {error:uploadError}=await supabase.storage.from('job-photos').upload(path,blob,{contentType:'image/png'});
  if(uploadError){setNotice(`Drawing upload failed: ${uploadError.message}`);setBusy(false);return}
  const {error}=await supabase.from('job_photos').insert({job_id:selected,storage_path:path,file_name:filename,uploaded_by:session.user.id});
  if(error){await supabase.storage.from('job-photos').remove([path]);setNotice(`Drawing could not be attached: ${error.message}`)}
  else{await loadJobDetails();setNotice('Drawing saved to job photos.');}
  setBusy(false);
 }
 async function uploadPhoto(e){const file=e.target.files?.[0];if(!file||!selected)return;const path=`${selected}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;const {error:upErr}=await supabase.storage.from('job-photos').upload(path,file);if(upErr){setNotice(upErr.message);return}const {error}=await supabase.from('job_photos').insert({job_id:selected,storage_path:path,file_name:file.name,uploaded_by:session.user.id});if(error)setNotice(error.message);else{await loadJobDetails();setNotice('Photo uploaded.')}e.target.value=''}
 if(!supabase)return <Setup/>;
 if(!session)return <main className="login"><div className="brand"><img className="brand-logo" src={southlakeLogo} alt="Southlake Flooring & Improvements"/><div><b>SOUTHLAKE</b><small>FLOORING & IMPROVEMENTS</small></div></div><section className="panel loginpanel"><h1>Welcome back.</h1><p>Southlake operations pilot</p><form onSubmit={signIn}><label>Email</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@southlakefloor.com"/><label>Password</label><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password"/><button className="primary" disabled={busy}>Sign in</button></form>{notice&&<p className="notice">{notice}</p>}<p className="fine">Pilot access is invitation-controlled. Do not use real customer-sensitive information until owner access and policies have been verified.</p></section></main>;
 const job=jobs.find(x=>x.id===selected);
 const tabs=[['overview','Overview'],['assignments','Assignments'],['notes','Notes'],['photos','Photos'],['messages','Messages'],['changes','Change orders'],['coordination','Coordination']];
 return <div className="app"><header><div className="brand compact"><img className="brand-logo" src={southlakeLogo} alt="Southlake Flooring & Improvements"/><div><b>SOUTHLAKE</b><small>OPERATIONS</small></div></div><div className="headright"><span className="pilot">PILOT</span><button className="iconbtn" title="Refresh" onClick={loadAll}><RefreshCw size={18}/></button><button className="iconbtn" title="Sign out" onClick={()=>supabase.auth.signOut()}><LogOut size={18}/></button></div></header>
 <main className="layout"><aside className="sidebar"><div className="sidehead">WORKSPACE</div><button className={tab==='jobs'?'active':''} onClick={()=>navigate('jobs')}><BriefcaseBusiness/> Jobs</button><button className={tab==='assignments'?'active':''} onClick={()=>navigate('assignments')}><CalendarDays/> Daily assignments</button><div className="sidehead">CURRENT JOBS</div>{jobs.map(j=><button key={j.id} className={'joblink '+(selected===j.id?'chosen':'')} onClick={()=>{navigate('overview',j.id)}}>{j.title}</button>)}{!jobs.length&&<p className="muted smallpad">No jobs yet.</p>}<div className="sidefoot">Signed in as<br/><b>{session.user.email}</b></div></aside>
 <section className="content"><div className="navigation-bar"><button type="button" className="back-one" onClick={goBack} disabled={historyCount===0} aria-label="Go back one page">← Back</button></div>{notice&&<div className="noticebar" onClick={()=>setNotice('')}>{notice} <span>×</span></div>}
 {tab==='jobs'&&<><div className="pagehead jobshead"><div><div className="eyebrow">SOUTHLAKE WORKSPACE</div><h1>Jobs</h1><p>All your projects in one place.</p></div><button className="primary" onClick={()=>{setJobTitle('');setJobLocation('');navigate('newjob')}}><Plus size={17}/> New Job</button></div><div className="jobgrid">{jobs.map(j=><button className="jobcard" key={j.id} onClick={()=>{navigate('overview',j.id)}}><span className="jobcardtop"><BriefcaseBusiness size={19}/><small>{j.status||'active'}</small></span><strong>{j.title}</strong><span className="joblocation">{j.location||'No location added'}</span><span className="jobopen">Open job <span>→</span></span></button>) }{!jobs.length&&<div className="panel emptyjobs"><h2>No jobs yet</h2><p className="muted">Create your first job to get Southlake's workspace started.</p><button className="primary" onClick={()=>navigate('newjob')}><Plus size={17}/> Create first job</button></div>}</div></>}
 {tab==='newjob'&&<><div className="pagehead"><div><div className="eyebrow">PROJECT SETUP</div><h1>New Job</h1><p>Create a separate workspace for this project.</p></div><button className="secondary" onClick={()=>navigate('jobs')}>Cancel</button></div><form className="panel createjob" onSubmit={addJob}><h2>Job details</h2><label>Job name / work-order name</label><input required value={jobTitle} onChange={e=>setJobTitle(e.target.value)} placeholder="e.g. Store 1042 — Flooring Refresh"/><label>Job location</label><input value={jobLocation} onChange={e=>setJobLocation(e.target.value)} placeholder="Store, street, city, state"/><button className="primary"><Plus size={17}/> Create job</button></form></>}
 {tab==='overview'&&<><div className="pagehead"><div><div className="eyebrow">PROJECT WORKSPACE</div><h1>{job?.title||'Your jobs'}</h1><p>{job?.location||'Select a job or create your first pilot job.'}</p></div><div className="head-actions"><span className="status">ACTIVE PILOT</span></div></div>{!job?<div className="panel"><h2>No job selected</h2></div>:<><div className="tabs">{tabs.map(([id,label])=><button key={id} className={tab===id?'selected':''} onClick={()=>navigate(id)}>{label}</button>)}</div><div className="cards"><div className="panel"><h3>Job snapshot</h3><p className="muted">Shared workspace for the people working this job.</p><div className="metricrow"><div><strong>{assignments.filter(a=>a.job_id===selected).length}</strong><small>Assignments</small></div><div><strong>{notes.length}</strong><small>Notes</small></div><div><strong>{photos.length}</strong><small>Photos</small></div></div></div><div className="panel"><h3>Quick actions</h3><div className="quick"><button onClick={()=>navigate('assignments')}><Users/> Assign a person</button><button onClick={()=>navigate('notes')}><StickyNote/> Add job note</button><button onClick={()=>navigate('photos')}><Camera/> Add photo</button><button onClick={()=>navigate('messages')}><MessageCircle/> Open job chat</button></div></div></div></>}</>}
 {job&&['assignments','notes','photos','messages','changes','coordination'].includes(tab)&&<div className="job-context"><span><b>{job.title}</b> · {job.location||'No location'}</span><div className="tabs context-tabs">{tabs.map(([id,label])=><button key={id} className={tab===id?'selected':''} onClick={()=>navigate(id)}>{label}</button>)}</div></div>}
 {tab==='assignments'&&<div className="panel"><h2>Daily assignments</h2><p className="muted">Choose a job, person, department and work date. This does not change permanent account permissions.</p>{!job?<p className="muted">Create or select a job first.</p>:<><p><b>Job:</b> {job.title}</p><form className="inlineform" onSubmit={addAssignment}><div><label>Employee name or number</label><input required value={employee} onChange={e=>setEmployee(e.target.value)} placeholder="Employee name / ID"/></div><div><label>Department</label><select value={department} onChange={e=>setDepartment(e.target.value)}><option>Flooring</option><option>Fixtures</option><option>Merchandise</option></select></div><div><label>Work date</label><input type="date" value={assignDate} onChange={e=>setAssignDate(e.target.value)}/></div><button className="primary"><Plus size={17}/> Assign</button></form><div className="list">{assignments.filter(a=>a.job_id===selected).map(a=><div className="listitem" key={a.id}><b>{a.employee_label}</b><span>{a.department}</span><time>{a.work_date}</time><button type="button" className="remove-assignment" title={`Remove ${a.employee_label} from assignment`} onClick={()=>removeAssignment(a)}><Trash2 size={16}/> Remove</button></div>)}{!assignments.some(a=>a.job_id===selected)&&<p className="muted">No assignments for this job yet.</p>}</div></>}</div>}
 {tab==='notes'&&<div className="panel"><h2>Job notes</h2>{!job?<p className="muted">Create or select a job first.</p>:<><p className="muted">Notes saved here are attached to {job.title}.</p><form onSubmit={addNote}><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Add an update, instruction, or issue..." required/><button className="primary"><Plus size={17}/> Add note</button></form><div className="drawing-section"><h3><Pencil size={18}/> Draw or sketch</h3><p className="muted">Use a finger, mouse or stylus. Save the sketch to this job’s Photos tab.</p><DrawingPad key={selected} onSave={saveDrawing} disabled={busy}/></div><div className="list">{notes.map(n=><article className="entry" key={n.id}><p>{n.body}</p><time>{new Date(n.created_at).toLocaleString()}</time></article>)}{!notes.length&&<p className="muted">No notes yet. Add the first update above.</p>}</div></>}</div>}
 {tab==='photos'&&<div className="panel"><h2>Job photos</h2>{!job?<p className="muted">Create or select a job first.</p>:<><p className="muted">Photos attached to {job.title}.</p><label className="upload"><Camera/> Choose photo<input type="file" accept="image/*" capture="environment" onChange={uploadPhoto}/></label><div className="photogrid">{photos.map(p=><Photo key={p.id} path={p.storage_path} name={p.file_name}/>)}</div><p className="fine">Photos are stored in the private pilot storage bucket.</p></>}</div>}
 {tab==='messages'&&<div className="panel"><h2>Job chat</h2>{!job?<p className="muted">Create or select a job first.</p>:<><p className="muted">Conversation for {job.title}. Messages are not approved change orders or official scope changes.</p><div className="chat">{messages.map(m=><div className="bubble" key={m.id}><p>{m.body}</p><time>{new Date(m.created_at).toLocaleString()}</time></div>)}{!messages.length&&<p className="muted">No messages yet. Start the conversation.</p>}</div><form className="sendform" onSubmit={addMessage}><input value={message} onChange={e=>setMessage(e.target.value)} placeholder="Write a message..." required/><button className="primary" aria-label="Send"><Send size={18}/></button></form></>}</div>}
 {tab==='changes'&&<div className="panel feature-panel"><div className="feature-heading"><ClipboardList/><div><h2>Change orders</h2><p className="muted">Track scope changes separately from informal chat. Drafts are not approvals.</p></div></div>
 {!featureReady?<p className="feature-warning">Feature database tables not installed yet. Apply the included SQL migration in Supabase before using this screen.</p>:!job?<p>Select a job first.</p>:<><form className="feature-form" onSubmit={addChange}><label>Change order title<input required value={coTitle} onChange={e=>setCoTitle(e.target.value)} placeholder="e.g. Additional floor prep"/></label><label>Description<textarea value={coDetails} onChange={e=>setCoDetails(e.target.value)} placeholder="What changed? Include the source and who requested it."/></label><div className="form-pair"><label>Request source<select value={coSource} onChange={e=>setCoSource(e.target.value)}><option value="email">Email</option><option value="text">Text message</option><option value="phone">Phone call</option><option value="onsite">On site</option><option value="other">Other</option></select></label><label>Estimated amount ($)<input type="number" min="0" step="0.01" value={coAmount} onChange={e=>setCoAmount(e.target.value)} placeholder="Optional"/></label></div><button className="primary"><Plus size={16}/> Add draft change order</button></form><div className="feature-list">{changes.map(c=><article className="feature-item" key={c.id}><div className="feature-item-head"><strong>{c.title}</strong><span className={'chip chip-'+c.status}>{c.status}</span></div><p>{c.description||'No description provided.'}</p><small>Source: {c.source} · {c.amount===null?'Amount pending':Number(c.amount).toLocaleString('en-US',{style:'currency',currency:'USD'})} · {new Date(c.created_at).toLocaleDateString()}</small><div className="feature-actions">{c.status==='draft'&&<button className="secondary" onClick={()=>changeStatus(c.id,'submitted')}>Mark submitted</button>}{c.status==='submitted'&&<><button className="secondary" onClick={()=>changeStatus(c.id,'approved')}>Record approval</button><button className="secondary" onClick={()=>changeStatus(c.id,'rejected')}>Reject</button></>}{c.status==='approved'&&<button className="secondary" onClick={()=>changeStatus(c.id,'completed')}>Mark completed</button>}</div></article>)}{changes.length===0&&<p className="muted">No change orders yet.</p>}</div></>}
 </div>}
 {tab==='coordination'&&<div className="panel feature-panel"><div className="feature-heading"><Flag/><div><h2>Team coordination</h2><p className="muted">Raise dependencies between Flooring, Fixtures and Merchandise.</p></div></div>
 {!featureReady?<p className="feature-warning">Feature database tables not installed yet. Apply the included SQL migration in Supabase before using this screen.</p>:!job?<p>Select a job first.</p>:<><form className="feature-form" onSubmit={addFlag}><label>Coordination issue<input required value={flagTitle} onChange={e=>setFlagTitle(e.target.value)} placeholder="e.g. Fixture layout needs flooring dimensions"/></label><label>Details<textarea value={flagDetails} onChange={e=>setFlagDetails(e.target.value)} placeholder="What does the other team need to know?"/></label><div className="check-row">{['Flooring','Fixtures','Merchandise'].map(team=><label key={team}><input type="checkbox" checked={flagTeams.includes(team)} onChange={e=>setFlagTeams(old=>e.target.checked?[...old,team]:old.filter(x=>x!==team))}/>{team}</label>)}</div><button className="primary"><Plus size={16}/> Flag for coordination</button></form><div className="feature-list">{flags.map(f=><article className="feature-item" key={f.id}><div className="feature-item-head"><strong>{f.title}</strong><span className={'chip chip-'+f.status}>{f.status}</span></div><p>{f.details||'No details provided.'}</p><small>Teams: {(f.affected_departments||[]).join(', ')||'All teams'} · {new Date(f.created_at).toLocaleDateString()}</small>{f.status==='open'&&<div className="feature-actions"><button className="secondary" onClick={()=>resolveFlag(f.id)}>Mark resolved</button></div>}</article>)}{flags.length===0&&<p className="muted">No coordination items yet.</p>}</div></>}
 </div>}
 </section></main><footer>Southlake Flooring & Improvements · Pilot build · {busy?'Syncing…':'Connected'}</footer></div>
}
function DrawingPad({onSave,disabled}){
 const canvasRef=useRef(null),drawingRef=useRef(false),lastRef=useRef(null);
 const [ink,setInk]=useState('#18364b'),[width,setWidth]=useState(3),[dirty,setDirty]=useState(false);
 useEffect(()=>{const c=canvasRef.current;if(!c)return;const ctx=c.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,c.width,c.height)},[]);
 function point(e){const r=canvasRef.current.getBoundingClientRect();return {x:(e.clientX-r.left)*canvasRef.current.width/r.width,y:(e.clientY-r.top)*canvasRef.current.height/r.height}}
 function down(e){if(disabled)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);drawingRef.current=true;lastRef.current=point(e)}
 function move(e){if(!drawingRef.current)return;e.preventDefault();const c=canvasRef.current,ctx=c.getContext('2d'),p=point(e),last=lastRef.current;ctx.strokeStyle=ink;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();lastRef.current=p;setDirty(true)}
 function up(){drawingRef.current=false;lastRef.current=null}
 function clear(){const c=canvasRef.current,ctx=c.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,c.width,c.height);setDirty(false)}
 function save(){canvasRef.current.toBlob(blob=>{if(blob)onSave(blob)},'image/png')}
 return <div className="drawing-pad"><div className="drawing-tools"><label>Pen <input aria-label="Pen color" type="color" value={ink} onChange={e=>setInk(e.target.value)}/></label><label>Width <select value={width} onChange={e=>setWidth(Number(e.target.value))}><option value="2">Fine</option><option value="4">Medium</option><option value="8">Thick</option></select></label><button type="button" className="secondary" onClick={clear} disabled={disabled}>Clear</button><button type="button" className="primary" onClick={save} disabled={disabled||!dirty}>Save drawing</button></div><canvas ref={canvasRef} width={1000} height={540} aria-label="Job sketch drawing surface" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} /></div>
}
function Photo({path,name}){const [src,setSrc]=useState('');useEffect(()=>{supabase.storage.from('job-photos').createSignedUrl(path,3600).then(({data})=>setSrc(data?.signedUrl||''))},[path]);return <div className="photo">{src?<img src={src} alt={name}/>:<ImageIcon/>}<small>{name}</small></div>}
function Setup(){return <main className="login"><section className="panel loginpanel"><h1>Southlake setup needed</h1><p>Add your Supabase project URL and publishable/anon key to the Vercel environment variables, then redeploy.</p><code>VITE_SUPABASE_URL</code><code>VITE_SUPABASE_ANON_KEY</code><p className="fine">Never add a service-role key to browser environment variables.</p></section></main>}
createRoot(document.getElementById('root')).render(<App/>);
