import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEPARTMENTS, type Department } from '@/lib/store';
import { Shield, ArrowLeft, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const DEPT_CODES: Record<Department, string> = {
  water: 'WAT-2024', electricity: 'ELC-2024', roads: 'RDS-2024',
  garbage: 'SAN-2024', safety: 'SAF-2024', health: 'HLT-2024',
  education: 'EDU-2024', other: 'OTH-2024',
};

export default function AdminLoginPage() {
  const [department, setDepartment] = useState<Department | ''>('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!department) { setError('Select a department'); return; }
    if (code !== DEPT_CODES[department]) {
      setError('Invalid department code. Contact your department admin.');
      return;
    }

    setLoading(true);
    try {
      const email = `${department}@sarkar.gov.in`;
      const password = code + 'Secure2024';

      let { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // If it doesn't exist, let's create the admin account on the fly for the demo
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: `${department.toUpperCase()} Admin`, role: 'admin', department }
          }
        });
        
        if (signUpError) throw signUpError;
        
        // Let's attempt sign in again if auto-signin didn't happen (depends on Supabase settings)
        await supabase.auth.signInWithPassword({ email, password });
      }

      toast.success('Securely logged into Department Dashboard');
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your Supabase settings (Email confirmations must be disabled).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Government Portal</h2>
              <p className="text-muted-foreground text-sm">Department secure access</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Select Department</Label>
              <Select value={department} onValueChange={(v) => { setDepartment(v as Department); setError(''); }}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choose your department" /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.filter(d => d.value !== 'other').map(d => (
                    <SelectItem key={d.value} value={d.value}>{d.icon} {d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Department Secure Code</Label>
              <Input type="password" value={code} onChange={e => { setCode(e.target.value); setError(''); }} placeholder="Enter secure code" className="mt-1.5" required />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
              {loading ? 'Authenticating...' : 'Access Department Dashboard'}
            </Button>
          </form>
          <div className="mt-6 p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Demo codes:</strong> Water: WAT-2024, Electricity: ELC-2024, Roads: RDS-2024, Sanitation: SAN-2024, Safety: SAF-2024, Health: HLT-2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
