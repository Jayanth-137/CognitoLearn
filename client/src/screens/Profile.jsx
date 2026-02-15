import { User, Award, Calendar, TrendingUp, Star, Brain } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartTooltip from '../components/ui/ChartTooltip';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();

    const userProfile = {
        name: user?.name || 'User',
        email: user?.email || 'user@example.com',
        joinDate: user?.joinDate || 'January 2026',
        level: user?.level || 'Beginner Learner',
        totalPoints: user?.totalPoints || 0,
        profession: user?.profession || 'Learner'
    };

    const masteryData = [
        { subject: 'React', score: 85 },
        { subject: 'JavaScript', score: 92 },
        { subject: 'CSS', score: 78 },
        { subject: 'TypeScript', score: 65 },
        { subject: 'Node.js', score: 70 }
    ];

    const learningTimeline = [
        { date: 'Nov 25', hours: 2.5 },
        { date: 'Nov 26', hours: 3.0 },
        { date: 'Nov 27', hours: 1.5 },
        { date: 'Nov 28', hours: 4.0 },
        { date: 'Nov 29', hours: 2.0 },
        { date: 'Nov 30', hours: 3.5 },
        { date: 'Dec 1', hours: 2.8 }
    ];

    const achievements = [
        { id: 1, title: '7-Day Streak', icon: '🔥', unlocked: true },
        { id: 2, title: 'Quick Learner', icon: '⚡', unlocked: true },
        { id: 3, title: 'Quiz Master', icon: '🎯', unlocked: true },
        { id: 4, title: '30-Day Streak', icon: '💎', unlocked: false },
        { id: 5, title: 'Perfectionist', icon: '✨', unlocked: false },
        { id: 6, title: 'Night Owl', icon: '🦉', unlocked: true }
    ];

    const recommendations = [
        { id: 1, title: 'Advanced Hooks Patterns', reason: 'Based on your React mastery' },
        { id: 2, title: 'TypeScript Fundamentals', reason: 'Strengthen your foundation' },
        { id: 3, title: 'Performance Optimization', reason: 'Next level skills' }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto animate-fade-in">
            <div className="mb-12">
                <Card variant="gradient" className="flex items-center gap-8 p-12 flex-wrap">
                    <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center text-white flex-shrink-0">
                        <User size={48} />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <h1 className="text-3xl font-bold text-white mb-2">{userProfile.name}</h1>
                        <p className="text-white/80 mb-4">{userProfile.email}</p>
                        <div className="flex items-center gap-4 flex-wrap">
                            <Badge variant="primary">{userProfile.level}</Badge>
                            <Badge variant="info">{userProfile.profession}</Badge>
                            <span className="flex items-center gap-2 text-white/90 text-sm">
                                <Calendar size={16} /> Joined {userProfile.joinDate}
                            </span>
                        </div>
                    </div>
                    <div className="text-center p-6 bg-white/10 rounded-2xl min-w-[150px]">
                        <div className="text-4xl font-extrabold text-white">{userProfile.totalPoints}</div>
                        <div className="text-sm text-white/80 uppercase tracking-wider">Total Points</div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Mastery Scores */}
                <Card variant="glass">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold mb-0">Mastery Scores</h2>
                        <TrendingUp size={20} className="text-primary-500" />
                    </div>
                    <div className="flex flex-col gap-6">
                        {masteryData.map((item) => (
                            <div key={item.subject} className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">{item.subject}</span>
                                    <span className="font-bold bg-gradient-accent bg-clip-text text-transparent">
                                        {item.score}%
                                    </span>
                                </div>
                                <ProgressBar
                                    progress={item.score}
                                    showLabel={false}
                                    height="sm"
                                    variant={item.score >= 80 ? 'success' : 'gradient'}
                                />
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Learning Timeline */}
                <Card variant="glass">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold mb-0">Learning Activity</h2>
                        <Brain size={20} className="text-primary-500" />
                    </div>
                    <div className="mb-6 text-slate-600 dark:text-slate-400">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={learningTimeline}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.1} vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}h`}
                                />
                                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Area
                                    type="monotone"
                                    dataKey="hours"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorHours)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-around pt-6 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-sm text-slate-600 dark:text-slate-400">This Week</span>
                            <span className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">19.3 hrs</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Average Daily</span>
                            <span className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">2.76 hrs</span>
                        </div>
                    </div>
                </Card>

                {/* Achievements */}
                <Card variant="glass">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold mb-0">Achievements</h2>
                        <Award size={20} className="text-primary-500" />
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        {achievements.map((achievement) => (
                            <div
                                key={achievement.id}
                                className={`flex flex-col items-center p-6 bg-slate-100 dark:bg-slate-800 rounded-2xl transition-transform cursor-pointer hover:-translate-y-1 ${achievement.unlocked ? '' : 'opacity-30 grayscale'
                                    }`}
                            >
                                <div className="text-5xl mb-2">{achievement.icon}</div>
                                <div className="text-sm font-semibold text-center text-slate-600 dark:text-slate-400">
                                    {achievement.title}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recommendations */}
                <Card variant="glass">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold mb-0">Recommended for You</h2>
                        <Star size={20} className="text-primary-500" />
                    </div>
                    <div className="flex flex-col gap-4">
                        {recommendations.map((rec) => (
                            <div key={rec.id} className="flex justify-between items-center p-6 bg-slate-100 dark:bg-slate-800 rounded-xl transition-all hover:bg-slate-200 dark:hover:bg-slate-700 hover:translate-x-1">
                                <div>
                                    <h4 className="font-semibold mb-1">{rec.title}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-0">{rec.reason}</p>
                                </div>
                                <Badge variant="info" size="sm">New</Badge>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
