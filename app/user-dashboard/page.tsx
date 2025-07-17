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
  role: string;
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
  allCategories: { category: string; count: number }[];
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
    mostReadCategory: 'None',
    papersInCategory: 0,
    allCategories: []
  });
  const [activities, setActivities] = useState<Activity[]>([]);

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
        }
      } catch (error) {
        console.error('Error fetching bookshelf data:', error);
      }
    };

    const processChartData = (items: BookshelfItem[]) => {
      const readItems = items.filter(item => item.status === 'read');
      const monthlyCounts = Array(12).fill(0);
      
      readItems.forEach(item => {
        const date = new Date(item.updatedAt);
        const month = date.getMonth();
        monthlyCounts[month]++;
      });
      
      setChartData(prev => ({
        ...prev,
        datasets: [{
          ...prev.datasets[0],
          data: monthlyCounts
        }]
      }));
    };

    const calculateReadingStats = (items: BookshelfItem[]) => {
      // Filter only read items
      const readItems = items.filter(item => item.status === 'read');
      
      // Calculate hours spent reading (all time, not just this month)
      const totalMinutes = readItems.reduce((total, item) => {
        const readingTime = item.paperId.estimatedReadingTime || 30;
        return total + readingTime;
      }, 0);

      const hoursSpent = Math.round(totalMinutes / 60);

      // Calculate category counts (all time)
      const categoryCounts: Record<string, number> = {};
      
      readItems.forEach(item => {
        const category = item.paperId.category || 'Uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });

      // Convert to array and sort
      const allCategories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      // Get top category
      let mostReadCategory = 'None';
      let papersInCategory = 0;

      if (allCategories.length > 0) {
        mostReadCategory = allCategories[0].category;
        papersInCategory = allCategories[0].count;
      }

      setReadingStats({
        hoursSpent,
        mostReadCategory,
        papersInCategory,
        allCategories
      });
    };

    const generateRecentActivities = (items: BookshelfItem[]) => {
      const sortedItems = [...items].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      const recentItems = sortedItems.slice(0, 3);

      const newActivities = recentItems.map(item => {
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
      <div style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        padding: '2rem',
        fontFamily: 'Space Grotesk, sans-serif',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1800px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}>
          {/* Welcome Banner */}
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
              {readingStats.mostReadCategory !== 'None' && (
                <> Your favorite category is <strong>{readingStats.mostReadCategory}</strong> with {readingStats.papersInCategory} papers read.</>
              )}
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

          {/* Two-column layout */}
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

            {/* Recent Activities */}
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

          {/* Bottom section */}
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
              {/* Hours Spent Card */}
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
                }}>Hours Spent Reading</h3>
                <p style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700', 
                  margin: '0.5rem 0 0 0',
                  color: '#111827'
                }}>{readingStats.hoursSpent}</p>
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: '#6B7280', 
                  margin: '0.1rem 0 0 0'
                }}>total reading time</p>
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
                }}>
                  {readingStats.mostReadCategory}
                </p>
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: '#F5F5F5', 
                  margin: '0.1rem 0 0 0',
                  opacity: 0.8
                }}>
                  {readingStats.papersInCategory} {readingStats.papersInCategory === 1 ? 'paper' : 'papers'} read
                </p>
                {readingStats.allCategories.length > 1 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <p style={{ 
                      fontSize: '0.65rem', 
                      color: '#F5F5F5', 
                      margin: '0.5rem 0 0 0',
                      opacity: 0.7
                    }}>
                      Other categories:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                      {readingStats.allCategories.slice(1, 4).map((cat, index) => (
                        <span key={index} style={{
                          fontSize: '0.6rem',
                          backgroundColor: 'rgba(255,255,255,0.15)',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '4px'
                        }}>
                          {cat.category} ({cat.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}