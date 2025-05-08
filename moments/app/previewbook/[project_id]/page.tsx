'use client';
import { useEffect, useState, useRef, ForwardedRef, forwardRef } from 'react';
import Head from 'next/head';
import HTMLFlipBook from 'react-pageflip';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { HTTP_BACKEND } from '@/utils/config';
import { useAuth } from '@clerk/nextjs';
import Sidebar from '@/components/dashboard/SideBar';
import { Header } from '@/components/landing/Header';

interface FlipBookRef {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
    getPageCount: () => number;
  };
}

interface PageData {
  contributorName: string;
  photos: { imageUrl: string }[];
  paragraphs: { value: string }[];
}

interface PageProps {
  number: number;
  children?: React.ReactNode;
}

interface PageCoverProps {
  children?: React.ReactNode;
}

const PageCover = forwardRef((props: PageCoverProps, ref: ForwardedRef<HTMLDivElement>) => (
  <div className="page page-cover bg-gray-100 border-2 border-gray-800 flex items-center justify-center" ref={ref} data-density="hard">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800">{props.children}</h2>
    </div>
  </div>
));
PageCover.displayName = 'PageCover';

const Page = forwardRef((props: PageProps, ref: ForwardedRef<HTMLDivElement>) => (
  <div className="page bg-white p-10 box-border relative" ref={ref}>
    <div className="page-content p-10">
      <h2 className="text-center text-xl font-bold text-gray-800 mb-5">Contribution - Page {props.number}</h2>
      <div className="page-text">{props.children}</div>
      <div className="absolute bottom-10 right-10 text-sm text-gray-400">{props.number + 1}</div>
    </div>
  </div>
));
Page.displayName = 'Page';

const PreviewBookPage = () => {
  const params = useParams();
  const project_id = Array.isArray(params?.project_id) ? params.project_id[0] : params?.project_id;
  const [pages, setPages] = useState<PageData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const flipBookRef = useRef<FlipBookRef | null>(null);
  const router = useRouter();
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchBook = async () => {
      if (!project_id || typeof project_id !== 'string') {
        setError('Invalid project ID');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const token = await getToken();
        if (!token) {
          setError('Authentication required');
          router.push('/login');
          return;
        }

        const bookResponse = await fetch(`${HTTP_BACKEND}/api/preview/${project_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!bookResponse.ok) {
          throw new Error(`Failed to fetch book preview: ${bookResponse.statusText}`);
        }
        const bookData = await bookResponse.json();
        setPages(bookData.pages || []);
      } catch (error) {
        console.error('Error fetching book:', error);
        setError('Failed to load book preview. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [project_id, router, getToken]);

  useEffect(() => {
    if (flipBookRef.current && flipBookRef.current.pageFlip) {
      const pageFlipInstance = flipBookRef.current.pageFlip();
      if (pageFlipInstance && typeof pageFlipInstance.getPageCount === 'function') {
        const pageCount = pageFlipInstance.getPageCount();
        setTotalPages(pageCount);
      }
    }
  }, [pages]);

  const nextButtonClick = () => flipBookRef.current?.pageFlip().flipNext();
  const prevButtonClick = () => flipBookRef.current?.pageFlip().flipPrev();
  const onPage = (e: { data: number }) => setCurrentPage(e.data);

  if (!project_id || typeof project_id !== 'string') {
    return <div className="text-red-600 text-center mt-10">Invalid project ID</div>;
  }

  if (isLoading) {
    return <div className="text-center mt-10">Loading book preview...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center mt-10">{error}</div>;
  }

  return (
    <>
      <Head>
        <title>Memory Lane - Book Preview</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Header isSignedIn />
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar projectId={project_id} />
        <div className="flex-1 ml-0 md:ml-[5rem] p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-4">Book Preview</h1>
            {pages.length > 0 ? (
              <>
                <HTMLFlipBook
                  width={600}
                  height={900}
                  size="stretch"
                  minWidth={315}
                  maxWidth={1000}
                  minHeight={800}
                  maxHeight={1600}
                  drawShadow
                  flippingTime={1000}
                  usePortrait={pages.length <= 2}
                  startZIndex={0}
                  autoSize
                  maxShadowOpacity={0.5}
                  showCover
                  mobileScrollSupport
                  className="mx-auto max-w-[80%]"
                  style={{ margin: '0 auto' }}
                  startPage={0}
                  clickEventForward
                  useMouseEvents
                  disableFlipByClick={false}
                  swipeDistance={30}
                  showPageCorners
                  onFlip={onPage}
                  ref={flipBookRef}
                >
                  <PageCover>Memory Lane Book</PageCover>
                  {pages.map((page, index) => (
                    <Page key={index} number={index + 1}>
                      <div className="mb-10 border-b border-gray-200 pb-5">
                        <h3 className="text-lg font-bold text-gray-800 mb-5">{page.contributorName}</h3>
                        {page.photos.map((photo, idx) => (
                          <Image
                            key={idx}
                            src={photo.imageUrl || 'https://via.placeholder.com/300x200?text=Image+Not+Found'}
                            alt="Contribution photo"
                            width={300}
                            height={200}
                            className="mb-10 rounded block"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Failed+to+Load';
                              console.error('Image failed to load:', photo.imageUrl);
                            }}
                          />
                        ))}
                        {page.paragraphs.map((para, pidx) => (
                          <p key={pidx} className="text-base leading-relaxed text-gray-600 mb-5">{para.value}</p>
                        ))}
                        {page.photos.length === 0 && page.paragraphs.length === 0 && (
                          <p className="text-center text-gray-400">No content available</p>
                        )}
                      </div>
                    </Page>
                  ))}
                  <PageCover>The End</PageCover>
                </HTMLFlipBook>

                <div className="flex justify-center items-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={prevButtonClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Previous page
                  </button>
                  <span>
                    [<span>{currentPage}</span> of <span>{totalPages}</span>]
                  </span>
                  <button
                    type="button"
                    onClick={nextButtonClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Next page
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-400">No book content available</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PreviewBookPage;