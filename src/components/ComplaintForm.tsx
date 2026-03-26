import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEPARTMENTS, detectCategory, getBNSSection, detectPriority, type Department, type BNSSection } from '@/lib/store';
import { Sparkles, Scale, Upload, Mic, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Props {
  onSubmit: (data: {
    title: string; description: string; category: Department;
    location: string; coordinates: { lat: number; lng: number };
    department: Department; priority: 'low' | 'medium' | 'high' | 'critical';
    bnsSection: BNSSection | null; images: string[];
  }) => void;
  onClose: () => void;
}

export default function ComplaintForm({ onSubmit, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [manualCategory, setManualCategory] = useState<Department | ''>('');
  const [aiResult, setAiResult] = useState<{ category: Department; bns: BNSSection | null; priority: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files].slice(0, 3)); // Max 3 files
    }
  };

  const analyzeWithAI = () => {
    if (!description.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const cat = manualCategory || detectCategory(description + ' ' + title);
      const bns = getBNSSection(cat);
      const priority = detectPriority(description, 0);
      setAiResult({ category: cat, bns, priority });
      setIsAnalyzing(false);
    }, 1200);
  };

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser. Try Chrome.');
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setDescription(prev => prev + ' ' + text);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    setIsListening(true);
    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      if (selectedFiles.length > 0) {
        toast.info("Uploading evidence...", { id: 'upload' });
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
          const filePath = `citizen_uploads/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('evidence')
            .upload(filePath, file);
            
          if (uploadError) throw uploadError;
          
          const { data } = supabase.storage.from('evidence').getPublicUrl(filePath);
          uploadedUrls.push(data.publicUrl);
        }
        toast.success("Evidence uploaded!", { id: 'upload' });
      }

      const cat = aiResult?.category || manualCategory || detectCategory(description);
      const bns = getBNSSection(cat);
      onSubmit({
        title, description, category: cat, location,
        coordinates: { lat: 19.076 + Math.random() * 10, lng: 72.877 + Math.random() * 5 },
        department: cat, priority: (aiResult?.priority || 'medium') as any,
        bnsSection: bns, images: uploadedUrls,
      });
    } catch (error: any) {
      toast.error("Failed to upload files: " + error.message, { id: 'upload' });
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(37,99,235,0.1)]">
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/5 shrink-0">
          <div>
            <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">File New Incident</h2>
            <p className="text-muted-foreground text-sm font-medium mt-1">Submit your report to the National Justice Portal</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 text-white/50 hover:text-white transition-colors rounded-xl bg-white/[0.02] border border-white/5"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
          <form id="complaint-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-white/80 font-bold uppercase tracking-widest text-[10px] mb-2 block">Incident Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief summary of the incident..." className="h-12 bg-white/[0.03] border-white/10 text-white font-medium rounded-xl hover:bg-white/[0.05] transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/50" required />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-white/80 font-bold uppercase tracking-widest text-[10px]">Detailed Description</Label>
                <button type="button" onClick={handleVoice} className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors ${isListening ? 'text-destructive animate-pulse' : 'text-primary hover:text-primary/80'}`}>
                  <Mic className="w-3.5 h-3.5" /> {isListening ? 'Listening...' : 'Voice Input'}
                </button>
              </div>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Provide all necessary details..." className="min-h-[140px] resize-none bg-white/[0.03] border-white/10 text-white font-medium rounded-xl hover:bg-white/[0.05] transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/50 p-4" required />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-white/80 font-bold uppercase tracking-widest text-[10px] mb-2 block">Precise Location</Label>
                <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Landmark, Area, Pincode..." className="h-12 bg-white/[0.03] border-white/10 text-white font-medium rounded-xl hover:bg-white/[0.05] transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/50" required />
              </div>

              <div>
                <Label className="text-white/80 font-bold uppercase tracking-widest text-[10px] mb-2 block">Category (Auto AI)</Label>
                <Select value={manualCategory} onValueChange={v => setManualCategory(v as Department)}>
                  <SelectTrigger className="h-12 bg-white/[0.03] border-white/10 text-white font-medium rounded-xl hover:bg-white/[0.05] transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/50">
                     <SelectValue placeholder="Let AI determine automatically" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border border-white/10 text-white">
                    {DEPARTMENTS.map(d => (
                      <SelectItem key={d.value} value={d.value} className="focus:bg-white/10 focus:text-white cursor-pointer hover:bg-white/5">{d.icon} <span className="ml-2 font-medium">{d.label}</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-white/80 font-bold uppercase tracking-widest text-[10px] mb-2 block">Digital Evidence (Max 3 Files)</Label>
              <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center relative hover:bg-white/[0.02] hover:border-primary/30 transition-all group">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,video/mp4,.pdf" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  disabled={isUploading || selectedFiles.length >= 3}
                />
                <Upload className="w-10 h-10 text-white/30 group-hover:text-primary mx-auto mb-3 transition-colors" />
                <p className="text-sm text-white font-bold">Drag & drop files or click to browse</p>
                <p className="text-xs text-white/40 mt-1.5 font-medium uppercase tracking-widest">Supports JPG, PNG, MP4, PDF (Max 10MB)</p>
              </div>
              {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold text-white">
                      <span className="truncate max-w-[150px]">{f.name}</span>
                      <button type="button" onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-white/40 hover:text-destructive transition-colors"><X className="w-3.5 h-3.5"/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!aiResult && (
              <Button type="button" variant="ghost" onClick={analyzeWithAI} disabled={!description.trim() || isAnalyzing} className="w-full h-14 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl font-bold uppercase tracking-widest text-xs transition-all">
                <Sparkles className="w-4 h-4 mr-2" />
                {isAnalyzing ? 'Running AI Protocol...' : 'Run Prior AI Analysis'}
              </Button>
            )}

            {aiResult && (
              <div className="space-y-4 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs mb-2">
                  <Sparkles className="w-4 h-4" /> AI Diagnostics Initialized
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-1">Detected Category</p>
                    <p className="font-bold text-white flex items-center gap-2">{DEPARTMENTS.find(d => d.value === aiResult.category)?.icon} {DEPARTMENTS.find(d => d.value === aiResult.category)?.label}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-1">Incident Priority</p>
                    <p className={`font-bold uppercase tracking-widest text-xs ${
                       aiResult.priority === 'critical' ? 'text-destructive' : aiResult.priority === 'high' ? 'text-warning' : 'text-success'
                    }`}>{aiResult.priority}</p>
                  </div>
                </div>
                {aiResult.bns ? (
                  <div className="p-5 rounded-xl bg-primary/10 border border-primary/20 mt-4">
                    <div className="flex items-center gap-2 text-primary mb-3">
                      <Scale className="w-5 h-5" />
                      <span className="font-black text-sm uppercase tracking-widest">BNS 2023 — Section {aiResult.bns.section}</span>
                    </div>
                    <p className="font-bold text-white text-md mb-2">{aiResult.bns.title}</p>
                    <p className="text-white/60 text-sm font-medium leading-relaxed">{aiResult.bns.explanation}</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-sm text-white/50 font-medium">
                    <Scale className="w-4 h-4 inline mr-2 opacity-50" /> No direct BNS 2023 legal clause isolated for this exact violation yet.
                  </div>
                )}
              </div>
            )}

          </form>
        </div>

        <div className="p-6 md:p-8 border-t border-white/5 shrink-0 bg-[#0a0a0a]">
           <Button form="complaint-form" variant="default" size="lg" className="w-full h-14 rounded-xl text-white font-black uppercase tracking-widest text-sm bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all" type="submit" disabled={isUploading}>
             {isUploading ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Transmitting Report...</> : 'Officially File Incident'}
           </Button>
        </div>
      </div>
    </div>
  );
}
