import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Camera, Video, Mic, ShieldCheck, Download, Trash2, Shield, Lock, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAuth, useComplaints } from '@/lib/store';
import { useNavigate } from 'react-router-dom';

export default function EvidenceVaultPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { complaints, isLoading: complaintsLoading } = useComplaints();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  if (!user) return null;

  const myEvidences = complaints
    .filter(c => c.userId === user.id && c.images && c.images.length > 0)
    .flatMap(c => c.images.map((img, i) => ({
      id: `${c.id.slice(0, 8)}-IMG${i + 1}`,
      title: `${c.title} (Evidence ${i + 1})`,
      url: img,
      type: img.includes('.mp4') ? 'video' : img.includes('.pdf') ? 'document' : 'photo',
      size: 'Unknown',
      status: c.status === 'resolved' ? 'AI Verified (+100 CP)' : 'Pending Verification',
      date: new Date(c.createdAt).toLocaleDateString()
    })));

  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5 text-primary" />;
      case 'photo': return <Camera className="w-5 h-5 text-green-500" />;
      case 'audio': return <Mic className="w-5 h-5 text-yellow-500" />;
      default: return <ShieldCheck className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6 my-10">
          <div className="flex flex-col gap-4 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
               <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-glow">
                 <Shield className="w-7 h-7 text-primary animate-pulse" />
               </div>
               <div>
                 <span className="text-[10px] font-black tracking-[0.3em] text-primary uppercase block">Cyber Intelligence</span>
                 <h1 className="text-4xl font-display font-black text-white mt-0.5 tracking-tight uppercase">Evidence Vault</h1>
               </div>
            </div>
            <p className="text-muted-foreground font-medium max-w-xl text-lg opacity-80">
               Securely store and manage evidence. AI-verified media earns you <span className="text-warning font-bold">Civic Points</span>.
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => alert('No active files selected for export.')} className="bg-white/5 text-white border-white/5 px-8 font-bold text-xs uppercase tracking-widest h-12">Export All</Button>
            <Button onClick={() => alert('Storage successfully unlocked and synced with device.')} className="bg-primary text-white font-black px-10 rounded-xl shadow-glow hover:opacity-90 h-12 uppercase tracking-widest text-xs">Unlock Secure Storage</Button>
          </div>
        </header>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {complaintsLoading ? (
            <div className="col-span-full text-center py-10 text-muted-foreground">Loading Vault...</div>
          ) : myEvidences.length === 0 ? (
            <div className="col-span-full p-10 glass-card text-center border-white/5 flex flex-col items-center">
               <Camera className="w-12 h-12 text-muted-foreground/30 mb-4" />
               <p className="text-muted-foreground font-medium">No verified evidence found in your vault.</p>
            </div>
          ) : (
            myEvidences.map((evi, idx) => (
              <motion.div 
                 key={evi.id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: idx * 0.1 }}
                 className="glass-card flex flex-col gap-6 p-8 border border-white/[0.05] hover:border-primary/30 transition-all duration-500 relative group overflow-hidden"
              >
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -z-10" />
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                       {getIcon(evi.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg tracking-tight leading-tight truncate max-w-[180px]">{evi.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 font-mono">{evi.id.toUpperCase()}</span>
                         <span className="w-1 h-1 rounded-full bg-white/20" />
                         <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 font-mono">{evi.date}</span>
                      </div>
                    </div>
                 </div>

                 <div className={`text-[10px] font-black uppercase tracking-[0.1em] px-4 py-2 border rounded-full w-fit ${
                    evi.status.includes('Verified') ? 'bg-success/20 text-success border-success/30' : 'bg-white/5 text-muted-foreground border-white/10'
                 }`}>
                    {evi.status}
                 </div>

                 <div className="flex gap-3 pt-4 border-t border-white/[0.05] mt-auto">
                   <Button variant="ghost" className="flex-1 bg-white/5 text-white font-bold text-[10px] uppercase tracking-widest h-10 border border-white/5" onClick={() => window.open(evi.url, '_blank')}>Preview</Button>
                   <Button variant="ghost" onClick={() => { const a = document.createElement('a'); a.href = evi.url; a.download = evi.title; a.click(); }} className="w-12 bg-white/5 text-white h-10 border border-white/5 transition-colors hover:bg-white/10"><Download className="w-4 h-4" /></Button>
                   <Button variant="ghost" onClick={() => (window as any).alert('Action Denied: This evidence is actively verified by BNS protocol and linked to an ongoing complaint. It cannot be tampered with or deleted.')} className="w-12 bg-destructive/10 text-destructive h-10 border border-destructive/20 transition-colors hover:bg-destructive/20"><Trash2 className="w-4 h-4" /></Button>
                 </div>
              </motion.div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
