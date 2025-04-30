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
        if (data.valid && data.user.role === 'researcher') {
          setUser({
            _id: data.user._id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
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

  // Fetch the chart data when user is available
  useEffect(() => {
    if (user) {
      const fetchReaderStats = async () => {
        try {
          const response = await fetch('/api/researcher/reader-stats');
          const data = await response.json();
          console.log("Fetched Data: ", data); // Debugging log

          const categories = Object.keys(data); // Category names
          const years = Object.keys(data[categories[0]]); // Years
          
          // Create the dataset for each category
          const datasets = categories.map(category => ({
            label: category,
            data: years.map(year => data[category][year] || 0),
            backgroundColor: '#4e73df', // Adjust as needed
            borderColor: '#4e73df',
            borderWidth: 1
          }));

          // Set the chart data
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
      <div style={{
        maxWidth: '2800px',
        margin: '0 auto',
        padding: '2rem',
        fontFamily: 'Space Grotesk, sans-serif',
      }}>
        {/* Welcome Section */}
        <div
          style={{
            marginBottom: "2.5rem",
            borderRadius: "1rem",
            backgroundColor: "#DCD3D0",
            padding: "2rem 1.5rem",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            width: '1200px',
          }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "800",
              marginBottom: "0.75rem",
              color: "#000",
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            Welcome, {user.name}!
          </h1>
          <p
            style={{
              color: "#1F2937",
              maxWidth: "48rem",
              fontSize: "1rem",
              lineHeight: "1.6",
              marginBottom: "1.5rem",
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            Great job! You've engaged 85% of visitors, welcomed 120 new
            users this month, and boosted active researchers by 30%. Keep up
            the amazing work in growing the ScholarShare community and
            making research more accessible!
          </p>
        </div>

        {/* Chart Section */}
        <div style={{ marginBottom: '3rem' }}>
          <h2>Reader Stats by Category & Year</h2>
          {chartData ? (
            <Bar data={chartData} options={{
              responsive: true,
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
            }} />
          ) : (
            <p>Loading chart...</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
