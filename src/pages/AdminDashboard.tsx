import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, useComplaints, DEPARTMENTS, STATUS_CONFIG, type ComplaintStatus } from '@/lib/store';
import ComplaintCard from '@/components/ComplaintCard';
import { Shield, LogOut, Search, AlertTriangle, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CHART_COLORS = ['hsl(220,70%,45%)', 'hsl(25,95%,53%)', 'hsl(150,45%,40%)', 'hsl(0,84%,60%)', 'hsl(200,80%,50%)', 'hsl(280,60%,50%)'];

export default function AdminDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { complaints, updateStatus, isLoading: dataLoading } = useComplaints();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading dashboard...</div>;
  if (!user || user.role !== 'admin') { navigate('/admin-login'); return null; }

  const deptComplaints = complaints.filter(c => c.department === user.department);
  const filtered = (statusFilter === 'all' ? deptComplaints : deptComplaints.filter(c => c.status === statusFilter))
    .filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase()));

  // Delay detection: pending > 5 days
  const overdue = deptComplaints.filter(c => {
    if (c.status === 'resolved') return false;
    return Math.floor((Date.now() - new Date(c.createdAt).getTime()) / 86400000) > 5;
  });

  // Chart data
  const statusData = (['pending', 'assigned', 'in_progress', 'resolved'] as ComplaintStatus[]).map(s => ({
    name: STATUS_CONFIG[s].label, value: deptComplaints.filter(c => c.status === s).length,
  }));

  const locationData = Object.entries(
    deptComplaints.reduce((acc, c) => { const loc = c.location.split(',')[0].trim(); acc[loc] = (acc[loc] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);

  const dept = DEPARTMENTS.find(d => d.value === user.department);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">Admin Portal</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">{dept?.icon} {dept?.label}</span>
            <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/'); }}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="stat-card">
            <div className="text-2xl font-display font-bold text-foreground">{deptComplaints.length}</div>
            <div className="text-xs text-muted-foreground">Total Complaints</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-warning" /><span className="text-2xl font-display font-bold text-foreground">{deptComplaints.filter(c => c.status === 'pending').length}</span></div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-success" /><span className="text-2xl font-display font-bold text-foreground">{deptComplaints.filter(c => c.status === 'resolved').length}</span></div>
            <div className="text-xs text-muted-foreground">Resolved</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" /><span className="text-2xl font-display font-bold text-foreground">{overdue.length}</span></div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </div>
        </div>

        {/* Overdue alert */}
        {overdue.length > 0 && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-6">
            <div className="flex items-center gap-2 text-destructive font-medium mb-1">
              <AlertTriangle className="w-4 h-4" /> {overdue.length} Overdue Complaint(s)
            </div>
            <p className="text-sm text-muted-foreground">These complaints have exceeded the standard resolution timeframe. Immediate action required.</p>
          </div>
        )}

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /> Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value">
                  {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /> Complaints by Location</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={locationData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(220,70%,45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search complaints..." className="pl-9" />
          </div>
        </div>

        {/* Complaints with admin actions */}
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className="glass-card p-5">
              <ComplaintCard complaint={c} showActions={false} />
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
                {c.status === 'pending' && (
                  <Button size="sm" variant="default" onClick={() => updateStatus(c.id, 'assigned', 'Assigned to department team')}>
                    Assign Team
                  </Button>
                )}
                {c.status === 'assigned' && (
                  <Button size="sm" variant="default" onClick={() => updateStatus(c.id, 'in_progress', 'Work in progress')}>
                    Start Work
                  </Button>
                )}
                {c.status === 'in_progress' && (
                  <Button size="sm" variant="success" onClick={() => updateStatus(c.id, 'resolved', 'Issue resolved. Resolution proof uploaded.')}>
                    Mark Resolved
                  </Button>
                )}
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  Math.floor((Date.now() - new Date(c.createdAt).getTime()) / 86400000) > 5
                    ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                }`}>
                  {Math.floor((Date.now() - new Date(c.createdAt).getTime()) / 86400000)} days old
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
