import React, { useState } from 'react';

// --- 1. Data Interfaces ---
interface Author { id: number; name: string; email: string; }
interface Book { id: number; title: string; authorId: number; }
interface Member { id: number; name: string; phone: string; }
interface Borrow { id: number; memberId: number; bookId: number; date: string; }

interface CardProps {
  title: string;
  sub: string;
  onEdit: () => void;
  onDelete: () => void;
  color?: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'authors' | 'books' | 'members' | 'borrow'>('authors');
  const [showModal, setShowModal] = useState(false);
  
  // --- 2. Simulated Database ---
  const [authors, setAuthors] = useState<Author[]>([
    { id: 1, name: "J.R.R. Tolkien", email: "tolkien@oxford.edu" },
    { id: 2, name: "George R.R. Martin", email: "grrm@westeros.com" }
  ]);
  const [books, setBooks] = useState<Book[]>([
    { id: 101, title: "The Hobbit", authorId: 1 },
    { id: 102, title: "A Game of Thrones", authorId: 2 }
  ]);
  const [members, setMembers] = useState<Member[]>([
    { id: 1001, name: "Alice Smith", phone: "555-0199" },
    { id: 1002, name: "Bob Jones", phone: "555-0200" }
  ]);
  const [borrows, setBorrows] = useState<Borrow[]>([]);

  // --- 3. Unified Form State ---
  const [editId, setEditId] = useState<number | null>(null);
  const [valA, setValA] = useState(''); 
  const [valB, setValB] = useState(''); 

  const openModal = (item?: any) => {
    if (item) {
      setEditId(item.id);
      if (activeTab === 'authors') { setValA(item.name); setValB(item.email); }
      if (activeTab === 'books') { setValA(item.title); setValB(String(item.authorId)); }
      if (activeTab === 'members') { setValA(item.name); setValB(item.phone); }
      if (activeTab === 'borrow') { setValA(String(item.memberId)); setValB(String(item.bookId)); }
    } else {
      setEditId(null);
      setValA('');
      setValB('');
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!valA || !valB) return;
    const id = editId || Date.now();

    if (activeTab === 'authors') {
      const data = { id, name: valA, email: valB };
      setAuthors(editId ? authors.map(a => a.id === editId ? data : a) : [data, ...authors]);
    } else if (activeTab === 'books') {
      const data = { id, title: valA, authorId: parseInt(valB) };
      setBooks(editId ? books.map(b => b.id === editId ? data : b) : [data, ...books]);
    } else if (activeTab === 'members') {
      const data = { id, name: valA, phone: valB };
      setMembers(editId ? members.map(m => m.id === editId ? data : m) : [data, ...members]);
    } else if (activeTab === 'borrow') {
      const data = { 
        id, 
        memberId: parseInt(valA), 
        bookId: parseInt(valB), 
        date: new Date().toLocaleDateString() 
      };
      setBorrows(editId ? borrows.map(br => br.id === editId ? data : br) : [data, ...borrows]);
    }
    closeModal();
  };

  const deleteItem = (id: number) => {
    if (activeTab === 'authors') setAuthors(authors.filter(a => a.id !== id));
    if (activeTab === 'books') setBooks(books.filter(b => b.id !== id));
    if (activeTab === 'members') setMembers(members.filter(m => m.id !== id));
    if (activeTab === 'borrow') setBorrows(borrows.filter(br => br.id !== id));
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setValA('');
    setValB('');
  };

  return (
    <div className="flex min-h-screen bg-[#00152b] text-white font-sans italic">
      {/* SIDEBAR */}
      <aside className="w-80 bg-[#000d1a] border-r-4 border-yellow-400 p-10 flex flex-col shadow-2xl">
        <h1 className="text-4xl font-black text-yellow-400 italic mb-12 tracking-tighter">TRAIL-LIBRARY</h1>
        <nav className="flex flex-col gap-4">
          {(['authors', 'books', 'members', 'borrow'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); closeModal(); }}
              className={`text-left px-8 py-5 rounded-2xl font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-yellow-400 text-black translate-x-3 shadow-[-10px_0_0_0_#fff]' : 'text-blue-300 hover:bg-blue-900/40'
              }`}
            >
              {tab === 'borrow' ? 'Borrow Bar' : tab}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN VIEW */}
      <main className="flex-1 p-16 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <h2 className="text-6xl font-black uppercase tracking-tighter italic">
            {activeTab} <span className="text-yellow-400">Deck</span>
          </h2>
          <button 
            onClick={() => openModal()}
            className="bg-yellow-400 text-black px-10 py-5 font-black uppercase shadow-[8px_8px_0_0_#fff] hover:bg-white transition-all active:translate-y-1 active:shadow-none"
          >
            + New Ticket
          </button>
        </header>

        {/* LISTS */}
        <div className="space-y-6">
          {activeTab === 'authors' && authors.map(a => (
            <Card key={a.id} title={a.name} sub={a.email} onEdit={() => openModal(a)} onDelete={() => deleteItem(a.id)} />
          ))}
          {activeTab === 'books' && books.map(b => (
            <Card key={b.id} title={b.title} sub={`Author ID: ${b.authorId}`} onEdit={() => openModal(b)} onDelete={() => deleteItem(b.id)} color="border-blue-500" />
          ))}
          {activeTab === 'members' && members.map(m => (
            <Card key={m.id} title={m.name} sub={m.phone} onEdit={() => openModal(m)} onDelete={() => deleteItem(m.id)} color="border-white" />
          ))}
          {activeTab === 'borrow' && borrows.map(br => {
            const member = members.find(m => m.id === br.memberId);
            const book = books.find(bk => bk.id === br.bookId);
            return (
              <Card 
                key={br.id} 
                title={`${member?.name || 'Unknown Member'} ➔ ${book?.title || 'Unknown Book'}`} 
                sub={`Trip Date: ${br.date}`} 
                onEdit={() => openModal(br)} 
                onDelete={() => deleteItem(br.id)} 
                color="border-green-500" 
              />
            );
          })}
        </div>

        {/* --- DYNAMIC MODAL --- */}
        {showModal && (
          <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 backdrop-blur-md">
            <div className="bg-white text-black w-full max-w-lg p-12 rounded-[50px] border-[12px] border-yellow-400 shadow-2xl">
              <h3 className="text-4xl font-black uppercase italic mb-8 border-b-8 border-blue-600 inline-block">
                {editId ? 'Modify' : 'New'} {activeTab}
              </h3>
              
              <div className="space-y-6 mb-10">
                {activeTab === 'borrow' ? (
                  /* THE NEW BORROW INTERACTION: SMART SELECTS */
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Select Passenger (Member)</label>
                      <select 
                        className="w-full p-6 bg-slate-100 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none font-bold text-xl"
                        value={valA}
                        onChange={e => setValA(e.target.value)}
                      >
                        <option value="">-- Choose Member --</option>
                        {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Select Cargo (Book)</label>
                      <select 
                        className="w-full p-6 bg-slate-100 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none font-bold text-xl"
                        value={valB}
                        onChange={e => setValB(e.target.value)}
                      >
                        <option value="">-- Choose Book --</option>
                        {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                      </select>
                    </div>
                  </>
                ) : (
                  /* REGULAR INTERACTION FOR OTHER TABS */
                  <>
                    <input 
                      placeholder={activeTab === 'books' ? "Book Title" : "Full Name"} 
                      className="w-full p-6 bg-slate-100 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none font-bold text-xl" 
                      value={valA} 
                      onChange={e => setValA(e.target.value)} 
                    />
                    <input 
                      placeholder={activeTab === 'authors' ? "Email" : activeTab === 'members' ? "Phone" : "Author ID"} 
                      className="w-full p-6 bg-slate-100 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none font-bold text-xl" 
                      value={valB} 
                      onChange={e => setValB(e.target.value)} 
                    />
                  </>
                )}
              </div>

              <div className="flex gap-4">
                <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-6 rounded-3xl font-black uppercase text-2xl shadow-lg active:scale-95 transition-all">Confirm</button>
                <button onClick={closeModal} className="flex-1 bg-slate-200 text-slate-500 py-6 rounded-3xl font-black uppercase text-xl">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- CARD COMPONENT ---
const Card = ({ title, sub, onEdit, onDelete, color = "border-yellow-400" }: CardProps) => (
  <div className={`flex justify-between items-center bg-[#001f3f] p-10 rounded-[40px] border-l-[15px] ${color} shadow-xl group hover:bg-blue-900/40 transition-all`}>
    <div className="non-italic">
      <h4 className="text-3xl font-black uppercase italic text-white">{title}</h4>
      <p className="text-blue-300 font-bold font-mono tracking-tighter">{sub}</p>
    </div>
    <div className="flex gap-6">
      <button onClick={onEdit} className="text-yellow-400 font-black uppercase text-xs border-b-2 border-yellow-400">Edit</button>
      <button onClick={onDelete} className="text-red-500 font-black uppercase text-xs border-b-2 border-red-500">Delete</button>
    </div>
  </div>
);

export default App;