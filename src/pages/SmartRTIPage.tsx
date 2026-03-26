import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { FileText, Clock, AlertTriangle, CheckCircle, Search, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAuth, useRTIs } from '@/lib/store';
import { useNavigate } from 'react-router-dom';

export default function SmartRTIPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { rtis, isLoading: rtisLoading } = useRTIs();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <header className="mb-12 flex flex-col md:flex-row items-end justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-warning" />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-[0.2em] text-warning uppercase">Governance Oversight</span>
                <h1 className="text-4xl font-display font-bold text-white mt-1 uppercase">Smart RTI Vault</h1>
              </div>
            </div>
            <p className="text-muted-foreground text-lg max-w-xl">
              Automatic filing and tracking of Right to Information requests for delayed public services.
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" className="bg-white/5 text-white border-white/10 px-6">Filter Results</Button>
            <Button onClick={() => navigate('/dashboard')} className="bg-warning text-black font-bold px-8 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)]">File From Dashboard</Button>
          </div>
        </header>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rtisLoading ? (
            <div className="col-span-full text-center py-10 text-muted-foreground">Loading RTIs...</div>
          ) : rtis.length === 0 ? (
            <div className="col-span-full p-10 glass-card text-center border-white/5 flex flex-col items-center">
               <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
               <p className="text-muted-foreground font-medium">No Right to Information (RTI) requests filed yet.</p>
            </div>
          ) : (
            rtis.map((rti: any, idx: number) => (
              <motion.div 
                key={rti.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-6 border-l-4 border-l-warning group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-warning/5 rounded-full blur-[40px] -z-10 group-hover:bg-warning/10 transition-colors" />
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none block mb-1">{rti.rti_number}</span>
                    <h3 className="text-xl font-bold text-white group-hover:text-warning transition-colors">{rti.title}</h3>
                  </div>
                  <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    rti.status === 'approved' ? 'bg-success/20 text-success border border-success/30' : 'bg-warning/20 text-warning border border-warning/30'
                  }`}>
                    {rti.status}
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm py-2 border-b border-white/[0.05]">
                    <span className="text-muted-foreground">Department</span>
                    <span className="text-white font-medium capitalize">{rti.department}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-white/[0.05]">
                    <span className="text-muted-foreground">Filing Date</span>
                    <span className="text-white font-medium">{new Date(rti.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" className="flex-1 bg-white/5 text-white text-xs font-bold border-white/5">Track Updates</Button>
                  <Button 
                     variant="ghost" 
                     className="w-12 bg-white/5 text-white border-white/5"
                     onClick={() => alert('Download functionality coming soon...')}
                  >
                     <Download className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
