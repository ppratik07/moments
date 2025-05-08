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
  components: {
    type: string;
    imageUrl?: string;
    value?: string;
    position?: { x: number; y: number };
    size?: { width: number; height: number };
    styles?: Record<string, any>;
  }[];
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
  <div className="page bg-white p-10 box-border relative h-full" ref={ref}>
    <div className="page-content p-10 relative h-full">
      <h2 className="text-center text-xl font-bold text-gray-800 mb-5">Contribution - Page {props.number}</h2>
      <div className="page-text">{props.children}</div>
      <div className="absolute bottom-10 right-10 text-sm text-gray-400">{props.number + 1}</div>
    </div>
  </div>
));
Page.displayName = 'Page';

const PreviewBookPage = () => {
  const params = useParams<{ project_id: string }>();
  const project_id = params?.project_id;
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
        console.log('Fetched pages:', JSON.stringify(bookData.pages, null, 2)); // Debug log
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
        <div className="flex-1 ml-0 md:ml-[2rem] p-6">
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
                  {pages.map((page, index) => {
                    const photos = page.components.filter(comp => comp.type === 'photo' && comp.imageUrl);
                    const paragraphs = page.components.filter(comp => comp.type === 'paragraph' && comp.value);

                    console.log(`Page ${index + 1} - Photos: ${photos.length}, Paragraphs: ${paragraphs.length}`); // Debug log

                    // Case 1: Only text (no photos)
                    if (photos.length === 0 && paragraphs.length > 0) {
                      return (
                        <Page key={index} number={index + 1}>
                          <div className="contribution flex flex-col items-center justify-center min-h-full">
                            <h3 className="text-lg font-bold text-gray-800 mb-5">{page.contributorName}</h3>
                            {paragraphs.map((para, pidx) => (
                              <p
                                key={pidx}
                                className="text-base leading-relaxed text-gray-600 mb-5 text-center max-w-lg"
                                style={para.styles || {}}
                              >
                                {para.value}
                              </p>
                            ))}
                          </div>
                        </Page>
                      );
                    }

                    // Case 2: Exactly two photos, no text
                    if (photos.length === 2 && paragraphs.length === 0) {
                      return (
                        <Page key={index} number={index + 1}>
                          <div className="contribution flex flex-col min-h-full">
                            <h3 className="text-lg font-bold text-gray-800 mb-5 text-center">{page.contributorName}</h3>
                            <div className="flex flex-row flex-wrap justify-between gap-4">
                              {photos.map((photo, idx) => {
                                const style: React.CSSProperties = {
                                  width: photo.size?.width ? `${photo.size.width}px` : '45%',
                                  height: photo.size?.height ? `${photo.size.height}px` : 'auto',
                                  zIndex: idx + 1,
                                  ...photo.styles,
                                };
                                console.log(`Rendering photo ${idx + 1} on page ${index + 1}:`, photo.imageUrl); // Debug log
                                return (
                                  <Image
                                    key={idx}
                                    src={photo.imageUrl || 'https://via.placeholder.com/300x200?text=Image+Not+Found'}
                                    alt="Contribution photo"
                                    width={photo.size?.width || 300}
                                    height={photo.size?.height || 200}
                                    className="rounded"
                                    style={style}
                                    onError={(e) => {
                                      e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Failed+to+Load';
                                      console.error('Image failed to load:', photo.imageUrl);
                                    }}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </Page>
                      );
                    }

                    // General case: Any number of photos and/or paragraphs
                    return (
                      <Page key={index} number={index + 1}>
                        <div className="contribution flex flex-col min-h-full items-center">
                          <h3 className="text-lg font-bold text-gray-800 mb-5">{page.contributorName}</h3>
                          <div className="flex flex-col items-center gap-4 w-full">
                            {page.components.map((component, idx) => {
                              const style: React.CSSProperties = {
                                position: 'relative', // Disable absolute positioning
                                width: component.size?.width ? `${component.size.width}px` : 'auto',
                                height: component.size?.height ? `${component.size.height}px` : 'auto',
                                zIndex: idx + 1,
                                ...component.styles,
                              };

                              if (component.type === 'paragraph' && component.value) {
                                return (
                                  <p
                                    key={idx}
                                    className="text-base leading-relaxed text-gray-600 mb-5 text-center max-w-lg overflow-auto max-h-[700px] px-4"
                                    style={style}
                                  >
                                    {component.value}
                                  </p>
                                );
                              }
                              return null; // Skip photos here, render them below
                            })}
                            <div className="flex flex-wrap justify-center gap-4">
                              {page.components.map((component, idx) => {
                                if (component.type === 'photo' && component.imageUrl) {
                                  const style: React.CSSProperties = {
                                    position: 'relative',
                                    width: component.size?.width ? `${component.size.width}px` : '300px',
                                    height: component.size?.height ? `${component.size.height}px` : '200px',
                                    zIndex: idx + 1,
                                    ...component.styles,
                                  };
                                  console.log(`Rendering photo ${idx + 1} on page ${index + 1}:`, component.imageUrl); // Debug log
                                  return (
                                    <Image
                                      key={idx}
                                      src={component.imageUrl || 'https://via.placeholder.com/300x200?text=Image+Not+Found'}
                                      alt="Contribution photo"
                                      width={component.size?.width || 300}
                                      height={component.size?.height || 200}
                                      className="rounded w-full h-auto"
                                      style={style}
                                      onError={(e) => {
                                        e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Failed+to+Load';
                                        console.error('Image failed to load:', component.imageUrl);
                                      }}
                                    />
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </div>
                          {page.components.length === 0 && (
                            <p className="text-center text-gray-400">No content available</p>
                          )}
                        </div>
                      </Page>
                    );
                  })}
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