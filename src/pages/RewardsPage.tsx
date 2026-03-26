import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { 
  Trophy, Star, ShieldCheck, Zap, 
  MapPin, Book, Lock, Clock,
  ChevronRight, Award, TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth, useComplaints, useRewards } from '@/lib/store';
import { useNavigate } from 'react-router-dom';

const earnings = [
  { icon: ShieldCheck, title: 'Verified Incident Reports', desc: 'Points awarded for reports verified by authorities', points: '+150', color: 'text-primary' },
  { icon: Zap, title: 'AI-Verified Evidence', desc: 'High-quality photo/video evidence confirmed by AI', points: '+100', color: 'text-yellow-500' },
  { icon: MapPin, title: 'Community Safety Alerts', desc: 'Sharing localized alerts that help your neighbors', points: '+50', color: 'text-green-500' },
  { icon: Award, title: 'Monthly Contributor Bonus', desc: 'Consistent activity and responsibility reward', points: '+200', color: 'text-purple-500' },
];

const rewardsList = [
  { icon: MapPin, title: 'Public Parking Credits', desc: 'Get 1 month of premium parking in city zones', cost: 500, category: 'Commute' },
  { icon: Book, title: 'Public Library Premium', desc: 'Unlock access to digital archives and 24/7 labs', cost: 300, category: 'Education' },
  { icon: Lock, title: 'Digital Locker Premium', desc: 'Secure document storage with legal advisory', cost: 800, category: 'Digital Identity' },
  { icon: Clock, title: 'Priority Grievance Queue', desc: 'Escalate your complaints for faster resolution', cost: 1200, category: 'Governance' },
];

export default function CivicRewardsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { complaints } = useComplaints();
  const { redemptions, redeem } = useRewards();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  if (!user) return null;

  const myComplaints = complaints.filter(c => c.userId === user.id);
  const myAlerts = myComplaints.filter(c => c.priority === 'high' || c.priority === 'critical');
  
  // Calculate raw points earned
  const pointsFromReports = myComplaints.filter(c => c.status === 'resolved').length * 150 
                          + myComplaints.filter(c => c.status !== 'resolved').length * 50;
  const pointsFromEvidence = myComplaints.reduce((acc, c) => acc + (c.images?.length || 0) * 100, 0);
  const pointsFromAlerts = myAlerts.length * 50;
  const pointsFromVotes = myComplaints.reduce((acc, c) => acc + (c.votes || 0) * 10, 0);
  const totalEarnedPoints = pointsFromReports + pointsFromEvidence + pointsFromAlerts + pointsFromVotes;
  
  // Deduction for redeemed rewards
  const spentPoints = redemptions.reduce((acc: number, r: any) => acc + (r.cost || 0), 0);
  
  // Bonus point logic
  const currentPoints = totalEarnedPoints - spentPoints + (user.civic_points || 0);

  let nextTierPoints = 2000;
  let statusLevel = "Silver Citizen";
  if (currentPoints < 1000) { nextTierPoints = 1000; statusLevel = "Bronze Citizen"; }
  else if (currentPoints >= 2000 && currentPoints < 5000) { nextTierPoints = 5000; statusLevel = "Gold Citizen"; }
  else if (currentPoints >= 5000) { nextTierPoints = 10000; statusLevel = "Platinum Citizen"; }

  const progress = Math.min((currentPoints / nextTierPoints) * 100, 100);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <section className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-10 relative overflow-hidden flex flex-col items-center text-center max-w-4xl mx-auto border-t-[3px] border-t-warning"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-warning/5 blur-[100px] -z-10" />

            {/* Current Status */}
            <div className="w-20 h-20 rounded-full bg-warning/10 border-2 border-warning/50 flex items-center justify-center mb-6">
              <Star className="w-10 h-10 text-warning" />
            </div>
            
            <h1 className="text-4xl font-display font-bold text-white mb-2">CIVIC REWARDS</h1>
            <p className="text-muted-foreground font-medium mb-12">Empowering active citizens through accountability and service.</p>

            {/* Points & Progress Bar */}
            <div className="w-full max-w-2xl">
              <div className="flex justify-between items-end mb-4">
                <div className="text-left">
                  <span className="text-sm font-bold tracking-widest text-muted-foreground uppercase opacity-70">Current Balance</span>
                  <div className="text-5xl font-black text-white flex items-center gap-3">
                    {currentPoints.toLocaleString()} <span className="text-xl text-warning">CP</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold tracking-widest text-muted-foreground uppercase opacity-70">Status Level</span>
                  <div className="text-2xl font-bold bg-gradient-to-r from-slate-400 to-slate-200 bg-clip-text text-transparent">
                    {statusLevel}
                  </div>
                </div>
              </div>

              {/* Enhanced Progress Bar */}
              <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-1 mb-4">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-warning to-amber-600 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)25%,transparent 25%,transparent 50%,rgba(255,255,255,0.2)50%,rgba(255,255,255,0.2)75%,transparent 75%,transparent)] bg-[length:20px_20px] animate-[loading-bar_1s_linear_infinite]" />
                </motion.div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                <span className="text-white font-bold">{Math.max(nextTierPoints - currentPoints, 0)} points remaining</span> until you unlock next tier.
              </p>
            </div>
          </motion.div>
        </section>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Earning History Section */}
          <section>
            <div className="flex items-center gap-2 mb-6 ml-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">How to Earn Points</h2>
            </div>
            <div className="space-y-4">
              {earnings.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card p-6 flex items-center justify-between border-l-4 border-l-primary/30"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white leading-tight">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">{item.desc}</p>
                    </div>
                  </div>
                  <div className={`text-xl font-black ${item.color}`}>
                    {item.points}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Reward Redemption Section */}
          <section>
            <div className="flex items-center gap-2 mb-6 ml-2">
              <Trophy className="w-5 h-5 text-warning" />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Available Benefits</h2>
            </div>
            <div className="space-y-4">
              {rewardsList.map((reward, idx) => {
                const canAfford = currentPoints >= reward.cost;
                const haveRedeemed = redemptions.some((r: any) => r.reward_title === reward.title);

                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-card p-6 flex flex-col gap-5 border border-white/[0.05] group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-warning/10 group-hover:border-warning/30 transition-all duration-300">
                          <reward.icon className="w-7 h-7 text-warning" />
                        </div>
                        <div>
                           <span className="text-[10px] font-bold text-warning/70 uppercase tracking-widest">{reward.category}</span>
                           <h3 className="text-lg font-bold text-white leading-tight mt-0.5">{reward.title}</h3>
                           <p className="text-xs text-muted-foreground mt-1">{reward.desc}</p>
                        </div>
                      </div>
                      <Button 
                        disabled={!canAfford || haveRedeemed}
                        onClick={() => redeem({ title: reward.title, cost: reward.cost })}
                        className={`h-auto py-3 px-6 rounded-xl font-bold text-xs transition-all shadow-lg ${
                          haveRedeemed ? 'bg-success/20 text-success border-none' :
                          canAfford ? 'bg-warning hover:opacity-90 text-black border-none' 
                            : 'bg-white/5 text-muted-foreground border-white/5'
                        }`}
                      >
                        {haveRedeemed ? 'REDEEMED' : `${reward.cost} CP`}
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </section>
        </div>
      </main>

      <style>{`
        @keyframes loading-bar {
          from { background-position: 0 0; }
          to { background-position: 40px 0; }
        }
      `}</style>
    </div>
  );
}
