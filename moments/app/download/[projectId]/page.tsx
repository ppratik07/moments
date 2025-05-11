'use client';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useParams, useRouter } from 'next/navigation';
import { HTTP_BACKEND } from '@/utils/config';
import { useAuth } from '@clerk/nextjs';
import Sidebar from '@/components/dashboard/SideBar';
import { Header } from '@/components/landing/Header';
import { RotatingLines } from 'react-loader-spinner';

const DownloadPage = () => {
  const params = useParams();
  const project_id = Array.isArray(params?.projectId) ? params.projectId[0] : params?.projectId;
  console.log('Project ID:', project_id);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { getToken } = useAuth();

  useEffect(() => {
    console.log('Params:', params);
    if (!project_id || typeof project_id !== 'string') {
      setError('Invalid or missing project ID. Please select a valid project.');
      return;
    }

    const fetchPdf = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        if (!token) {
          setError('Authentication required. Redirecting to login...');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        const pdfResponse = await fetch(`${HTTP_BACKEND}/api/pdf/${project_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!pdfResponse.ok) {
          throw new Error(`Failed to fetch PDF: ${pdfResponse.statusText}`);
        }
        const pdfBlob = await pdfResponse.blob();
        setPdfUrl(URL.createObjectURL(pdfBlob));
      } catch (error) {
        console.error('Error fetching PDF:', error);
        setError('Failed to load PDF. Please try again or select another project.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPdf();
  }, [params, project_id, router, getToken]);

  if (error) {
    return (
      <div className="text-red-600 text-center mt-10">
        {error}
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>
          Loading PDF... Please wait.
        </p>
        <RotatingLines
          visible={true}
          strokeColor="gray"
          strokeWidth="5"
          animationDuration="0.75"
          width="96"
          ariaLabel="rotating-lines-loading"
        />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Memory Lane - PDF Download</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Header isSignedIn />
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar projectId={project_id} />
        <div className="flex-1 ml-0 md:ml-[2rem] p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-4">PDF Preview</h1>
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full h-[80vh] border rounded"
                title="PDF Preview"
              />
            ) : (
              <p className="text-center text-gray-400">No PDF available</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DownloadPage;