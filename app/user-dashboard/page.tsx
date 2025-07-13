'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ _id: string; name: string; email: string; role: string; createdAt: string; updatedAt: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for user shelves
  const [shelves, setShelves] = useState({
    read: 42,
    currentlyReading: 5,
    toRead: 18
  });

  // Mock data for recent activities
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: "download",
      title: "The Psychology of Money",
      date: "2023-12-20",
      time: "10:30 AM"
    },
    {
      id: 2,
      type: "bookmark",
      title: "Atomic Habits - Chapter 3",
      date: "2023-12-18",
      time: "2:15 PM"
    },
    {
      id: 3,
      type: "download",
      title: "Sapiens: A Brief History of Humankind",
      date: "2023-12-15",
      time: "9:45 AM"
    },
    {
      id: 4,
      type: "bookmark",
      title: "Deep Work - Page 56",
      date: "2023-12-12",
      time: "4:30 PM"
    }
  ]);

  // Mock data for engagement graph
  const [chartData, setChartData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Engagement',
        data: [12, 19, 8, 15, 12, 18],
        backgroundColor: '#5E3023',
        borderColor: '#5E3023',
        borderWidth: 1
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
        if (data.valid && data.user?.role === "user") {
          setUser({
            _id: data.user._id,
            name: data.user.name,
            email: data.user.email,
            role: "user", // Explicitly set role to match expected type
            createdAt: data.user.createdAt,
            updatedAt: data.user.updatedAt,
          });
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
              You've read {shelves.read} books so far, with {shelves.currentlyReading} currently in progress. 
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

                {/* Currently Reading Shelf */}
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
                  }}>Currently Reading</p>
                  <p style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#111827',
                    margin: 0
                  }}>{shelves.currentlyReading}</p>
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
                    borderLeft: `3px solid ${activity.type === "download" ? '#5E3023' : '#8B5A2B'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        backgroundColor: activity.type === "download" ? 'rgba(94, 48, 35, 0.1)' : 'rgba(139, 90, 43, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <span style={{ 
                          fontSize: '0.7rem',
                          color: activity.type === "download" ? '#5E3023' : '#8B5A2B',
                          fontWeight: 'bold'
                        }}>
                          {activity.type === "download" ? 'DL' : 'BM'}
                        </span>
                      </div>
                      <p style={{ 
                        fontWeight: '600', 
                        margin: 0,
                        fontSize: '0.9rem',
                        color: '#111827'
                      }}>
                        {activity.type === "download" ? 'Downloaded' : 'Bookmarked'}: {activity.title}
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
              {/* Total Downloads Card */}
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
                }}>Total Downloads</h3>
                <p style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: '700', 
                  margin: '0.5rem 0 0 0',
                  color: '#FFFFFF'
                }}>127</p>
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '10px',
                  marginTop: '0.5rem',
                  width: 'fit-content'
                }}>
                  +8% from last month
                </div>
              </div>

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
                  fontSize: '1.75rem', 
                  fontWeight: '700', 
                  margin: '0.5rem 0 0 0',
                  color: '#111827'
                }}>86</p>
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: '#6B7280', 
                  margin: '0.1rem 0 0 0'
                }}>hours this month</p>
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
                }}>Psychology</p>
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: '#F5F5F5', 
                  margin: '0.1rem 0 0 0',
                  opacity: 0.8
                }}>12 books this month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}