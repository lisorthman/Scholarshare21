'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ResearcherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ _id: string; name: string; email: string; role: 'admin' | 'researcher' | 'user'; createdAt: string; updatedAt: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);

  // Mock data for uploads status
  const [uploads, setUploads] = useState([
    {
      id: 1,
      title: "The Impact of AI on Education",
      date: "2023-10-15",
      status: "accepted",
      comments: "Great research! Published in Volume 12"
    },
    {
      id: 2,
      title: "Renewable Energy Solutions for Urban Areas",
      date: "2023-11-02",
      status: "accepted",
      comments: "Minor edits suggested"
    },
    {
      id: 3,
      title: "Blockchain in Healthcare Systems",
      date: "2023-11-20",
      status: "pending",
      comments: "Under review"
    },
    {
      id: 4,
      title: "Behavioral Economics of Pandemic Responses",
      date: "2023-12-05",
      status: "rejected",
      comments: "Needs more empirical data"
    },
    {
      id: 5,
      title: "Sustainable Agriculture Practices",
      date: "2023-12-18",
      status: "accepted",
      comments: "Excellent work! Published in Volume 13"
    }
  ]);

  // Mock data for recent activities
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: "upload",
      title: "Climate Change Impacts",
      date: "2023-12-20",
      time: "10:30 AM"
    },
    {
      id: 2,
      type: "reply",
      from: "Admin Team",
      message: "Your paper has been accepted",
      date: "2023-12-18",
      time: "2:15 PM"
    },
    {
      id: 3,
      type: "update",
      action: "profile picture",
      date: "2023-12-15",
      time: "9:45 AM"
    },
    {
      id: 4,
      type: "reply",
      from: "Reviewer #2",
      message: "Please add more data to section 3",
      date: "2023-12-12",
      time: "4:30 PM"
    }
  ]);

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
        if (data.valid && data.user.status === "Active" && data.user.role === "researcher") {
          setUser({
            _id: data.user._id,
            name: data.user.name,
            email: data.user.email,
            role: "researcher", // Explicitly set role for type safety
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

  useEffect(() => {
    if (user) {
      const fetchReaderStats = async () => {
        try {
          const response = await fetch('/api/researcher/reader-stats');
          const data = await response.json();

          const categories = Object.keys(data);
          const years = Object.keys(data[categories[0]]);
          
          const datasets = categories.map(category => ({
            label: category,
            data: years.map(year => data[category][year] || 0),
            backgroundColor: '#4e73df',
            borderColor: '#4e73df',
            borderWidth: 1
          }));

          setChartData({
            labels: years,
            datasets
          });
        } catch (error) {
          console.error('Error fetching reader stats:', error);
        }
      };

      fetchReaderStats();
    }
  }, [user]);

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
              Welcome, {user.name}!
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
              Great job! You've engaged 85% of visitors, welcomed 120 new
              users this month, and boosted active researchers by 30%. Keep up
              the amazing work in growing the ScholarShare community and
              making research more accessible!
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

          {/* Two-column layout for chart and uploads */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '2rem',
            width: '100%',
            flexWrap: 'wrap',
          }}>
            {/* Chart Section - takes 2/3 width on large screens */}
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
                Reader Stats by Category & Year
              </h2>
              <div style={{ 
                width: '100%',
                minHeight: '400px',
                position: 'relative'
              }}>
                {chartData ? (
                  <Bar 
                    data={chartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        title: {
                          display: true,
                          text: 'Number of Readers per Year by Category',
                        },
                        legend: {
                          position: 'top',
                        },
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: 'Year',
                          },
                        },
                        y: {
                          title: {
                            display: true,
                            text: 'Number of Readers',
                          },
                          beginAtZero: true,
                        },
                      },
                    }} 
                  />
                ) : (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px'
                  }}>
                    <p>Loading chart...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Uploads Status Section - takes 1/3 width on large screens */}
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
                Your Uploads Status
              </h2>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}>
                {uploads.map(upload => (
                  <div key={upload.id} style={{
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    backgroundColor: '#FFFFFF',
                    border: `1px solid ${
                      upload.status === 'accepted' ? '#10B981' : 
                      upload.status === 'rejected' ? '#EF4444' : 
                      '#F59E0B'
                    }`,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem',
                    }}>
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#111827',
                        margin: 0,
                      }}>
                        {upload.title}
                      </h3>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: upload.status === 'accepted' ? '#10B981' : 
                              upload.status === 'rejected' ? '#EF4444' : 
                              '#F59E0B',
                        textTransform: 'capitalize',
                      }}>
                        {upload.status}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#6B7280',
                      marginBottom: '0.5rem',
                    }}>
                      Submitted: {new Date(upload.date).toLocaleDateString()}
                    </p>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#4B5563',
                      fontStyle: 'italic',
                      margin: 0,
                    }}>
                      {upload.comments}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom section with stats cards and recent activities */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '2rem',
            width: '100%',
            flexWrap: 'wrap',
          }}>
            {/* Stats cards - 2x2 grid */}
            <div style={{
              flex: '2',
              minWidth: '300px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}>
              {/* Total Downloads Card */}
              <div style={{
                borderRadius: "0.75rem",
                backgroundColor: "rgba(86, 52, 52, 0.83)", // #563434 with 83% opacity
                padding: "1.25rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                color: "#FFFFFF",
                height: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ 
                    fontSize: '0.875rem', 
                    color: '#F5F5F5', 
                    margin: 0,
                    fontWeight: '500',
                    opacity: 0.9
                  }}>Total Downloads</h3>
                  <div style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '10px',
                  }}>
                    +11%
                  </div>
                </div>
                <p style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  margin: '0.25rem 0 0 0',
                  color: '#FFFFFF'
                }}>180</p>
              </div>

              {/* Most Viewed Category Card */}
              <div style={{
                borderRadius: "0.75rem",
                backgroundColor: "rgba(112, 40, 40, 0.32)", // #702828 with 32% opacity
                padding: "1.25rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                color: "#111827",
                height: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <h3 style={{ 
                  fontSize: '0.875rem', 
                  color: '#111827', 
                  margin: 0,
                  fontWeight: '500'
                }}>Most Viewed Category</h3>
                <p style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  margin: '0.25rem 0 0 0',
                  color: '#111827'
                }}>IT & Computer</p>
              </div>

              {/* Hours Spent Card */}
              <div style={{
                borderRadius: "0.75rem",
                backgroundColor: "rgba(86, 52, 52, 0.83)", // #563434 with 83% opacity
                padding: "1.25rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                color: "#FFFFFF",
                height: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <h3 style={{ 
                  fontSize: '0.875rem', 
                  color: '#F5F5F5', 
                  margin: 0,
                  fontWeight: '500',
                  opacity: 0.9
                }}>Hours Spent</h3>
                <div>
                  <p style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '700', 
                    margin: '0.25rem 0 0 0',
                    color: '#FFFFFF'
                  }}>400</p>
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: '#F5F5F5', 
                    margin: '0.1rem 0 0 0',
                    opacity: 0.8
                  }}>hours</p>
                </div>
              </div>

              {/* Total Views Card */}
              <div style={{
                borderRadius: "0.75rem",
                backgroundColor: "rgba(112, 40, 40, 0.32)", // #702828 with 32% opacity
                padding: "1.25rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                color: "#111827",
                height: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ 
                    fontSize: '0.875rem', 
                    color: '#111827', 
                    margin: 0,
                    fontWeight: '500'
                  }}>Total Views</h3>
                  <div style={{
                    backgroundColor: 'rgba(0,0,0,0.08)',
                    color: '#111827',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '10px',
                  }}>
                    +11.01%
                  </div>
                </div>
                <p style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  margin: '0.25rem 0 0 0',
                  color: '#111827'
                }}>7,265</p>
              </div>
            </div>

            {/* Recent Activities Column */}
            <div style={{
              flex: '1',
              minWidth: '300px',
              borderRadius: "0.75rem",
              backgroundColor: "#F8F9FA",
              padding: "1.5rem",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              border: "1px solid #E9ECEF",
            }}>
              <h2 style={{
                fontSize: "1.1rem",
                fontWeight: "700",
                marginBottom: "1.25rem",
                color: "#212529",
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
                    padding: '0.9rem',
                    borderRadius: '0.5rem',
                    backgroundColor: '#FFFFFF',
                    borderLeft: `3px solid ${
                      activity.type === "upload" ? '#563434' : 
                      activity.type === "reply" ? '#702828' : 
                      '#495057'
                    }`,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}>
                    {activity.type === "upload" && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(86, 52, 52, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <span style={{ 
                              fontSize: '0.7rem',
                              color: '#563434',
                              fontWeight: 'bold'
                            }}>UP</span>
                          </div>
                          <p style={{ 
                            fontWeight: '600', 
                            margin: 0,
                            fontSize: '0.9rem',
                            color: '#212529'
                          }}>New paper uploaded</p>
                        </div>
                        <p style={{ 
                          margin: '0.2rem 0 0 0', 
                          fontSize: '0.8rem',
                          color: '#495057'
                        }}>{activity.title}</p>
                      </>
                    )}
                    {activity.type === "reply" && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(112, 40, 40, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <span style={{ 
                              fontSize: '0.7rem',
                              color: '#702828',
                              fontWeight: 'bold'
                            }}>RP</span>
                          </div>
                          <p style={{ 
                            fontWeight: '600', 
                            margin: 0,
                            fontSize: '0.9rem',
                            color: '#212529'
                          }}>Reply from {activity.from}</p>
                        </div>
                        <p style={{ 
                          margin: '0.2rem 0 0 0', 
                          fontSize: '0.8rem',
                          color: '#495057'
                        }}>{activity.message}</p>
                      </>
                    )}
                    {activity.type === "update" && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(73, 80, 87, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <span style={{ 
                            fontSize: '0.7rem',
                            color: '#495057',
                            fontWeight: 'bold'
                          }}>UP</span>
                        </div>
                        <p style={{ 
                          fontWeight: '600', 
                          margin: 0,
                          fontSize: '0.9rem',
                          color: '#212529'
                        }}>Updated {activity.action}</p>
                      </div>
                    )}
                    <p style={{ 
                      fontSize: '0.7rem', 
                      color: '#6C757D', 
                      margin: '0.4rem 0 0 0',
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
        </div>
      </div>
    </DashboardLayout>
  );
}