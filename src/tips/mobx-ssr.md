```typescript
// PROJECT STRUCTURE FOR APP ROUTER
/*
app/
├── layout.tsx                 # Root layout (optional store provider)
├── page.tsx                   # Home page
├── users/
│   ├── page.tsx              # Users page (SSR with store)
│   ├── [id]/
│   │   └── page.tsx          # Individual user (dynamic SSR)
│   └── client/
│       └── page.tsx          # Users page (CSR only)
├── dashboard/
│   ├── layout.tsx            # Dashboard layout with store
│   └── page.tsx              # Dashboard page
└── api/
    ├── users/
    │   └── route.ts          # API routes
    └── posts/
        └── route.ts

stores/
├── UserStore.ts
├── PostStore.ts
├── RootStore.ts
└── providers/
    ├── StoreProvider.tsx     # Root store provider
    ├── UserStoreProvider.tsx # Individual store provider
    └── FeatureProviders.tsx  # Feature-specific providers
*/

// 1. INDIVIDUAL STORES APPROACH IN APP ROUTER

// stores/UserStore.ts
import { makeAutoObservable } from 'mobx';

export interface User {
  id: number;
  name: string;
  email: string;
}

export class UserStore {
  users: User[] = [];
  selectedUserId: number | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // SSR data fetching
  async loadUsers(users?: User[]) {
    if (users) {
      this.users = users;
      return;
    }

    this.isLoading = true;
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      this.users = data;
    } catch (error) {
      this.error = 'Failed to load users';
    } finally {
      this.isLoading = false;
    }
  }

  selectUser(id: number) {
    this.selectedUserId = id;
  }

  get selectedUser() {
    return this.users.find(user => user.id === this.selectedUserId) || null;
  }

  serialize() {
    return {
      users: this.users,
      selectedUserId: this.selectedUserId,
      isLoading: this.isLoading,
      error: this.error
    };
  }

  hydrate(data: ReturnType<UserStore['serialize']>) {
    this.users = data.users || [];
    this.selectedUserId = data.selectedUserId || null;
    this.isLoading = data.isLoading || false;
    this.error = data.error || null;
  }
}

// stores/providers/UserStoreProvider.tsx
'use client';

import { createContext, useContext, useRef, ReactNode } from 'react';
import { UserStore } from '../UserStore';

interface UserStoreContextType {
  userStore: UserStore;
}

const UserStoreContext = createContext<UserStoreContextType | null>(null);

interface UserStoreProviderProps {
  children: ReactNode;
  initialData?: ReturnType<UserStore['serialize']>;
}

export function UserStoreProvider({ children, initialData }: UserStoreProviderProps) {
  const storeRef = useRef<UserStore>();

  if (!storeRef.current) {
    storeRef.current = new UserStore();
    if (initialData) {
      storeRef.current.hydrate(initialData);
    }
  }

  return (
    <UserStoreContext.Provider value={{ userStore: storeRef.current }}>
      {children}
    </UserStoreContext.Provider>
  );
}

export function useUserStore() {
  const context = useContext(UserStoreContext);
  if (!context) {
    throw new Error('useUserStore must be used within UserStoreProvider');
  }
  return context.userStore;
}

// 2. USERS PAGE WITH SSR (Individual Store)

// app/users/page.tsx
import { UserStoreProvider } from '@/stores/providers/UserStoreProvider';
import { UsersList } from './UsersList';

// Server Component - fetches data on server
async function getUsersData() {
  // This runs on the server
  const response = await fetch('http://localhost:3000/api/users', {
    cache: 'no-store' // Always fresh data for SSR
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
}

export default async function UsersPage() {
  // Fetch data on server
  const users = await getUsersData();
  
  // Prepare initial store data
  const initialUserData = {
    users,
    selectedUserId: null,
    isLoading: false,
    error: null
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Users (SSR with Individual Store)</h1>
      <UserStoreProvider initialData={initialUserData}>
        <UsersList />
      </UserStoreProvider>
    </div>
  );
}

// app/users/UsersList.tsx
'use client';

import { observer } from 'mobx-react-lite';
import { useUserStore } from '@/stores/providers/UserStoreProvider';

export const UsersList = observer(() => {
  const userStore = useUserStore();

  const handleSelectUser = (id: number) => {
    userStore.selectUser(id);
  };

  const handleRefresh = () => {
    userStore.loadUsers(); // CSR refresh
  };

  if (userStore.isLoading) {
    return <div>Loading...</div>;
  }

  if (userStore.error) {
    return <div className="text-red-500">Error: {userStore.error}</div>;
  }

  return (
    <div>
      <button 
        onClick={handleRefresh}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Refresh Users
      </button>
      
      <div className="grid gap-4">
        {userStore.users.map(user => (
          <div 
            key={user.id}
            className={`p-4 border rounded cursor-pointer ${
              userStore.selectedUserId === user.id ? 'bg-blue-100' : 'bg-white'
            }`}
            onClick={() => handleSelectUser(user.id)}
          >
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
        ))}
      </div>

      {userStore.selectedUser && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3>Selected User:</h3>
          <p><strong>Name:</strong> {userStore.selectedUser.name}</p>
          <p><strong>Email:</strong> {userStore.selectedUser.email}</p>
        </div>
      )}
    </div>
  );
});

// 3. DYNAMIC ROUTE WITH SSR

// app/users/[id]/page.tsx
import { notFound } from 'next/navigation';
import { UserStoreProvider } from '@/stores/providers/UserStoreProvider';
import { UserDetail } from './UserDetail';

async function getUserData(id: string) {
  const response = await fetch(`http://localhost:3000/api/users/${id}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

interface UserPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;
  const user = await getUserData(id);

  if (!user) {
    notFound();
  }

  const initialUserData = {
    users: [user], // Single user in array
    selectedUserId: user.id,
    isLoading: false,
    error: null
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Details (SSR)</h1>
      <UserStoreProvider initialData={initialUserData}>
        <UserDetail />
      </UserStoreProvider>
    </div>
  );
}

// app/users/[id]/UserDetail.tsx
'use client';

import { observer } from 'mobx-react-lite';
import { useUserStore } from '@/stores/providers/UserStoreProvider';
import Link from 'next/link';

export const UserDetail = observer(() => {
  const userStore = useUserStore();
  const user = userStore.selectedUser;

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <Link 
        href="/users"
        className="mb-4 inline-block text-blue-500 hover:text-blue-700"
      >
        ← Back to Users
      </Link>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">{user.name}</h2>
        <p className="text-gray-600 mb-4">{user.email}</p>
        <p><strong>ID:</strong> {user.id}</p>
      </div>
    </div>
  );
});

// 4. CSR ONLY PAGE (Client-Side Rendering)

// app/users/client/page.tsx
'use client';

import { UserStoreProvider } from '@/stores/providers/UserStoreProvider';
import { UsersListCSR } from './UsersListCSR';

export default function UsersClientPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Users (CSR with Individual Store)</h1>
      <UserStoreProvider>
        <UsersListCSR />
      </UserStoreProvider>
    </div>
  );
}

// app/users/client/UsersListCSR.tsx
'use client';

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useUserStore } from '@/stores/providers/UserStoreProvider';

export const UsersListCSR = observer(() => {
  const userStore = useUserStore();

  useEffect(() => {
    // Fetch data on client mount
    userStore.loadUsers();
  }, [userStore]);

  if (userStore.isLoading) {
    return <div>Loading users...</div>;
  }

  if (userStore.error) {
    return <div className="text-red-500">Error: {userStore.error}</div>;
  }

  return (
    <div>
      <p className="mb-4 text-gray-600">
        This page loads data on the client side only.
      </p>
      
      <button 
        onClick={() => userStore.loadUsers()}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Reload Users
      </button>

      <div className="grid gap-4">
        {userStore.users.map(user => (
          <div key={user.id} className="p-4 border rounded bg-white">
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
});

// 5. ROOT STORE APPROACH IN APP ROUTER

// stores/RootStore.ts
import { makeAutoObservable } from 'mobx';
import { UserStore } from './UserStore';
import { PostStore } from './PostStore';

export class RootStore {
  userStore: UserStore;
  postStore: PostStore;

  constructor() {
    this.userStore = new UserStore();
    this.postStore = new PostStore();
    makeAutoObservable(this);
  }

  // Cross-store computed values
  get selectedUserPosts() {
    if (!this.userStore.selectedUserId) return [];
    return this.postStore.posts.filter(
      post => post.userId === this.userStore.selectedUserId
    );
  }

  // Cross-store actions
  async loadUserWithPosts(userId: number) {
    this.userStore.selectUser(userId);
    await this.postStore.loadPostsByUser(userId);
  }

  serialize() {
    return {
      userStore: this.userStore.serialize(),
      postStore: this.postStore.serialize()
    };
  }

  hydrate(data: ReturnType<RootStore['serialize']>) {
    if (data.userStore) this.userStore.hydrate(data.userStore);
    if (data.postStore) this.postStore.hydrate(data.postStore);
  }
}

// stores/providers/RootStoreProvider.tsx
'use client';

import { createContext, useContext, useRef, ReactNode } from 'react';
import { RootStore } from '../RootStore';

const RootStoreContext = createContext<RootStore | null>(null);

interface RootStoreProviderProps {
  children: ReactNode;
  initialData?: ReturnType<RootStore['serialize']>;
}

export function RootStoreProvider({ children, initialData }: RootStoreProviderProps) {
  const storeRef = useRef<RootStore>();

  if (!storeRef.current) {
    storeRef.current = new RootStore();
    if (initialData) {
      storeRef.current.hydrate(initialData);
    }
  }

  return (
    <RootStoreContext.Provider value={storeRef.current}>
      {children}
    </RootStoreContext.Provider>
  );
}

export function useRootStore() {
  const context = useContext(RootStoreContext);
  if (!context) {
    throw new Error('useRootStore must be used within RootStoreProvider');
  }
  return context;
}

// Convenience hooks for specific stores
export function useUserStore() {
  return useRootStore().userStore;
}

export function usePostStore() {
  return useRootStore().postStore;
}

// 6. APP LAYOUT WITH ROOT STORE

// app/layout.tsx
import type { Metadata } from 'next';
import { RootStoreProvider } from '@/stores/providers/RootStoreProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'MobX Next.js App',
  description: 'MobX with Next.js 15 App Router',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Root Store available throughout the app */}
        <RootStoreProvider>
          <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto">
              <h1 className="text-xl font-bold">MobX App</h1>
            </div>
          </nav>
          <main>{children}</main>
        </RootStoreProvider>
      </body>
    </html>
  );
}

// 7. DASHBOARD WITH CROSS-STORE INTERACTIONS

// app/dashboard/page.tsx
import { RootStoreProvider } from '@/stores/providers/RootStoreProvider';
import { DashboardContent } from './DashboardContent';

async function getDashboardData() {
  const [usersResponse, postsResponse] = await Promise.all([
    fetch('http://localhost:3000/api/users'),
    fetch('http://localhost:3000/api/posts')
  ]);

  const [users, posts] = await Promise.all([
    usersResponse.json(),
    postsResponse.json()
  ]);

  return { users, posts };
}

export default async function DashboardPage() {
  const { users, posts } = await getDashboardData();

  const initialData = {
    userStore: {
      users,
      selectedUserId: null,
      isLoading: false,
      error: null
    },
    postStore: {
      posts,
      selectedPost: null,
      isLoading: false,
      error: null
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard (Root Store SSR)</h1>
      {/* If using root layout, this provider is redundant */}
      <DashboardContent />
    </div>
  );
}

// app/dashboard/DashboardContent.tsx
'use client';

import { observer } from 'mobx-react-lite';
import { useUserStore, usePostStore, useRootStore } from '@/stores/providers/RootStoreProvider';

export const DashboardContent = observer(() => {
  const userStore = useUserStore();
  const postStore = usePostStore();
  const rootStore = useRootStore();

  const handleUserSelect = async (userId: number) => {
    await rootStore.loadUserWithPosts(userId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Users Column */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Users</h2>
        <div className="space-y-2">
          {userStore.users.slice(0, 5).map(user => (
            <div
              key={user.id}
              className={`p-2 rounded cursor-pointer ${
                userStore.selectedUserId === user.id
                  ? 'bg-blue-100'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => handleUserSelect(user.id)}
            >
              {user.name}
            </div>
          ))}
        </div>
      </div>

      {/* Posts Column */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">
          Posts 
          {userStore.selectedUser && ` by ${userStore.selectedUser.name}`}
        </h2>
        <div className="space-y-2">
          {rootStore.selectedUserPosts.slice(0, 5).map(post => (
            <div key={post.id} className="p-2 border rounded">
              <h3 className="font-medium">{post.title}</h3>
              <p className="text-sm text-gray-600 truncate">{post.body}</p>
            </div>
          ))}
          {rootStore.selectedUserPosts.length === 0 && (
            <p className="text-gray-500">Select a user to see their posts</p>
          )}
        </div>
      </div>

      {/* Stats Column */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Stats</h2>
        <div className="space-y-2">
          <p><strong>Total Users:</strong> {userStore.users.length}</p>
          <p><strong>Total Posts:</strong> {postStore.posts.length}</p>
          <p><strong>Selected User Posts:</strong> {rootStore.selectedUserPosts.length}</p>
        </div>
      </div>
    </div>
  );
});

// 8. FEATURE-BASED LAYOUT (Hybrid Approach)

// app/dashboard/layout.tsx
import { ReactNode } from 'react';
import { DashboardStoreProvider } from './providers/DashboardStoreProvider';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="dashboard-layout">
      <DashboardStoreProvider>
        <aside className="dashboard-sidebar">
          {/* Dashboard-specific sidebar */}
        </aside>
        <div className="dashboard-content">
          {children}
        </div>
      </DashboardStoreProvider>
    </div>
  );
}

// 9. API ROUTES FOR DATA FETCHING

// app/api/users/route.ts
import { NextResponse } from 'next/server';

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
];

export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return NextResponse.json(users);
}

// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = users.find(u => u.id === parseInt(id));
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  return NextResponse.json(user);
}

// app/api/posts/route.ts
import { NextResponse } from 'next/server';

const posts = [
  { id: 1, title: 'First Post', body: 'This is the first post...', userId: 1 },
  { id: 2, title: 'Second Post', body: 'This is the second post...', userId: 1 },
  { id: 3, title: 'Third Post', body: 'This is the third post...', userId: 2 },
];

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 800));
  return NextResponse.json(posts);
}
```