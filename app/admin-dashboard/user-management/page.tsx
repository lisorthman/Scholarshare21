'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';

interface AdminUser extends User {
  id: string;
  joinDate: string;
  status: 'active' | 'suspended';
}

export default function UserManagement() {
  const router = useRouter();
  const [admin, setAdmin] = useState<User | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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
        if (data.valid && data.user.role === 'admin') {
          setAdmin(data.user);
          // Mock users data
          setUsers([
            {
              id: '1',
              name: 'John Researcher',
              email: 'john@research.edu',
              role: 'researcher',
              joinDate: '2023-01-15',
              status: 'active',
              _id: '',
              createdAt: '',
              updatedAt: ''
            },
            {
              id: '2',
              name: 'Sarah Author',
              email: 'sarah@university.edu',
              role: 'researcher',
              joinDate: '2023-03-22',
              status: 'active',
              _id: '',
              createdAt: '',
              updatedAt: ''
            },
            {
              id: '3',
              name: 'Mike Student',
              email: 'mike@college.edu',
              role: 'user',
              joinDate: '2023-05-10',
              status: 'suspended',
              _id: '',
              createdAt: '',
              updatedAt: ''
            }
          ]);
        } else {
          router.push('/unauthorized');
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        router.push('/login');
      }
    };

    verifyToken();
  }, [router]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(user =>
      user.id === id ? {
        ...user,
        status: user.status === 'active' ? 'suspended' : 'active'
      } : user
    ));
  };

  if (!admin) return <p>Loading...</p>;

  return (
    <DashboardLayout user={admin} defaultPage="User Management">
      <div style={{ marginTop: '20px', width: '100%' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{ fontSize: '28px' }}>User Management</h1>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 15px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              width: '300px'
            }}
          />
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>Email</th>
                <th style={tableHeaderStyle}>Role</th>
                <th style={tableHeaderStyle}>Joined</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={tableCellStyle}>{user.name}</td>
                  <td style={tableCellStyle}>{user.email}</td>
                  <td style={tableCellStyle}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: user.role === 'admin' ? '#e3f2fd' : 
                                      user.role === 'researcher' ? '#e8f5e9' : '#f5f5f5',
                      color: user.role === 'admin' ? '#1976d2' : 
                            user.role === 'researcher' ? '#2e7d32' : '#616161'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={tableCellStyle}>{user.joinDate}</td>
                  <td style={tableCellStyle}>
                    <span style={{
                      color: user.status === 'active' ? '#2e7d32' : '#d32f2f'
                    }}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td style={tableCellStyle}>
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: user.status === 'active' ? '#ffebee' : '#e8f5e9',
                        color: user.status === 'active' ? '#d32f2f' : '#2e7d32',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '8px'
                      }}
                    >
                      {user.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                    <button style={secondaryButtonStyle}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

const tableHeaderStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontWeight: '600',
  color: '#555'
};

const tableCellStyle = {
  padding: '12px 16px',
  color: '#333'
};

const secondaryButtonStyle = {
  padding: '6px 12px',
  backgroundColor: 'transparent',
  color: '#1976d2',
  border: '1px solid #1976d2',
  borderRadius: '4px',
  cursor: 'pointer'
};