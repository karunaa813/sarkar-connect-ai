import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, FileText, BarChart3, MapPin, Users, Zap, ChevronRight, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Zap, title: 'AI-Powered Routing', desc: 'Complaints auto-categorized and routed to the right department using NLP.' },
  { icon: Shield, title: 'BNS 2023 Legal Intelligence', desc: 'Every complaint mapped to relevant Bharatiya Nyaya Sanhita sections.' },
  { icon: MapPin, title: 'Live Complaint Map', desc: 'Real-time geographic visualization of citizen complaints across India.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Department-wise analytics, delay tracking, and predictive insights.' },
  { icon: Users, title: 'Community Voting', desc: 'Citizens upvote complaints — higher votes means higher priority.' },
  { icon: FileText, title: 'Auto RTI Generation', desc: 'Delayed complaints trigger automatic RTI request generation.' },
];

const stats = [
  { value: '2.4M+', label: 'Complaints Resolved' },
  { value: '850+', label: 'Departments Connected' },
  { value: '28', label: 'States & UTs' },
  { value: '98%', label: 'Citizen Satisfaction' },
];



const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-sans font-black text-xl tracking-tighter text-[#FF9933]">Sarkar</span>
              <span className="font-sans font-black text-xl tracking-tighter text-white">Connect</span>
              <span className="font-sans font-black text-xl tracking-tighter text-[#128807]">AI</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#stats" className="nav-link">Impact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
            <Link to="/login"><Button variant="hero" size="sm">File Complaint <ChevronRight className="w-4 h-4" /></Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-[0.03]" />
        {/* Animated glowing orbs */}
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 -z-10 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 -z-10 animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="container mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" /> AI-Powered Governance Platform
            </span>
          </motion.div>
          <motion.h1
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          >
            Your Voice,{' '}
            <span className="text-accent">India's Action</span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          >
            File complaints, track progress, and hold departments accountable — all powered by artificial intelligence and backed by BNS 2023 legal framework.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link to="/login">
              <Button size="xl" className="bg-accent hover:bg-accent/90 text-accent-foreground font-black px-12 h-16 rounded-2xl shadow-xl shadow-accent/10">File a Complaint <ArrowRight className="w-6 h-6 ml-2" /></Button>
            </Link>


            <Link to="/admin-login">
              <Button variant="outline" size="xl">Government Login</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 px-4 border-y border-border/50">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div key={s.label} className="stat-card text-center" custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="text-3xl md:text-4xl font-display font-bold text-primary">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">Intelligent Governance</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Every feature designed to bridge the gap between citizens and government departments.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} className="glass-card p-6 group hover:border-primary/30 transition-all duration-300" custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-sans font-semibold text-lg text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground text-center mb-14">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Submit Complaint', desc: 'Text, voice, or image — in any language' },
              { step: '02', title: 'AI Processes', desc: 'Category, department, and legal section auto-assigned' },
              { step: '03', title: 'Department Acts', desc: 'Complaint routed to the right team instantly' },
              { step: '04', title: 'Track & Resolve', desc: 'Real-time updates until resolution with proof' },
            ].map((s, i) => (
              <motion.div key={s.step} className="text-center" custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="w-16 h-16 rounded-2xl gradient-saffron flex items-center justify-center mx-auto mb-4 text-secondary-foreground font-display font-bold text-xl">{s.step}</div>
                <h3 className="font-sans font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-1.5 mb-4">
            <span className="font-sans font-black text-lg tracking-tighter text-[#FF9933]">Sarkar</span>
            <span className="font-sans font-black text-lg tracking-tighter text-white">Connect</span>
            <span className="font-sans font-black text-lg tracking-tighter text-[#128807]">AI</span>
          </div>
          <p className="text-muted-foreground text-sm">Empowering citizens. Transforming governance. Built for India 🇮🇳</p>
        </div>
      </footer>
    </div>
  );
}
