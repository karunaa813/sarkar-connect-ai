import { type Complaint, STATUS_CONFIG, DEPARTMENTS } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, MapPin, Clock, Scale, ChevronDown, ChevronUp, FileVideo, FileImage, FileText, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  complaint: Complaint;
  onVote?: (id: string) => void;
  showActions?: boolean;
}

export default function ComplaintCard({ complaint, onVote, showActions = true }: Props) {
  const [expanded, setExpanded] = useState(false);
  const dept = DEPARTMENTS.find(d => d.value === complaint.department);
  const status = STATUS_CONFIG[complaint.status];

  return (
    <motion.div 
      layout
      className="glass-card p-8 hover:border-primary/40 transition-all duration-500 group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent group-hover:via-primary/50 transition-all" />
      
      <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-black font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded uppercase tracking-widest border border-white/5">
              ID: {complaint.id}
            </span>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${status.color.replace('text-', 'text-').replace('bg-', 'bg-').includes('success') ? 'bg-success/20 text-success border-success/30' : 'bg-primary/20 text-primary border-primary/30'}`}>
              {status.label}
            </div>
            {dept && (
              <span className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                {dept.icon} {dept.label}
              </span>
            )}
          </div>

          <h3 className="font-display text-2xl font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight leading-tight">
            {complaint.title}
          </h3>

          <div className="flex items-center gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-80">
            <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-primary" />{complaint.location}</span>
            <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-primary" />{complaint.createdAt}</span>
          </div>
        </div>

        {showActions && onVote && (
          <div className="flex flex-col items-center gap-4 min-w-[100px] border-l border-white/5 pl-8 self-stretch justify-center">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onVote(complaint.id)} 
              className="flex flex-col items-center gap-3 w-full py-4 rounded-2xl bg-white/5 hover:bg-primary/10 transition-all border border-white/5 hover:border-primary/30 group/vote"
            >
              <ThumbsUp className="w-6 h-6 text-primary group-hover/vote:animate-bounce" />
              <div className="flex flex-col items-center">
                <span className="text-xl font-black text-white leading-none">{complaint.votes}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Upvotes</span>
              </div>
            </motion.button>
          </div>
        )}
      </div>

      <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:opacity-70 transition-opacity"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? 'Collapse Protocol' : 'Review Manifest'}
        </button>
        
        {!expanded && (
           <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Detail View</span>
              <ArrowRight className="w-3 h-3 text-primary" />
           </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-8 space-y-8">
              <p className="text-lg font-medium text-muted-foreground leading-relaxed italic border-l-4 border-primary/20 pl-6">
                "{complaint.description}"
              </p>
              
              {complaint.images && complaint.images.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-4">Evidence Archive</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {complaint.images.map((img, i) => {
                      const isVideo = img.includes('.mp4');
                      const isPdf = img.includes('.pdf');
                      return (
                        <a 
                          key={i} 
                          href={img} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="group/img relative block aspect-square rounded-[1.5rem] overflow-hidden border border-white/10 bg-white/5 hover:border-primary transition-all shadow-lg"
                        >
                          {isVideo ? (
                            <div className="w-full h-full relative">
                              <video src={img} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover/img:bg-black/20 transition-all">
                                <FileVideo className="w-8 h-8 text-white drop-shadow-lg" />
                              </div>
                            </div>
                          ) : isPdf ? (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                              <FileText className="w-10 h-10" />
                              <span className="text-[10px] font-black uppercase tracking-widest">PDF DOC</span>
                            </div>
                          ) : (
                            <img src={img} alt={`Evidence ${i+1}`} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" />
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {complaint.bnsSection && (
                <div className="p-8 rounded-[1.5rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Scale className="w-20 h-20 text-primary" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                      <Scale className="w-4 h-4" /> BHARATIYA NYAYA SANHITA 2023 — SECTION {complaint.bnsSection.section}
                    </div>
                    <h5 className="text-xl font-display font-black text-white mb-2 uppercase tracking-tight">{complaint.bnsSection.title}</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{complaint.bnsSection.explanation}</p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-6">Resolution Protocol Timeline</h4>
                <div className="space-y-8 relative">
                  <div className="absolute left-[5px] top-2 bottom-2 w-[1px] bg-white/10" />
                  {complaint.timeline.map((t, i) => (
                    <div key={i} className="flex items-start gap-6 relative">
                      <div className={`w-3 h-3 rounded-full shrink-0 mt-1 relative z-10 ${STATUS_CONFIG[t.status].color.replace('text-', 'bg-').split(' ')[0]} shadow-[0_0_10px_currentColor]`} />
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-black text-white uppercase tracking-wider mb-1">{STATUS_CONFIG[t.status].label}</p>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-1">{t.note}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest">{t.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
