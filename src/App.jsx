import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, Bell, Bookmark, Camera, Check, ChevronDown, Compass, Heart,
  Home, ImagePlus, MessageCircle, MoreHorizontal, Plus, Search, Send,
  Settings, ShieldCheck, Smile, Sparkles, UserPlus, Users, X, Globe2,
  LockKeyhole, CheckCheck, LogOut, Pencil, Trash2, Menu
} from "lucide-react";

const STORAGE_KEY = "circleup-frontend-v1";
const me = {
  id: "me", name: "Ayesha Almas", handle: "@ayesha.almas",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&crop=faces",
  cover: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&auto=format&fit=crop",
  bio: "Frontend developer in progress ✨ Building, learning, and sharing little wins.",
  location: "Lahore, Pakistan", website: "ayesha.dev"
};
const initialPosts = [
  { id: "p1", user: { name: "Ayesha Almas", handle: "@ayesha.almas", avatar: me.avatar }, text: "Starting a new project and turning ideas into something real. There’s something special about seeing your code come to life. 💻✨", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop", time: "12 min ago", likes: 18, comments: [{ id: "c1", name: "Hira Khan", text: "This looks amazing! Keep going ✨" }], liked: false, visibility: "Public", saved: false },
  { id: "p2", user: { name: "Hamza Ali", handle: "@hamza.codes", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces" }, text: "Small reminder: consistency beats perfection. One commit, one lesson, one step at a time.", image: "", time: "38 min ago", likes: 42, comments: [{ id: "c2", name: "Sara Noor", text: "Needed this today 🙌" }, { id: "c3", name: "Ayesha Almas", text: "Absolutely true!" }], liked: false, visibility: "Public", saved: false },
  { id: "p3", user: { name: "Sara Noor", handle: "@sara.noor", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=160&h=160&fit=crop&crop=faces" }, text: "Weekend inspiration board 🌿 What are you learning this week?", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&auto=format&fit=crop", time: "1 hr ago", likes: 27, comments: [], liked: false, visibility: "Public", saved: false }
];
const initialFriends = [
  { id: "f1", name: "Hira Khan", handle: "@hira.khan", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=faces", status: "friend" },
  { id: "f2", name: "Hamza Ali", handle: "@hamza.codes", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces", status: "friend" },
  { id: "f3", name: "Sara Noor", handle: "@sara.noor", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=160&h=160&fit=crop&crop=faces", status: "friend" }
];
const initialRequests = [
  { id: "r1", name: "Maham Raza", handle: "@maham.raza", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&h=160&fit=crop&crop=faces" },
  { id: "r2", name: "Usman Tariq", handle: "@usman.tariq", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop&crop=faces" }
];
const seed = {
  posts: initialPosts, friends: initialFriends, requests: initialRequests,
  notifications: [
    { id: "n1", text: "Hira Khan liked your post.", time: "5 min ago", read: false, kind: "like" },
    { id: "n2", text: "Maham Raza sent you a friend request.", time: "20 min ago", read: false, kind: "friend" },
    { id: "n3", text: "Sara Noor commented: “Absolutely love this!”", time: "1 hr ago", read: true, kind: "comment" }
  ],
  profile: me, privacy: "Friends", query: ""
};
function loadState() {
  try { return { ...seed, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
  catch { return seed; }
}
function Avatar({ src, name, size = "md", online = false }) {
  return <span className={`avatar avatar-${size}`}>{src ? <img src={src} alt={name} /> : name?.slice(0,1)}{online && <i className="online-dot" />}</span>;
}
function App() {
  const [data, setData] = useState(loadState);
  const [page, setPage] = useState("Home");
  const [mobileNav, setMobileNav] = useState(false);
  const [composer, setComposer] = useState("");
  const [postImage, setPostImage] = useState("");
  const [visibility, setVisibility] = useState("Public");
  const [search, setSearch] = useState("");
  const [commentDrafts, setCommentDrafts] = useState({});
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState(data.profile);
  const [toast, setToast] = useState("");
  const fileRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);
  // Cross-tab sync is a browser-storage demo, not a WebSocket connection.
  useEffect(() => {
    const sync = (event) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try { setData(prev => ({ ...prev, ...JSON.parse(event.newValue) })); } catch {}
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const notify = (text, kind = "activity") => {
    setData(prev => ({ ...prev, notifications: [{ id: crypto.randomUUID(), text, time: "Just now", read: false, kind }, ...prev.notifications] }));
  };
  const flash = (text) => {
    setToast(text);
    window.setTimeout(() => setToast(""), 2400);
  };
  const visiblePosts = useMemo(() => {
    let list = [...data.posts];
    if (page === "Profile") list = list.filter(p => p.user.handle === data.profile.handle);
    if (page === "Saved") list = list.filter(p => p.saved);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(p => `${p.user.name} ${p.text}`.toLowerCase().includes(q));
    return list;
  }, [data.posts, data.profile, page, search]);
  const update = (fn) => setData(prev => fn(prev));
  const createPost = () => {
    if (!composer.trim() && !postImage) return flash("Write something or add a photo first.");
    const post = {
      id: crypto.randomUUID(),
      user: { name: data.profile.name, handle: data.profile.handle, avatar: data.profile.avatar },
      text: composer.trim(), image: postImage, time: "Just now", likes: 0,
      comments: [], liked: false, visibility, saved: false
    };
    update(prev => ({ ...prev, posts: [post, ...prev.posts] }));
    setComposer(""); setPostImage(""); setVisibility("Public");
    flash("Your post is live!");
  };
  const toggleLike = (id) => update(prev => ({
    ...prev, posts: prev.posts.map(p => {
      if (p.id !== id) return p;
      const liked = !p.liked;
      if (liked && p.user.handle !== prev.profile.handle) {
        // Local demo notification: visible in this browser only.
      }
      return { ...p, liked, likes: Math.max(0, p.likes + (liked ? 1 : -1)) };
    })
  }));
  const addComment = (id) => {
    const text = (commentDrafts[id] || "").trim();
    if (!text) return;
    update(prev => ({ ...prev, posts: prev.posts.map(p => p.id === id ? { ...p, comments: [...p.comments, { id: crypto.randomUUID(), name: prev.profile.name, text }] } : p) }));
    setCommentDrafts(prev => ({ ...prev, [id]: "" }));
    flash("Comment added.");
  };
  const deletePost = (id) => {
    if (!window.confirm("Delete this post?")) return;
    update(prev => ({ ...prev, posts: prev.posts.filter(p => p.id !== id) }));
    flash("Post deleted.");
  };
  const deleteComment = (postId, commentId) => {
    update(prev => ({
      ...prev,
      posts: prev.posts.map(p => p.id === postId
        ? { ...p, comments: p.comments.filter(c => c.id !== commentId) }
        : p)
    }));
    flash("Comment deleted.");
  };
  const toggleSaved = (id) => {
    update(prev => ({ ...prev, posts: prev.posts.map(p => p.id === id ? { ...p, saved: !p.saved } : p) }));
  };
  const acceptRequest = (r) => {
    update(prev => ({ ...prev, requests: prev.requests.filter(x => x.id !== r.id), friends: [...prev.friends, { ...r, status: "friend" }], notifications: [{ id: crypto.randomUUID(), text: `You are now connected with ${r.name}.`, time: "Just now", read: false, kind: "friend" }, ...prev.notifications] }));
    flash(`You and ${r.name} are now friends.`);
  };
  const rejectRequest = (id) => update(prev => ({ ...prev, requests: prev.requests.filter(r => r.id !== id) }));
  const markNotificationsRead = () => update(prev => ({ ...prev, notifications: prev.notifications.map(n => ({ ...n, read: true })) }));
  const onImage = (event, target) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return flash("Please choose an image file.");
    if (file.size > 3 * 1024 * 1024) return flash("Please choose an image under 3 MB.");
    const reader = new FileReader();
    reader.onload = () => target === "post" ? setPostImage(String(reader.result)) : setProfileDraft(prev => ({ ...prev, avatar: String(reader.result) }));
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  const saveProfile = () => {
    update(prev => ({
      ...prev, profile: { ...profileDraft },
      posts: prev.posts.map(p => p.user.handle === prev.profile.handle ? { ...p, user: { ...p.user, name: profileDraft.name, handle: profileDraft.handle, avatar: profileDraft.avatar } } : p)
    }));
    setEditingProfile(false); flash("Profile updated.");
  };
  const navItems = [
    { name: "Home", icon: Home }, { name: "Explore", icon: Compass },
    { name: "Friends", icon: Users, count: data.requests.length },
    { name: "Notifications", icon: Bell, count: data.notifications.filter(n => !n.read).length },
    { name: "Saved", icon: Bookmark }, { name: "Profile", icon: Activity }
  ];
  const unread = data.notifications.filter(n => !n.read).length;

  return <div className="app-shell">
    <header className="topbar">
      <button className="mobile-menu icon-btn" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle menu"><Menu size={20}/></button>
      <button className="brand" onClick={() => setPage("Home")}><span className="brand-mark"><Sparkles size={19}/></span><span>circle<span className="brand-up">up</span></span></button>
      <div className="top-search"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search people, posts, and more..." /></div>
      <div className="top-actions">
        <button className="icon-btn notification-top" onClick={() => setPage("Notifications")} aria-label="Notifications"><Bell size={20}/>{unread > 0 && <i className="notification-dot"/>}</button>
        <button className="profile-chip" onClick={() => setPage("Profile")}><Avatar src={data.profile.avatar} name={data.profile.name} size="sm"/><span>{data.profile.name.split(" ")[0]}</span><ChevronDown size={15}/></button>
      </div>
    </header>

    <div className="layout">
      <aside className={`left-sidebar ${mobileNav ? "show-mobile" : ""}`}>
        <div className="side-profile">
          <div className="mini-cover" style={{ backgroundImage: `url(${data.profile.cover})` }} />
          <Avatar src={data.profile.avatar} name={data.profile.name} size="xl"/>
          <h3>{data.profile.name}</h3><p>{data.profile.handle}</p>
          <div className="profile-stats"><div><strong>{data.posts.filter(p => p.user.handle === data.profile.handle).length}</strong><span>Posts</span></div><div><strong>{data.friends.length}</strong><span>Friends</span></div><div><strong>128</strong><span>Following</span></div></div>
        </div>
        <nav className="main-nav">
          <p className="nav-label">MENU</p>
          {navItems.map(item => <button key={item.name} className={`nav-item ${page === item.name ? "active" : ""}`} onClick={() => { setPage(item.name); setMobileNav(false); if(item.name === "Notifications") markNotificationsRead(); }}>
            <item.icon size={19}/><span>{item.name}</span>{item.count > 0 && <b className="nav-count">{item.count}</b>}
          </button>)}
        </nav>
        <div className="sidebar-bottom"><button className={`nav-item ${page === "Settings" ? "active" : ""}`} onClick={() => {setPage("Settings");setMobileNav(false)}}><Settings size={19}/><span>Settings</span></button><div className="sidebar-note"><span className="note-icon"><ShieldCheck size={18}/></span><strong>Your space, your rules</strong><p>Manage your privacy and make CircleUp yours.</p><button onClick={() => setPage("Settings")}>Privacy settings <span>→</span></button></div></div>
      </aside>

      <main className="main-content">
        {page === "Home" && <>
          <div className="welcome-row"><div><p className="eyebrow">YOUR COMMUNITY</p><h1>Good to see you, {data.profile.name.split(" ")[0]} <span>✦</span></h1><p className="subheading">Here’s what’s happening in your circle today.</p></div><button className="primary-btn" onClick={() => document.getElementById("post-composer")?.scrollIntoView({ behavior: "smooth", block: "center" })}><Plus size={18}/> Create post</button></div>
          <section className="stories-card"><div className="section-heading"><div><h2>Your circle</h2><p>People you’re connected with</p></div><button className="text-btn" onClick={() => setPage("Friends")}>See all <span>→</span></button></div><div className="story-list"><button className="story add-story" onClick={() => setPage("Profile")}><span className="story-ring add-ring"><Plus size={23}/></span><span>Your story</span></button>{data.friends.map((f,i)=><button className="story" key={f.id} onClick={() => flash(`${f.name}'s profile preview`)}><span className={`story-ring ring-${i%4}`}><Avatar src={f.avatar} name={f.name} size="lg" online={i===0}/></span><span>{f.name.split(" ")[0]}</span></button>)}</div></section>
          <section className="composer card" id="post-composer"><div className="composer-top"><Avatar src={data.profile.avatar} name={data.profile.name} size="lg"/><textarea value={composer} onChange={e => setComposer(e.target.value)} placeholder={`What’s on your mind, ${data.profile.name.split(" ")[0]}?`} rows="2"/></div>{postImage && <div className="image-preview"><img src={postImage} alt="Selected post"/><button className="preview-remove" onClick={() => setPostImage("")}><X size={16}/></button></div>}<div className="composer-bottom"><div className="composer-tools"><button onClick={() => imageRef.current?.click()}><ImagePlus size={18}/><span>Photo</span></button><button onClick={() => setComposer(v => v + " 😊")}><Smile size={18}/><span>Feeling</span></button><label className="visibility-select"><Globe2 size={16}/><select value={visibility} onChange={e => setVisibility(e.target.value)}><option>Public</option><option>Friends</option><option>Private</option></select><ChevronDown size={13}/></label></div><button className="primary-btn post-btn" onClick={createPost}><Send size={16}/> Post</button></div><input ref={imageRef} type="file" accept="image/*" hidden onChange={e => onImage(e,"post")}/></section>
          <div className="feed-heading"><h2>Your feed <span className="live-pill"><i/> LIVE DEMO</span></h2><button className="sort-btn" onClick={() => flash("Showing newest posts first.")}>Latest <ChevronDown size={15}/></button></div>
          <div className="post-list">{visiblePosts.length ? visiblePosts.map(post => <Post key={post.id} post={post} profile={data.profile} onLike={toggleLike} onSave={toggleSaved} onDelete={deletePost} commentDraft={commentDrafts[post.id] || ""} setCommentDraft={value => setCommentDrafts(prev => ({...prev,[post.id]:value}))} onComment={() => addComment(post.id)} onDeleteComment={deleteComment} onProfile={() => setPage("Profile")}/>) : <Empty title="Nothing to show yet" text="Try another search or create your first post."/>}</div>
        </>}

        {page === "Explore" && <><PageHeader eyebrow="DISCOVER SOMETHING NEW" title="Explore" subtitle="Find ideas, people, and conversations worth following."/><div className="explore-banner"><div><span className="banner-kicker"><Sparkles size={15}/> YOUR NEXT CONNECTION</span><h2>Good things happen<br/>when we connect.</h2><p>Discover conversations and meet people who share your interests.</p><button className="light-btn" onClick={() => setPage("Friends")}>Find your people <span>→</span></button></div><div className="explore-art"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><Avatar src={data.friends[0]?.avatar} name="Friend" size="xl"/><span className="art-bubble bubble-one"><Heart size={18}/></span><span className="art-bubble bubble-two"><MessageCircle size={18}/></span><span className="art-bubble bubble-three"><Users size={18}/></span></div></div><div className="section-heading explore-title"><div><h2>Trending conversations</h2><p>Popular posts from your community</p></div></div><div className="post-list">{data.posts.filter(p => p.visibility === "Public").map(post => <Post key={post.id} post={post} profile={data.profile} onLike={toggleLike} onSave={toggleSaved} onDelete={deletePost} commentDraft={commentDrafts[post.id] || ""} setCommentDraft={value => setCommentDrafts(prev => ({...prev,[post.id]:value}))} onComment={() => addComment(post.id)} onDeleteComment={deleteComment} onProfile={() => setPage("Profile")}/>)}</div></>}

        {page === "Friends" && <><PageHeader eyebrow="YOUR PEOPLE" title="Friends & connections" subtitle="Build your circle, one connection at a time."/><div className="friends-tabs"><button className="selected">Friend requests <span>{data.requests.length}</span></button><button onClick={() => flash(`${data.friends.length} connections in your circle.`)}>All friends <span>{data.friends.length}</span></button></div>{data.requests.length > 0 ? <div className="request-grid">{data.requests.map(r=><div className="request-card card" key={r.id}><Avatar src={r.avatar} name={r.name} size="xl"/><h3>{r.name}</h3><p>{r.handle}</p><div className="request-actions"><button className="primary-btn" onClick={() => acceptRequest(r)}><Check size={16}/> Accept</button><button className="secondary-btn" onClick={() => rejectRequest(r.id)}>Remove</button></div></div>)}</div>:<Empty title="You're all caught up" text="You don't have any pending friend requests right now."/>}<div className="section-heading friends-heading"><div><h2>Your friends <span className="muted-count">{data.friends.length}</span></h2><p>The people in your circle</p></div><button className="secondary-btn" onClick={() => flash("Friend discovery demo is ready.")}><UserPlus size={16}/> Find friends</button></div><div className="friend-list card">{data.friends.map(f=><div className="friend-row" key={f.id}><Avatar src={f.avatar} name={f.name} size="lg" online/><div className="friend-info"><strong>{f.name}</strong><span>{f.handle}</span></div><span className="connected-label"><i/> Connected</span><button className="icon-btn" onClick={() => flash(`Opened ${f.name}'s conversation preview.`)} aria-label="Message friend"><MessageCircle size={18}/></button></div>)}</div></>}

        {page === "Notifications" && <><PageHeader eyebrow="STAY IN THE LOOP" title="Notifications" subtitle="The latest activity happening around your circle."/><div className="notification-toolbar"><span>{unread} unread updates</span><button className="text-btn" onClick={markNotificationsRead}><CheckCheck size={16}/> Mark all as read</button></div><div className="notification-list card">{data.notifications.length ? data.notifications.map(n=><div className={`notification-row ${!n.read?"unread":""}`} key={n.id}><span className={`notification-icon ${n.kind}`} >{n.kind==="like"?<Heart size={18}/>:n.kind==="friend"?<UserPlus size={18}/>:n.kind==="comment"?<MessageCircle size={18}/>:<Bell size={18}/>}</span><div className="notification-copy"><p>{n.text}</p><span>{n.time}</span></div>{!n.read && <i className="unread-dot"/>}</div>):<Empty title="All quiet here" text="New activity will appear here."/>}</div></>}

        {page === "Saved" && <><PageHeader eyebrow="KEEP WHAT MATTERS" title="Saved posts" subtitle="Your personal collection of posts to revisit."/><div className="post-list">{visiblePosts.length ? visiblePosts.map(post=><Post key={post.id} post={post} profile={data.profile} onLike={toggleLike} onSave={toggleSaved} onDelete={deletePost} commentDraft={commentDrafts[post.id]||""} setCommentDraft={value=>setCommentDrafts(prev=>({...prev,[post.id]:value}))} onComment={()=>addComment(post.id)} onDeleteComment={deleteComment} onProfile={()=>setPage("Profile")}/>):<Empty title="Your collection starts here" text="Tap the bookmark icon on any post to save it for later."/>}</div></>}

        {page === "Profile" && <><div className="profile-cover" style={{backgroundImage:`url(${data.profile.cover})`}}><button className="cover-edit" onClick={() => setEditingProfile(true)}><Pencil size={15}/> Edit profile</button></div><section className="profile-details card"><Avatar src={data.profile.avatar} name={data.profile.name} size="profile"/><div className="profile-details-main"><h1>{data.profile.name}</h1><p className="handle">{data.profile.handle}</p><p className="profile-bio">{data.profile.bio}</p><div className="profile-meta"><span><Compass size={15}/>{data.profile.location}</span><span><Globe2 size={15}/>{data.profile.website}</span></div><div className="profile-counts"><span><strong>{data.posts.filter(p=>p.user.handle===data.profile.handle).length}</strong> posts</span><span><strong>{data.friends.length}</strong> friends</span><span><strong>128</strong> following</span></div></div><button className="secondary-btn profile-edit-mobile" onClick={()=>setEditingProfile(true)}><Pencil size={15}/> Edit profile</button></section><div className="profile-post-heading"><h2>Your posts</h2><span>{data.posts.filter(p=>p.user.handle===data.profile.handle).length} posts</span></div><div className="post-list">{visiblePosts.length ? visiblePosts.map(post=><Post key={post.id} post={post} profile={data.profile} onLike={toggleLike} onSave={toggleSaved} onDelete={deletePost} commentDraft={commentDrafts[post.id]||""} setCommentDraft={value=>setCommentDrafts(prev=>({...prev,[post.id]:value}))} onComment={()=>addComment(post.id)} onDeleteComment={deleteComment} onProfile={()=>setPage("Profile")}/>):<Empty title="Your story begins here" text="Share a thought, photo, or milestone with your circle."/>}</div></>}

        {page === "Settings" && <><PageHeader eyebrow="MAKE IT YOURS" title="Settings & privacy" subtitle="Control your experience and choose what you share."/><div className="settings-layout"><div className="settings-menu card"><div className="settings-menu-item active"><ShieldCheck size={18}/> Privacy & safety</div><div className="settings-menu-item"><Bell size={18}/> Notifications</div><div className="settings-menu-item"><Settings size={18}/> Account preferences</div></div><div className="settings-panel card"><div className="settings-section-title"><span className="settings-icon"><LockKeyhole size={19}/></span><div><h2>Privacy & visibility</h2><p>Choose who can see your posts by default.</p></div></div><label className="setting-control"><span><strong>Default post audience</strong><small>New posts will use this audience unless changed.</small></span><select value={data.privacy} onChange={e=>update(prev=>({...prev,privacy:e.target.value}))}><option>Public</option><option>Friends</option><option>Private</option></select></label><div className="setting-info"><ShieldCheck size={17}/><p><strong>Demo privacy controls</strong><br/>These settings are saved in this browser. They don't provide server-side access control.</p></div><div className="settings-divider"/><div className="settings-section-title"><span className="settings-icon"><Bell size={19}/></span><div><h2>Notifications</h2><p>Keep up with activity from your circle.</p></div></div><label className="setting-control"><span><strong>Unread activity</strong><small>Mark all current notifications as read.</small></span><button className="secondary-btn" onClick={markNotificationsRead}>Mark as read</button></label><div className="settings-divider"/><div className="settings-section-title"><span className="settings-icon"><Activity size={19}/></span><div><h2>Local demo data</h2><p>Your posts and settings are stored in this browser.</p></div></div><button className="danger-btn" onClick={()=>{if(window.confirm("Reset all CircleUp demo data in this browser?")){localStorage.removeItem(STORAGE_KEY);setData(seed);flash("Demo data reset.");}}}><Trash2 size={16}/> Reset demo data</button></div></div></>}
        <footer className="main-footer"><span>© 2026 CircleUp</span><span>Made for meaningful connections <Heart size={12}/></span><span>About · Community · Privacy</span></footer>
      </main>

      <aside className="right-sidebar">
        <section className="right-widget card"><div className="widget-title"><h3>People you may know</h3><button onClick={()=>setPage("Friends")}>See all</button></div>{[{name:"Maham Raza",handle:"@maham.raza",avatar:"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&h=160&fit=crop&crop=faces"},{name:"Usman Tariq",handle:"@usman.tariq",avatar:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop&crop=faces"},{name:"Noor Fatima",handle:"@noor.fatima",avatar:"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&h=160&fit=crop&crop=faces"}].map(person=><div className="suggestion" key={person.handle}><Avatar src={person.avatar} name={person.name} size="md"/><div className="suggestion-info"><strong>{person.name}</strong><span>{person.handle}</span></div><button className="add-friend-btn" onClick={()=>{if(data.requests.some(r=>r.handle===person.handle)||data.friends.some(f=>f.handle===person.handle))return flash("Request already sent or connected.");update(prev=>({...prev,requests:[...prev.requests,{id:crypto.randomUUID(),...person}]}));flash("Demo friend request sent.");}} aria-label={`Add ${person.name}`}><Plus size={17}/></button></div>)}</section>
        <section className="right-widget trend-widget card"><div className="widget-title"><h3>Trending topics</h3><Compass size={17}/></div>{[["#WebDevelopment","2.4k posts"],["#CreativeMinds","1.8k posts"],["#DailyInspiration","960 posts"]].map(([tag,count],i)=><button className="trend-row" key={tag} onClick={()=>{setSearch(tag.slice(1));setPage("Explore");}}><span className="trend-number">0{i+1}</span><span><strong>{tag}</strong><small>{count}</small></span><MoreHorizontal size={17}/></button>)}</section>
        <section className="right-note"><div className="note-spark"><Sparkles size={16}/></div><p><strong>A little reminder</strong><br/>Your voice matters. Share something kind today.</p></section>
        <div className="right-legal">Privacy · Terms · Guidelines<br/>CircleUp is a frontend-only demo.</div>
      </aside>
    </div>
    {editingProfile && <div className="modal-backdrop" onClick={()=>setEditingProfile(false)}><div className="edit-modal card" onClick={e=>e.stopPropagation()}><div className="modal-heading"><div><h2>Edit your profile</h2><p>Let your circle know a little more about you.</p></div><button className="icon-btn" onClick={()=>setEditingProfile(false)}><X size={19}/></button></div><div className="edit-avatar-row"><Avatar src={profileDraft.avatar} name={profileDraft.name} size="xl"/><button className="secondary-btn" onClick={()=>fileRef.current?.click()}><Camera size={16}/> Change photo</button><input type="file" accept="image/*" hidden ref={fileRef} onChange={e=>onImage(e,"profile")}/></div><label className="field-label">Full name<input value={profileDraft.name} onChange={e=>setProfileDraft(p=>({...p,name:e.target.value}))}/></label><label className="field-label">Username<input value={profileDraft.handle} onChange={e=>setProfileDraft(p=>({...p,handle:e.target.value.startsWith("@")?e.target.value:"@"+e.target.value}))}/></label><label className="field-label">Bio<textarea rows="3" value={profileDraft.bio} onChange={e=>setProfileDraft(p=>({...p,bio:e.target.value}))}/></label><div className="modal-actions"><button className="secondary-btn" onClick={()=>setEditingProfile(false)}>Cancel</button><button className="primary-btn" onClick={saveProfile}><Check size={16}/> Save changes</button></div></div></div>}
    {toast && <div className="toast"><CheckCheck size={17}/>{toast}</div>}
  </div>;
}

function PageHeader({eyebrow,title,subtitle}) {
  return <div className="page-header"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="subheading">{subtitle}</p></div>;
}
function Empty({title,text}) {
  return <div className="empty-state card"><span><Sparkles size={22}/></span><h3>{title}</h3><p>{text}</p></div>;
}
function Post({post,profile,onLike,onSave,onDelete,onDeleteComment,commentDraft,setCommentDraft,onComment,onProfile}) {
  const own = post.user.handle === profile.handle;
  const [showComments,setShowComments] = useState(false);
  const [menu,setMenu] = useState(false);
  return <article className="post-card card"><div className="post-header"><button className="post-author" onClick={onProfile}><Avatar src={post.user.avatar} name={post.user.name} size="lg"/><span><strong>{post.user.name}</strong><small>{post.user.handle} <i>·</i> {post.time}</small></span></button><div className="post-menu-wrap"><button className="icon-btn" onClick={()=>setMenu(!menu)} aria-label="Post options"><MoreHorizontal size={20}/></button>{menu&&<div className="post-menu"><button onClick={()=>{onSave(post.id);setMenu(false)}}><Bookmark size={15}/>{post.saved?"Remove saved":"Save post"}</button>{own&&<button className="delete-option" onClick={()=>{onDelete(post.id);setMenu(false)}}><Trash2 size={15}/>Delete post</button>}</div>}</div></div>{post.text&&<p className="post-text">{post.text}</p>}{post.image&&<div className="post-media"><img src={post.image} alt="Post attachment"/></div>}<div className="post-audience"><span>{post.visibility==="Private"?<LockKeyhole size={12}/>:post.visibility==="Friends"?<Users size={12}/>:<Globe2 size={12}/>} {post.visibility||"Public"}</span></div><div className="post-stats"><span><span className="like-mini"><Heart size={11} fill="currentColor"/></span>{post.likes} likes</span><button onClick={()=>setShowComments(!showComments)}>{post.comments.length} comments</button></div><div className="post-actions"><button className={post.liked?"liked":""} onClick={()=>onLike(post.id)}><Heart size={18} fill={post.liked?"currentColor":"none"}/><span>{post.liked?"Liked":"Like"}</span></button><button className={showComments?"action-active":""} onClick={()=>setShowComments(!showComments)}><MessageCircle size={18}/><span>Comment</span></button><button onClick={()=>onSave(post.id)} className={post.saved?"action-active":""}><Bookmark size={18} fill={post.saved?"currentColor":"none"}/><span>{post.saved?"Saved":"Save"}</span></button><button onClick={()=>navigator.clipboard?.writeText(post.text||"Check out this post on CircleUp!")}><Send size={17}/><span>Share</span></button></div>{showComments&&<div className="comments-area">{post.comments.map(c=><div className="comment" key={c.id}><span className="comment-avatar">{c.name.slice(0,1)}</span><div className="comment-copy"><strong>{c.name}</strong><p>{c.text}</p></div>{c.name===profile.name&&<button className="comment-delete" style={{border:0,background:"transparent",color:"#c95050",cursor:"pointer",padding:6,marginLeft:"auto",alignSelf:"flex-start"}} onClick={()=>onDeleteComment(post.id,c.id)} aria-label="Delete comment" title="Delete comment"><Trash2 size={14}/></button>}</div>)}<div className="comment-input-row"><Avatar src={profile.avatar} name={profile.name} size="sm"/><input value={commentDraft} onChange={e=>setCommentDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onComment()} placeholder="Write a comment..."/><button onClick={onComment} aria-label="Send comment"><Send size={16}/></button></div></div>}</article>;
}
export default App;
