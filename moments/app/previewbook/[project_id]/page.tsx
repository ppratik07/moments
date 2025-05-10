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
import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/helpers/getImageUrl';
import { FlipBookRef, Layout, PageCoverProps, PageData, PageProps } from '@/types/previewbook.types';


const PageCover = forwardRef((props: PageCoverProps, ref: ForwardedRef<HTMLDivElement>) => {
  const { layout, children } = props;

  if (layout && layout.pageType === 'front_cover') {
    return (
      <div
        className={`page page-cover relative bg-white ${layout.config.containerStyle?.shadow ?? ''} ${
          layout.config.containerStyle?.border ?? ''
        } w-full h-full p-8 flex flex-col items-center overflow-hidden transform-gpu transition-transform duration-500 ease-in-out ${
          layout.config.hoverEffects?.rotate ?? ''
        } ${layout.config.hoverEffects?.scale ?? ''} ${layout.config.hoverEffects?.shadow ?? ''}`}
        ref={ref}
        data-density="hard"
      >
        <div className="absolute inset-4 border-2 border-dashed border-gray-400 pointer-events-none"></div>
        <div className="relative flex flex-col items-center w-full">
          <h1
            className={`${layout.config.titleStyle?.fontSize ?? 'text-3xl'} ${
              layout.config.titleStyle?.fontWeight ?? 'font-bold'
            } ${layout.config.titleStyle?.marginBottom ?? 'mb-6'} ${
              layout.config.titleStyle?.textAlign ?? 'text-center'
            } ${layout.config.titleStyle?.marginTop ?? 'mt-3'} break-words`}
          >
            {layout.config.title || 'No Title'}
          </h1>
          {layout.config.imageKey && (
            <div className={layout.config.imageStyle?.marginBottom ?? 'mb-6'}>
              <Image
                src={
                  typeof layout.config.imageKey === 'string' && layout.config.imageKey.startsWith('data:')
                    ? layout.config.imageKey
                    : getImageUrl(layout.config.imageKey) || 'https://via.placeholder.com/300x200?text=Image+Not+Found'
                }
                alt="Front Cover"
                width={layout.config.imageStyle?.width ?? 280}
                height={layout.config.imageStyle?.height ?? 200}
                className={`${layout.config.imageStyle?.objectFit ?? 'object-contain'} ${
                  layout.config.imageStyle?.shadow ?? 'shadow-md'
                }`}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Failed+to+Load';
                  console.error('Front cover image failed to load:', layout.config.imageKey);
                }}
              />
            </div>
          )}
          {layout.config.description && (
            <div
              className={`${layout.config.descriptionStyle?.maxWidth ?? 'max-w-[80%]'} ${
                layout.config.descriptionStyle?.color ?? 'text-gray-700'
              } ${layout.config.descriptionStyle?.fontSize ?? 'text-[13px]'} ${
                layout.config.descriptionStyle?.textAlign ?? 'text-center'
              } ${layout.config.descriptionStyle?.marginTop ?? 'mt-4'}`}
            >
              <p
                className={`${layout.config.descriptionStyle?.fontStyle ?? 'italic'} ${
                  layout.config.descriptionStyle?.lineHeight ?? 'leading-relaxed'
                } break-words`}
              >
                {layout.config.description}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="page page-cover bg-gray-100 border-2 border-gray-800 flex items-center justify-center"
      ref={ref}
      data-density="hard"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">{children}</h2>
      </div>
    </div>
  );
});
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
  const [frontCover, setFrontCover] = useState<Layout | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const flipBookRef = useRef<FlipBookRef | null>(null);
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!project_id || typeof project_id !== 'string') {
        setError('Invalid project ID');
        setIsLoading(false);
        return;
      }

      if (!isSignedIn) {
        setError('Authentication required');
        router.push('/');
        return;
      }

      setIsLoading(true);
      try {
        const token = await getToken();
        if (!token) {
          throw new Error('Failed to obtain authentication token');
        }

        // Fetch book pages
        const bookResponse = await fetch(`${HTTP_BACKEND}/api/preview/${project_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!bookResponse.ok) {
          throw new Error(`Failed to fetch book preview: ${bookResponse.statusText}`);
        }
        const bookData = await bookResponse.json();
        console.log('Fetched pages:', JSON.stringify(bookData.pages, null, 2));
        setPages(bookData.pages || []);

        // Fetch front cover layout
        const layoutResponse = await fetch(`${HTTP_BACKEND}/api/layouts/${project_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!layoutResponse.ok) {
          throw new Error(`Failed to fetch front cover: ${layoutResponse.statusText}`);
        }
        const frontCover: Layout | null = await layoutResponse.json();
        console.log('Fetched front cover:', JSON.stringify(frontCover, null, 2));
        setFrontCover(frontCover);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(`Failed to load book preview or front cover: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [project_id, router, getToken, isSignedIn]);

  useEffect(() => {
    if (flipBookRef.current && flipBookRef.current.pageFlip) {
      const pageFlipInstance = flipBookRef.current.pageFlip();
      if (pageFlipInstance && typeof pageFlipInstance.getPageCount === 'function') {
        const pageCount = pageFlipInstance.getPageCount();
        setTotalPages(pageCount);
      }
    }
  }, [pages, frontCover]);

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
      <Header isSignedIn={isSignedIn ?? false} />
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar projectId={project_id} />
        <div className="flex-1 ml-0 md:ml-[2rem] p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-4">Book Preview</h1>
            {pages.length > 0 || frontCover ? (
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
                  <PageCover layout={frontCover ?? undefined}>Memory Lane Book</PageCover>
                  {pages.map((page, index) => {
                    const photos = page.components.filter((comp) => comp.type === 'photo' && comp.imageUrl);
                    const paragraphs = page.components.filter((comp) => comp.type === 'paragraph' && comp.value);

                    console.log(`Page ${index + 1} - Photos: ${photos.length}, Paragraphs: ${paragraphs.length}`);

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
                                console.log(`Rendering photo ${idx + 1} on page ${index + 1}:`, photo.imageUrl);
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

                    return (
                      <Page key={index} number={index + 1}>
                        <div className="contribution flex flex-col min-h-full items-center">
                          <h3 className="text-lg font-bold text-gray-800 mb-5">{page.contributorName}</h3>
                          <div className="flex flex-col items-center gap-4 w-full">
                            {page.components.map((component, idx) => {
                              const style: React.CSSProperties = {
                                position: 'relative',
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
                              return null;
                            })}
                            <div className="flex flex-wrap justify-center gap-4 mt-5">
                              {page.components.map((component, idx) => {
                                if (component.type === 'photo' && component.imageUrl) {
                                  const style: React.CSSProperties = {
                                    position: 'relative',
                                    width: component.size?.width ? `${component.size.width}px` : '300px',
                                    height: component.size?.height ? `${component.size.height}px` : '200px',
                                    zIndex: idx + 1,
                                    ...component.styles,
                                  };
                                  console.log(`Rendering photo ${idx + 1} on page ${index + 1}:`, component.imageUrl);
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
                  <Button
                    type="button"
                    onClick={prevButtonClick}
                    className="px-4 py-2 text-white rounded hover:bg-blue-700"
                  >
                    Previous page
                  </Button>
                  <span>
                    [<span>{currentPage}</span> of <span>{totalPages}</span>]
                  </span>
                  <Button
                    type="button"
                    onClick={nextButtonClick}
                    className="px-4 py-2 text-white rounded hover:bg-blue-700"
                  >
                    Next page
                  </Button>
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