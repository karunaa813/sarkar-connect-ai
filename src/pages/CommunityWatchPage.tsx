import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { ShieldAlert, MapPin, Clock, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAuth, useComplaints } from '@/lib/store';
import { useNavigate } from 'react-router-dom';

export default function CommunityWatchPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { complaints, isLoading: complaintsLoading } = useComplaints();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  if (!user) return null;

  const alerts = complaints
    .filter(c => (c.priority === 'high' || c.priority === 'critical') && c.status !== 'resolved')
    .map(c => ({
      id: c.id,
      type: c.priority === 'critical' ? 'danger' : 'warning',
      title: c.title,
      location: c.location,
      time: new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      upvotes: c.votes || 0,
      active: true
    }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6 my-10">
          <div className="flex flex-col gap-4 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
               <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center relative">
                 <ShieldAlert className="w-7 h-7 text-destructive" />
                 <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                  </span>
               </div>
               <div>
                 <span className="text-[10px] font-black tracking-[0.3em] text-destructive uppercase block">Live Intel</span>
                 <h1 className="text-4xl font-display font-black text-white mt-0.5 tracking-tight uppercase">Community Watch</h1>
               </div>
            </div>
            <p className="text-muted-foreground font-medium max-w-xl text-lg opacity-80">
               Real-time local safety alerts and civic intelligence sourced from citizens.
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => alert('Radius feature expanding soon in beta.')} className="bg-white/5 text-white border-white/5 px-8 font-bold text-xs uppercase tracking-widest h-12">Change Radius</Button>
            <Button onClick={() => navigate('/dashboard')} className="bg-destructive hover:bg-destructive/90 text-white font-black px-10 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.2)] h-12 uppercase tracking-widest text-xs">Broadcast Alert</Button>
          </div>
        </header>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaintsLoading ? (
            <div className="col-span-full text-center py-10 text-muted-foreground">Loading Alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="col-span-full p-10 glass-card text-center border-white/5 flex flex-col items-center">
               <ShieldAlert className="w-12 h-12 text-muted-foreground/30 mb-4" />
               <p className="text-muted-foreground font-medium">No active high-priority alerts in your area.</p>
            </div>
          ) : (
            alerts.map((alert, idx) => (
              <motion.div 
                 key={alert.id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: idx * 0.1 }}
                 className={`glass-card p-6 border-l-4 relative overflow-hidden group hover:-translate-y-1 transition-transform ${
                   alert.type === 'danger' ? 'border-l-destructive' : 'border-l-warning'
                 }`}
              >
                 <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] -z-10 ${
                    alert.type === 'danger' ? 'bg-destructive/10' : 'bg-warning/10'
                 }`} />
                 
                 <div className="flex justify-between items-start mb-4">
                   <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                      alert.type === 'danger' ? 'bg-destructive/20 text-destructive border border-destructive/30' : 'bg-warning/20 text-warning border border-warning/30'
                   }`}>
                      {alert.type === 'danger' ? 'CRITICAL ALERT' : 'SAFETY WARNING'}
                   </div>
                   {alert.active && <span className="flex h-2 w-2 relative mt-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span></span>}
                 </div>

                 <h3 className="text-xl font-bold text-white mb-4 leading-tight">{alert.title}</h3>

                 <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground bg-white/[0.02] p-2 rounded-lg border border-white/[0.02]">
                       <MapPin className="w-4 h-4 text-primary" />
                       <span className="font-medium truncate">{alert.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground bg-white/[0.02] p-2 rounded-lg border border-white/[0.02]">
                       <Clock className="w-4 h-4 text-primary" />
                       <span className="font-medium">Detected {alert.time}</span>
                    </div>
                 </div>

                 <div className="flex gap-2">
                   <Button variant="ghost" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alert.location)}`, '_blank')} className="flex-1 bg-white/5 text-white font-bold text-[10px] uppercase tracking-widest h-10 border border-white/5 hover:bg-white/10">View Map <ArrowUpRight className="w-3 h-3 ml-2 opacity-50" /></Button>
                   <Button variant="ghost" onClick={() => (window as any).alert('Upvote recorded.')} className="w-[80px] bg-white/5 text-white font-bold text-[10px] h-10 border border-white/5 hover:bg-white/10">👍 {alert.upvotes}</Button>
                 </div>
              </motion.div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
