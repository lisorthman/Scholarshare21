'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useAuthContext } from '@/components/AuthProvider';
import jsPDF from 'jspdf';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ResearcherDashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated, hasRole } = useAuthContext();
  const [chartData, setChartData] = useState<any>(null);
  const [stats, setStats] = useState<{
    totalDownloads: number;
    totalViews: number;
    uniqueDownloads: number;
    uniqueViews: number;
    mostViewedCategory: string;
    paperCount: number;
    downloadPercentageChange: number;
    viewPercentageChange: number;
    newUsersThisMonth: number;
  } | null>(null);

  // Real data for uploads status
  const [uploads, setUploads] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  // Check authentication and role
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/signin');
        return;
      }
      
      if (!hasRole('researcher')) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [loading, isAuthenticated, hasRole, router]);

  useEffect(() => {
    if (user && isAuthenticated) {
      const fetchData = async () => {
        try {
          // Fetch reader stats for chart
          const readerStatsResponse = await fetch(`/api/researcher/reader-stats?researcherId=${user._id}`);
          const readerStatsData = await readerStatsResponse.json();

          if (Object.keys(readerStatsData).length > 0) {
            const categories = Object.keys(readerStatsData);
            const years = Object.keys(readerStatsData[categories[0]] || {});
          
          const datasets = categories.map(category => ({
            label: category,
              data: years.map(year => readerStatsData[category][year] || 0),
            backgroundColor: '#4e73df',
            borderColor: '#4e73df',
            borderWidth: 1
          }));

          setChartData({
            labels: years,
            datasets
          });
          }

          // Fetch general stats
          const statsResponse = await fetch(`/api/researcher/stats?researcherId=${user._id}`);
          const statsData = await statsResponse.json();
          setStats(statsData);

          // Fetch papers data
          const papersResponse = await fetch(`/api/researcher/papers?userId=${user._id}`);
          const papersData = await papersResponse.json();
          setUploads(papersData.papers || []);

          // Fetch reviews data
          const reviewsResponse = await fetch(`/api/researcher/reviews?researcherId=${user._id}`);
          const reviewsData = await reviewsResponse.json();
          setReviews(reviewsData.reviews || []);

          // Fetch activities data
          const activitiesResponse = await fetch(`/api/researcher/activities?researcherId=${user._id}`);
          const activitiesData = await activitiesResponse.json();
          setActivities(activitiesData.activities || []);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
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
      <style jsx>{`
        .scrollable-container::-webkit-scrollbar {
          width: 6px;
        }
        .scrollable-container::-webkit-scrollbar-track {
          background: #F7FAFC;
          border-radius: 3px;
        }
        .scrollable-container::-webkit-scrollbar-thumb {
          background: #CBD5E0;
          border-radius: 3px;
        }
        .scrollable-container::-webkit-scrollbar-thumb:hover {
          background: #A0AEC0;
        }
      `}</style>
      {/* White full-page container */}
      <div style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        padding: '1.5rem',
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
          gap: '1.5rem',
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
              Great job! You've engaged {stats ? (stats.viewPercentageChange >= 0 ? '+' : '') + stats.viewPercentageChange + '%' : '...'} of visitors, welcomed {stats ? stats.newUsersThisMonth : '...'} new users this month. Keep up the amazing work in growing the ScholarShare community and making research more accessible!
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
              padding: "1.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #E5E7EB",
              height: 'fit-content',
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
              padding: "1.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #E5E7EB",
              maxHeight: '600px',
              display: 'flex',
              flexDirection: 'column',
              height: 'fit-content',
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
              
              <div className="scrollable-container" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                overflowY: 'auto',
                flex: 1,
                paddingRight: '0.5rem',
                scrollbarWidth: 'thin',
                scrollbarColor: '#CBD5E0 #F7FAFC',
              }}>
                {uploads.length > 0 ? uploads.map(upload => (
                  <div key={upload._id} style={{
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    backgroundColor: '#FFFFFF',
                    border: `2px solid ${
                      upload.status === 'passed_checks' ? '#10B981' : 
                      upload.status === 'rejected' || upload.status === 'rejected_plagiarism' || upload.status === 'rejected_ai' ? '#EF4444' : 
                      upload.status === 'approved' ? '#10B981' :
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
                        color: upload.status === 'passed_checks' ? '#10B981' : 
                              upload.status === 'rejected' || upload.status === 'rejected_plagiarism' || upload.status === 'rejected_ai' ? '#EF4444' : 
                              upload.status === 'approved' ? '#10B981' :
                              '#F59E0B',
                        textTransform: 'capitalize',
                      }}>
                        {upload.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#6B7280',
                      marginBottom: '0.5rem',
                    }}>
                      Submitted: {new Date(upload.createdAt).toLocaleDateString()}
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      fontSize: '0.75rem',
                      color: '#4B5563',
                    }}>
                      <span>Views: {upload.views || 0}</span>
                      <span>Downloads: {upload.downloads || 0}</span>
                      <span>Category: {upload.category}</span>
                    </div>
                  </div>
                )) : (
                  <div style={{
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    textAlign: 'center',
                    color: '#6B7280',
                  }}>
                    No papers uploaded yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Reviews Carousel Section */}
          <div style={{
            width: '100%',
            borderRadius: "1.5rem",
            backgroundColor: "#F9FAFB",
            padding: "1.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #E5E7EB",
            maxHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h2 style={{
              fontSize: "1.25rem",
              fontWeight: "700",
              marginBottom: "1.5rem",
              color: "#111827",
              fontFamily: 'Space Grotesk, sans-serif',
            }}>
              User Reviews & Ratings
            </h2>
            
            {reviews.length > 0 ? (
              <div className="scrollable-container" style={{
                display: 'flex',
                gap: '1.5rem',
                overflowX: 'auto',
                overflowY: 'hidden',
                flex: 1,
                paddingBottom: '1rem',
                scrollbarWidth: 'thin',
                scrollbarColor: '#CBD5E0 #F7FAFC',
              }}>
                {reviews.map(review => (
                  <div key={review._id} style={{
                    minWidth: '300px',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}>
                    {/* Paper Title */}
                    <div style={{
                      padding: '0.5rem',
                      backgroundColor: '#F3F4F6',
                      borderRadius: '0.5rem',
                    }}>
                      <h3 style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        margin: 0,
                        lineHeight: '1.4',
                      }}>
                        {review.paperTitle}
                      </h3>
                    </div>

                    {/* Rating Stars */}
                    <div style={{
                      display: 'flex',
                      gap: '0.25rem',
                    }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} style={{
                          color: star <= review.rating ? '#F59E0B' : '#D1D5DB',
                          fontSize: '1.25rem',
                        }}>
                          ★
                        </span>
                      ))}
                      <span style={{
                        marginLeft: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#6B7280',
                        fontWeight: '500',
                      }}>
                        {review.rating}/5
                      </span>
                    </div>

                    {/* Review Message */}
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#374151',
                      lineHeight: '1.5',
                      margin: 0,
                      flex: 1,
                    }}>
                      "{review.message}"
                    </p>

                    {/* Reviewer Info & Date */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.75rem',
                      color: '#6B7280',
                      borderTop: '1px solid #E5E7EB',
                      paddingTop: '0.75rem',
                    }}>
                      <span style={{ fontWeight: '500' }}>
                        {review.reviewerName}
                      </span>
                      <span>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#6B7280',
              }}>
                No reviews yet. Share your papers to get feedback from the community!
            </div>
            )}
          </div>

          {/* Bottom section with stats cards, recent activities, and quick actions */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '2rem',
            width: '100%',
            flexWrap: 'wrap',
          }}>
            {/* Left column: Stats cards and Quick Actions */}
            <div style={{
              flex: '2',
              minWidth: '300px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}>
              {/* Stats cards - 2x2 grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}>
                {/* Total Downloads Card */}
                <div style={{
                  borderRadius: "0.75rem",
                  backgroundColor: "rgba(86, 52, 52, 0.83)", // #563434 with 83% opacity
                  padding: "1.5rem",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  color: "#FFFFFF",
                  height: '140px',
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
                      backgroundColor: stats && stats.downloadPercentageChange >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: stats && stats.downloadPercentageChange >= 0 ? '#22C55E' : '#EF4444',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '10px',
                    }}>
                      {stats ? (stats.downloadPercentageChange >= 0 ? '+' : '') + stats.downloadPercentageChange + '%' : '...'}
                    </div>
                  </div>
                  <p style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '700', 
                    margin: '0.25rem 0 0 0',
                    color: '#FFFFFF'
                  }}>{stats ? stats.totalDownloads : '...'}</p>
                </div>

                {/* Most Viewed Category Card */}
                <div style={{
                  borderRadius: "0.75rem",
                  backgroundColor: "rgba(112, 40, 40, 0.32)", // #702828 with 32% opacity
                  padding: "1.5rem",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  color: "#111827",
                  height: '140px',
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
                  }}>{stats ? stats.mostViewedCategory : '...'}</p>
                </div>

                {/* Total Papers Card */}
                <div style={{
                  borderRadius: "0.75rem",
                  backgroundColor: "rgba(86, 52, 52, 0.83)", // #563434 with 83% opacity
                  padding: "1.5rem",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  color: "#FFFFFF",
                  height: '140px',
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
                  }}>Total Papers</h3>
                  <div>
                    <p style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: '700', 
                      margin: '0.25rem 0 0 0',
                      color: '#FFFFFF'
                  }}>{stats ? stats.paperCount : '...'}</p>
                    <p style={{ 
                      fontSize: '0.75rem', 
                      color: '#F5F5F5', 
                      margin: '0.1rem 0 0 0',
                      opacity: 0.8
                    }}>papers</p>
                  </div>
                </div>

                {/* Total Views Card */}
                <div style={{
                  borderRadius: "0.75rem",
                  backgroundColor: "rgba(112, 40, 40, 0.32)", // #702828 with 32% opacity
                  padding: "1.5rem",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  color: "#111827",
                  height: '140px',
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
                      backgroundColor: stats && stats.viewPercentageChange >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: stats && stats.viewPercentageChange >= 0 ? '#22C55E' : '#EF4444',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '10px',
                    }}>
                      {stats ? (stats.viewPercentageChange >= 0 ? '+' : '') + stats.viewPercentageChange + '%' : '...'}
                    </div>
                  </div>
                  <p style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '700', 
                    margin: '0.25rem 0 0 0',
                    color: '#111827'
                  }}>{stats ? stats.totalViews : '...'}</p>
                </div>
              </div>

              {/* Quick Actions Section - Same width as stats cards */}
              <div style={{
                width: '100%',
                borderRadius: "0.75rem",
                backgroundColor: "rgba(86, 52, 52, 0.83)",
                padding: "1.5rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                color: "#FFFFFF",
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ 
                    fontSize: '1rem', 
                    color: '#F5F5F5', 
                    margin: 0,
                    fontWeight: '600',
                    opacity: 0.9
                  }}>Quick Actions</h3>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}>
                  {/* Upload New Paper Button */}
                  <button
                    onClick={() => router.push('/researcher-dashboard/uploads')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1.25rem',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      justifyContent: 'center',
                      minWidth: '140px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <span style={{ fontSize: '1.125rem' }}>📄</span>
                    Upload Paper
                  </button>

                  {/* View All Papers Button */}
                  <button
                    onClick={() => router.push('/researcher-dashboard/uploads')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1.25rem',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      justifyContent: 'center',
                      minWidth: '140px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <span style={{ fontSize: '1.125rem' }}>📚</span>
                    View All Papers
                  </button>

                  {/* Edit Profile Button */}
                  <button
                    onClick={() => router.push('/researcher-dashboard/profile')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1.25rem',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      justifyContent: 'center',
                      minWidth: '140px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <span style={{ fontSize: '1.125rem' }}>👤</span>
                    Edit Profile
                  </button>

                  {/* Download Report Button */}
                  <button
                    onClick={() => {
                      const reportData = {
                        totalDownloads: stats?.totalDownloads || 0,
                        totalViews: stats?.totalViews || 0,
                        totalPapers: stats?.paperCount || 0,
                        mostViewedCategory: stats?.mostViewedCategory || 'None',
                        downloadPercentageChange: stats?.downloadPercentageChange || 0,
                        viewPercentageChange: stats?.viewPercentageChange || 0,
                        date: new Date().toLocaleDateString()
                      };

                      // Generate PDF using jsPDF
                      const doc = new jsPDF();
                      doc.setFontSize(18);
                      doc.text('Research Analytics Report', 14, 20);
                      doc.setFontSize(12);
                      doc.text(`Date: ${reportData.date}`, 14, 30);
                      doc.text(`Total Downloads: ${reportData.totalDownloads}`, 14, 40);
                      doc.text(`Total Views: ${reportData.totalViews}`, 14, 50);
                      doc.text(`Total Papers: ${reportData.totalPapers}`, 14, 60);
                      doc.text(`Most Viewed Category: ${reportData.mostViewedCategory}`, 14, 70);
                      doc.text(`Download % Change: ${reportData.downloadPercentageChange}%`, 14, 80);
                      doc.text(`View % Change: ${reportData.viewPercentageChange}%`, 14, 90);
                      doc.save(`research-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1.25rem',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      justifyContent: 'center',
                      minWidth: '140px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <span style={{ fontSize: '1.125rem' }}>📊</span>
                    Download Report
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activities Column */}
            <div style={{
              flex: '1',
              minWidth: '300px',
              borderRadius: "0.75rem",
              backgroundColor: "#F8F9FA",
              padding: "1.25rem",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              border: "1px solid #E9ECEF",
              height: 'fit-content',
              display: 'flex',
              flexDirection: 'column',
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
              
              <div className="scrollable-container" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                overflowY: 'auto',
                flex: 1,
                paddingRight: '0.5rem',
                scrollbarWidth: 'thin',
                scrollbarColor: '#CBD5E0 #F7FAFC',
                maxHeight: '400px',
              }}>
                {activities.length > 0 ? activities.map(activity => (
                  <div 
                    key={activity.id} 
                    onClick={() => {
                      if (activity.type === 'profile_photo' || activity.type === 'profile_edit') {
                        // Navigate to profile page
                        router.push('/researcher-dashboard/profile');
                      }
                    }}
                    style={{
                    padding: '0.9rem',
                    borderRadius: '0.5rem',
                    backgroundColor: '#FFFFFF',
                    borderLeft: `3px solid ${
                      activity.type === "upload" ? '#563434' : 
                        activity.type === "edit" ? '#3B82F6' :
                        activity.type === "admin_response" ? '#10B981' :
                        activity.type === "user_reply" ? '#F59E0B' :
                        activity.type === "profile_photo" || activity.type === "profile_edit" ? '#8B5CF6' :
                      '#495057'
                    }`,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      cursor: activity.type === 'profile_photo' || activity.type === 'profile_edit' ? 'pointer' : 'default',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                    }}
                  >
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
                    {activity.type === "edit" && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <span style={{ 
                              fontSize: '0.7rem',
                              color: '#3B82F6',
                              fontWeight: 'bold'
                            }}>ED</span>
                          </div>
                          <p style={{ 
                            fontWeight: '600', 
                            margin: 0,
                            fontSize: '0.9rem',
                            color: '#212529'
                          }}>Paper edited</p>
                        </div>
                        <p style={{ 
                          margin: '0.2rem 0 0 0', 
                          fontSize: '0.8rem',
                          color: '#495057'
                        }}>{activity.title}</p>
                      </>
                    )}
                    {activity.type === "admin_response" && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <span style={{ 
                              fontSize: '0.7rem',
                              color: '#10B981',
                              fontWeight: 'bold'
                            }}>AD</span>
                          </div>
                          <p style={{ 
                            fontWeight: '600', 
                            margin: 0,
                            fontSize: '0.9rem',
                            color: '#212529'
                          }}>Admin response</p>
                        </div>
                        <p style={{ 
                          margin: '0.2rem 0 0 0', 
                          fontSize: '0.8rem',
                          color: '#495057'
                        }}>{activity.message}</p>
                      </>
                    )}
                    {activity.type === "user_reply" && (
                      <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <span style={{ 
                            fontSize: '0.7rem',
                              color: '#F59E0B',
                            fontWeight: 'bold'
                            }}>RV</span>
                        </div>
                        <p style={{ 
                          fontWeight: '600', 
                          margin: 0,
                          fontSize: '0.9rem',
                          color: '#212529'
                          }}>New review</p>
                      </div>
                        <p style={{ 
                          margin: '0.2rem 0 0 0', 
                          fontSize: '0.8rem',
                          color: '#495057'
                        }}>{activity.replyMessage}</p>
                        <p style={{ 
                          margin: '0.1rem 0 0 0', 
                          fontSize: '0.75rem',
                          color: '#6B7280',
                          fontStyle: 'italic'
                        }}>Paper: {activity.title}</p>
                      </>
                    )}
                    {(activity.type === "profile_photo" || activity.type === "profile_edit") && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <span style={{ 
                              fontSize: '0.7rem',
                              color: '#8B5CF6',
                              fontWeight: 'bold'
                            }}>PR</span>
                          </div>
                          <p style={{ 
                            fontWeight: '600', 
                            margin: 0,
                            fontSize: '0.9rem',
                            color: '#212529'
                          }}>{activity.message}</p>
                      </div>
                      </>
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
                )) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '1rem',
                    color: '#6B7280',
                    fontSize: '0.875rem',
                  }}>
                    No recent activities
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