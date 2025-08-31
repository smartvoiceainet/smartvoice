import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unauthorized Access',
  description: 'You do not have permission to access this page',
};

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You do not have permission to access this page. This could be because:
        </p>
        
        <ul className="list-disc text-left text-gray-600 mb-6 ml-8">
          <li>You are trying to access a client that is not assigned to you</li>
          <li>You are trying to access an admin page without admin permissions</li>
          <li>Your session has expired</li>
        </ul>
        
        <div className="flex flex-col space-y-3">
          <Link 
            href="/"
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </Link>
          
          <Link 
            href="/api/auth/signin"
            className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50 transition-colors"
          >
            Sign in with Different Account
          </Link>
        </div>
      </div>
    </div>
  );
}
