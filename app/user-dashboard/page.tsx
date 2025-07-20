'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BookShelf {
  read: number;
  toRead: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "researcher"; // <-- fix here
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  id: string;
  type: "read" | "added";
  title: string;
  date: string;
  time: string;
}

interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  fileUrl: string;
  downloadCount: number;
  viewCount: number;
  averageRating: number;
  category: string;
  estimatedReadingTime?: number; // in minutes
}

interface BookshelfItem {
  id: string;
  paperId: Paper;
  userId: string;
  status: "read" | "toread";
  createdAt: string;
  updatedAt: string;
}

interface BookshelfResponse {
  success: boolean;
  bookshelf: BookshelfItem[];
  counts: {
    read: number;
    toRead: number;
  };
}

interface ReadingStats {
  hoursSpent: number;
  mostReadCategory: string;
  papersInCategory: number;
}

// Add a new function to calculate the longest reading streak
type StreakStats = { longestStreak: number, currentStreak: number };

function calculateReadingStreak(items: BookshelfItem[]): StreakStats {
  // Filter only read items and get unique days
  const readDates = Array.from(new Set(
    items
      .filter(item => item.status === 'read')
      .map(item => new Date(item.updatedAt).toISOString().split('T')[0])
  ));
  if (readDates.length === 0) return { longestStreak: 0, currentStreak: 0 };
  // Sort dates ascending
  readDates.sort();
  let longest = 1, current = 1;
  for (let i = 1; i < readDates.length; i++) {
    const prev = new Date(readDates[i - 1]);
    const curr = new Date(readDates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
    } else {
      current = 1;
    }
    if (current > longest) longest = current;
  }
  // Calculate current streak (ending today)
  let currentStreak = 1;
  for (let i = readDates.length - 1; i > 0; i--) {
    const curr = new Date(readDates[i]);
    const prev = new Date(readDates[i - 1]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      currentStreak++;
    } else {
      break;
    }
  }
  // If the last read date is not today, current streak is 0
  const today = new Date().toISOString().split('T')[0];
  if (readDates[readDates.length - 1] !== today) currentStreak = 0;
  return { longestStreak: longest, currentStreak };
}

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [shelves, setShelves] = useState<BookShelf>({
    read: 0,
    toRead: 0
  });
  const [bookshelfItems, setBookshelfItems] = useState<BookshelfItem[]>([]);
  const [readingStats, setReadingStats] = useState<ReadingStats>({
    hoursSpent: 0,
    mostReadCategory: '',
    papersInCategory: 0
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [streakStats, setStreakStats] = useState<StreakStats>({ longestStreak: 0, currentStreak: 0 });
  // Calculate number of unique categories explored
  const [uniqueCategories, setUniqueCategories] = useState<number>(0);

  // Initialize chart data with empty datasets
  const [chartData, setChartData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Books Read',
        data: Array(12).fill(0),
        backgroundColor: '#5E3023',
        borderRadius: 4,
      }
    ]
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch('/api/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        if (data.valid) {
          const userData = {
            _id: data.user._id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            createdAt: data.user.createdAt,
            updatedAt: data.user.updatedAt,
          };
          setUser(userData);
          await fetchBookshelfData(userData._id);
        } else {
          router.push('/unauthorized');
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    const fetchBookshelfData = async (userId: string) => {
      try {
        const response = await fetch(`/api/bookshelf?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bookshelf data');
        }
        const data: BookshelfResponse = await response.json();
        
        setShelves({
          read: data.counts.read,
          toRead: data.counts.toRead
        });

        setBookshelfItems(data.bookshelf);
        
        // Process the bookshelf data to generate chart data
        if (data.bookshelf && data.bookshelf.length > 0) {
          processChartData(data.bookshelf);
          calculateReadingStats(data.bookshelf);
          generateRecentActivities(data.bookshelf);
          setStreakStats(calculateReadingStreak(data.bookshelf));
          // Calculate unique categories explored
          const categories = new Set(
            data.bookshelf
              .filter(item => item.status === 'read' && item.paperId && item.paperId.category)
              .map(item => item.paperId.category)
          );
          setUniqueCategories(categories.size);
        }
      } catch (error) {
        console.error('Error fetching bookshelf data:', error);
        // No mock data - just leave everything empty
      }
    };

    const processChartData = (items: BookshelfItem[]) => {
      // Filter only read items
      const readItems = items.filter(item => item.status === 'read');
      
      // Group by month
      const monthlyCounts = Array(12).fill(0);
      
      readItems.forEach(item => {
        const date = new Date(item.updatedAt);
        const month = date.getMonth(); // 0-11
        monthlyCounts[month]++;
      });
      
      // Update chart data
      setChartData(prev => ({
        ...prev,
        datasets: [{
          ...prev.datasets[0],
          data: monthlyCounts
        }]
      }));
    };

    const calculateReadingStats = (items: BookshelfItem[]) => {
      // Filter only read items from this month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const readThisMonth = items.filter(item => {
        if (item.status !== 'read') return false;
        const date = new Date(item.updatedAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });

      // Calculate hours spent reading
      // Assuming average reading time is 30 minutes per paper if not specified
      const totalMinutes = readThisMonth.reduce((total, item) => {
        const readingTime = item.paperId.estimatedReadingTime || 30; // default to 30 minutes
        return total + readingTime;
      }, 0);

      const hoursSpent = Math.round(totalMinutes / 60);

      // Calculate most read category
      const categoryCounts: Record<string, number> = {};
      
      readThisMonth.forEach(item => {
        const category = item.paperId.category || 'Uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });

      let mostReadCategory = '';
      let papersInCategory = 0;

      if (Object.keys(categoryCounts).length > 0) {
        const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
        mostReadCategory = sortedCategories[0][0];
        papersInCategory = sortedCategories[0][1];
      } else {
        mostReadCategory = 'None';
        papersInCategory = 0;
      }

      setReadingStats({
        hoursSpent,
        mostReadCategory,
        papersInCategory
      });
    };

    const generateRecentActivities = (items: BookshelfItem[]) => {
      // Sort items by updatedAt (newest first)
      const sortedItems = [...items].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      // Take the 3 most recent items
      const recentItems = sortedItems.slice(0, 3);

      // Convert to activities
      const newActivities: Activity[] = recentItems.map(item => {
        const date = new Date(item.updatedAt);
        return {
          id: item.id,
          type: item.status === 'read' ? 'read' : 'added',
          title: item.paperId.title,
          date: date.toISOString().split('T')[0],
          time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      });
      setActivities(newActivities);
    };

    verifyToken();
  }, [router]);

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'Space Grotesk, sans-serif',
        }}>
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout user={user}>
      {/* White full-page container */}
      <div style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        padding: '2rem',
        fontFamily: 'Space Grotesk, sans-serif',
        boxSizing: 'border-box',
      }}>
        {/* Content container with max-width */}
        <div style={{
          width: '100%',
          maxWidth: '1800px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}>
          {/* Full-width brown welcome box */}
          <div style={{
            width: '100%',
            borderRadius: "1.5rem",
            backgroundColor: "#5E3023",
            padding: "2.5rem 2rem",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            color: "#FFFFFF",
            position: "relative",
            overflow: "hidden",
          }}>
            <h1 style={{
              fontSize: "clamp(1.5rem, 2vw, 2.25rem)",
              fontWeight: "800",
              marginBottom: "1rem",
              color: "#FFFFFF",
              fontFamily: 'Space Grotesk, sans-serif',
              position: "relative",
              zIndex: 2,
            }}>
              Welcome back, {user.name}!
            </h1>
            <p style={{
              color: "#F3E9E7",
              fontSize: "clamp(0.9rem, 1.1vw, 1.125rem)",
              lineHeight: "1.6",
              marginBottom: "1.5rem",
              fontFamily: 'Space Grotesk, sans-serif',
              position: "relative",
              zIndex: 2,
              maxWidth: '800px',
            }}>
              You've read {shelves.read} books so far, with {shelves.toRead} waiting to be read. 
              Keep exploring new knowledge and expanding your horizons!
            </p>
            <div style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.1)",
              zIndex: 1,
            }}></div>
          </div>

          {/* Two-column layout for shelves and activities */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '2rem',
            width: '100%',
            flexWrap: 'wrap',
          }}>
            {/* Shelves Section */}
            <div style={{
              flex: '1',
              minWidth: '300px',
              borderRadius: "1.5rem",
              backgroundColor: "#F9FAFB",
              padding: "2rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #E5E7EB",
            }}>
              <h2 style={{
                fontSize: "1.25rem",
                fontWeight: "700",
                marginBottom: "1.5rem",
                color: "#111827",
                fontFamily: 'Space Grotesk, sans-serif',
              }}>
                Your Bookshelves
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1.5rem',
              }}>
                {/* Read Shelf */}
                <div style={{
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  border: '1px solid #E5E7EB',
                  textAlign: 'center'
                }}>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6B7280',
                    marginBottom: '0.5rem'
                  }}>Read</p>
                  <p style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#111827',
                    margin: 0
                  }}>{shelves.read}</p>
                </div>

                {/* To Read Shelf */}
                <div style={{
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  border: '1px solid #E5E7EB',
                  textAlign: 'center'
                }}>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6B7280',
                    marginBottom: '0.5rem'
                  }}>To Read</p>
                  <p style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#111827',
                    margin: 0
                  }}>{shelves.toRead}</p>
                </div>
              </div>
            </div>

            {/* Recent Activities Column */}
            <div style={{
              flex: '1',
              minWidth: '300px',
              borderRadius: "1.5rem",
              backgroundColor: "#F9FAFB",
              padding: "2rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #E5E7EB",
            }}>
              <h2 style={{
                fontSize: "1.25rem",
                fontWeight: "700",
                marginBottom: "1.5rem",
                color: "#111827",
                fontFamily: 'Space Grotesk, sans-serif',
              }}>
                Recent Activities
              </h2>
              
              {activities.length > 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}>
                  {activities.map(activity => (
                    <div key={activity.id} style={{
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      borderLeft: `3px solid ${activity.type === "read" ? '#5E3023' : '#8B5A2B'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          backgroundColor: activity.type === "read" ? 'rgba(94, 48, 35, 0.1)' : 'rgba(139, 90, 43, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <span style={{ 
                            fontSize: '0.7rem',
                            color: activity.type === "read" ? '#5E3023' : '#8B5A2B',
                            fontWeight: 'bold'
                          }}>
                            {activity.type === "read" ? 'RD' : 'AD'}
                          </span>
                        </div>
                        <p style={{ 
                          fontWeight: '600', 
                          margin: 0,
                          fontSize: '0.9rem',
                          color: '#111827'
                        }}>
                          {activity.type === "read" ? 'Read' : 'Added to read'}: {activity.title}
                        </p>
                      </div>
                      <p style={{ 
                        fontSize: '0.75rem', 
                        color: '#6B7280', 
                        margin: '0.5rem 0 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <span>{new Date(activity.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6B7280', fontStyle: 'italic' }}>
                  No recent activities found
                </p>
              )}
            </div>
          </div>

          {/* Bottom section with engagement graph and stats */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '2rem',
            width: '100%',
            flexWrap: 'wrap',
          }}>
            {/* Engagement Graph */}
            <div style={{
              flex: '2',
              minWidth: '300px',
              borderRadius: "1.5rem",
              backgroundColor: "#F9FAFB",
              padding: "2rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #E5E7EB",
            }}>
              <h2 style={{
                fontSize: "1.25rem",
                fontWeight: "700",
                marginBottom: "1.5rem",
                color: "#111827",
                fontFamily: 'Space Grotesk, sans-serif',
              }}>
                Your Reading Engagement
              </h2>
              <div style={{ 
                width: '100%',
                height: '300px',
                position: 'relative'
              }}>
                <Bar 
                  data={chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.dataset.label}: ${context.raw}`;
                          }
                        }
                      }
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: 'Month',
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: 'Books Read',
                        },
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                          precision: 0
                        }
                      },
                    },
                  }} 
                />
              </div>
            </div>

            {/* Stats Cards */}
            <div style={{
              flex: '1',
              minWidth: '300px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}>
              {/* Reading Streak Card (replaces Hours Spent Reading) */}
              <div style={{
                borderRadius: "1rem",
                backgroundColor: "rgba(112, 40, 40, 0.32)",
                padding: "1.5rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                color: "#111827",
                flex: 1
              }}>
                <h3 style={{ 
                  fontSize: '0.875rem', 
                  color: '#111827', 
                  margin: 0,
                  fontWeight: '500'
                }}>Reading Streak</h3>
                <p style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700', 
                  margin: '0.5rem 0 0 0',
                  color: '#111827'
                }}>{streakStats.currentStreak} days</p>
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: '#6B7280', 
                  margin: '0.1rem 0 0 0'
                }}>Longest streak: {streakStats.longestStreak} days</p>
              </div>

              {/* Most Featured Category Card */}
              <div style={{
                borderRadius: "1rem",
                backgroundColor: "rgba(86, 52, 52, 0.83)",
                padding: "1.5rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                color: "#FFFFFF",
                flex: 1
              }}>
                <h3 style={{ 
                  fontSize: '0.875rem', 
                  color: '#F5F5F5', 
                  margin: 0,
                  fontWeight: '500',
                  opacity: 0.9
                }}>Most Read Category</h3>
                <p style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  margin: '0.5rem 0 0 0',
                  color: '#FFFFFF'
                }}>{readingStats.mostReadCategory}</p>
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: '#F5F5F5', 
                  margin: '0.1rem 0 0 0',
                  opacity: 0.8
                }}>{readingStats.papersInCategory} papers this month</p>
                <p style={{
                  fontSize: '0.7rem',
                  color: '#F5F5F5',
                  margin: '0.1rem 0 0 0',
                  opacity: 0.7
                }}>Categories explored: {uniqueCategories}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}