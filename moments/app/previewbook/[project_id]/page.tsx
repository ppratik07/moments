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
import axios from 'axios';

const PageCover = forwardRef((props: PageCoverProps, ref: ForwardedRef<HTMLDivElement>) => {
  const { layout, children } = props;

  if (layout && layout.pageType === 'front_cover') {
    return (
      <div
        className={`page page-cover relative bg-white ${layout.config.containerStyle?.shadow ?? ''} ${layout.config.containerStyle?.border ?? ''
          } w-full h-full p-4 sm:p-6 lg:p-8 flex flex-col items-center overflow-hidden transform-gpu transition-transform duration-500 ease-in-out ${layout.config.hoverEffects?.rotate ?? ''
          } ${layout.config.hoverEffects?.scale ?? ''} ${layout.config.hoverEffects?.shadow ?? ''}`}
        ref={ref}
        data-density="hard"
      >
        <div className="absolute inset-2 sm:inset-4 border-2 border-dashed border-gray-400 pointer-events-none"></div>
        <div className="relative flex flex-col items-center w-full">
          <h1
            className={`${layout.config.titleStyle?.fontSize ?? 'text-xl sm:text-2xl lg:text-3xl'} ${layout.config.titleStyle?.fontWeight ?? 'font-bold'
              } ${layout.config.titleStyle?.marginBottom ?? 'mb-4 sm:mb-6'} ${layout.config.titleStyle?.textAlign ?? 'text-center'
              } ${layout.config.titleStyle?.marginTop ?? 'mt-2 sm:mt-3'} break-words`}
          >
            {layout.config.title || 'No Title'}
          </h1>
          {layout.config.imageKey && (
            <div className={layout.config.imageStyle?.marginBottom ?? 'mb-4 sm:mb-6'}>
              <Image
                src={
                  typeof layout.config.imageKey === 'string' && layout.config.imageKey.startsWith('data:')
                    ? layout.config.imageKey
                    : getImageUrl(layout.config.imageKey) || 'https://via.placeholder.com/300x200?text=Image+Not+Found'
                }
                alt="Front Cover"
                width={layout.config.imageStyle?.width ?? 200}
                height={layout.config.imageStyle?.height ?? 150}
                className={`${layout.config.imageStyle?.objectFit ?? 'object-contain'} ${layout.config.imageStyle?.shadow ?? 'shadow-md'
                  } w-full h-auto`}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Failed+to+Load';
                  console.error('Front cover image failed to load:', layout.config.imageKey);
                }}
              />
            </div>
          )}
          {layout.config.description && (
            <div
              className={`${layout.config.descriptionStyle?.maxWidth ?? 'max-w-[90%] sm:max-w-[80%]'} ${layout.config.descriptionStyle?.color ?? 'text-gray-700'
                } ${layout.config.descriptionStyle?.fontSize ?? 'text-xs sm:text-[13px]'} ${layout.config.descriptionStyle?.textAlign ?? 'text-center'
                } ${layout.config.descriptionStyle?.marginTop ?? 'mt-2 sm:mt-4'}`}
            >
              <p
                className={`${layout.config.descriptionStyle?.fontStyle ?? 'italic'} ${layout.config.descriptionStyle?.lineHeight ?? 'leading-relaxed'
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
        <h2 className="text-lg sm:text-2xl font-bold text-gray-800">{children}</h2>
      </div>
    </div>
  );
});
PageCover.displayName = 'PageCover';

const Page = forwardRef((props: PageProps, ref: ForwardedRef<HTMLDivElement>) => (
  <div className="page bg-white p-4 sm:p-6 lg:p-10 box-border relative h-full" ref={ref}>
    <div className="page-content p-4 sm:p-6 lg:p-10 relative h-full">
      <h2 className="text-center text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-5">Contribution - Page {props.number}</h2>
      <div className="page-text">{props.children}</div>
      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-10 right-4 sm:right-6 lg:right-10 text-xs sm:text-sm text-gray-400">{props.number + 1}</div>
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
  const [shippingAddress] = useState({
    line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'IN',
  });

  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ShippingOption {
    id: string;
    name: string;
    amount: number;
    estimated_days: number;
  }
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

        const bookResponse = await fetch(`${HTTP_BACKEND}/api/preview/${project_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!bookResponse.ok) {
          throw new Error(`Failed to fetch book preview: ${bookResponse.statusText}`);
        }
        const bookData = await bookResponse.json();
        setPages(bookData.pages || []);

        const layoutResponse = await fetch(`${HTTP_BACKEND}/api/layouts/${project_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!layoutResponse.ok) {
          throw new Error(`Failed to fetch front cover: ${layoutResponse.statusText}`);
        }
        const frontCover: Layout | null = await layoutResponse.json();
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

  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCheckout = async () => {
    try {
      const token = await getToken();
      const orderResponse = await axios.post(
        `${HTTP_BACKEND}/api/create-order`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { order_id, amount, currency } = orderResponse.data;
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
          amount: amount,
          currency: currency,
          name: 'Memory Lane',
          description: `Order for project ${project_id}`,
          order_id: order_id,
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            try {
              const verifyResponse = await axios.post(
                `${HTTP_BACKEND}/api/verify-payment`,
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  amount,
                  project_id,
                  shipping_address: shippingAddress,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (verifyResponse.data.success) {
                router.push(`/success?order_id=${orderResponse.data.order_id}&project_id=${project_id}`);
              } else {
                setError('Payment verification failed');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              setError('Payment verification failed');
            }
          },
          prefill: {
            name: '',
            email: '',
            contact: '',
          },
          theme: {
            color: '#F59E0B',
          },
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };

      script.onerror = () => {
        setError('Failed to load Razorpay Checkout');
      };
    } catch (error) {
      console.error('Error initiating checkout:', error);
      setError('Failed to initiate checkout');
    }
  };

  const nextButtonClick = () => flipBookRef.current?.pageFlip().flipNext();
  const prevButtonClick = () => flipBookRef.current?.pageFlip().flipPrev();
  const onPage = (e: { data: number }) => setCurrentPage(e.data);

  if (!project_id || typeof project_id !== 'string') {
    return <div className="text-red-600 text-center mt-6 sm:mt-10 text-sm sm:text-base">Invalid project ID</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          {/* Spinner */}
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500"></div>
          {/* Text */}
          <p className="text-gray-700 text-base sm:text-lg font-medium">
            Loading preview...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center mt-6 sm:mt-10 text-sm sm:text-base">{error}</div>;
  }

  return (
    <>
      <Head>
        <title>Memory Lane - Book Preview</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Header isSignedIn={isSignedIn ?? false} />
      <div className="flex flex-col sm:flex-row min-h-screen bg-gray-100 pt-20">
        <Sidebar projectId={project_id} />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Book Preview</h1>
            {pages.length > 0 || frontCover ? (
              <>
                <HTMLFlipBook
                  width={300}
                  height={600}
                  size="stretch"
                  minWidth={240}
                  maxWidth={600}
                  minHeight={400}
                  maxHeight={1000}
                  drawShadow
                  flippingTime={1000}
                  usePortrait={true}
                  startZIndex={0}
                  autoSize
                  maxShadowOpacity={0.5}
                  showCover
                  mobileScrollSupport
                  className="mx-auto w-[95%] sm:w-full sm:max-w-[80%]"
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

                    if (photos.length === 0 && paragraphs.length > 0) {
                      return (
                        <Page key={index} number={index + 1}>
                          <div className="contribution flex flex-col items-center justify-center min-h-full">
                            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-5">{page.contributorName}</h3>
                            {paragraphs.map((para, pidx) => (
                              <p
                                key={pidx}
                                className="text-sm sm:text-base leading-relaxed text-gray-600 mb-3 sm:mb-5 text-center max-w-xs sm:max-w-lg"
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
                            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-5 text-center">Contributed By: {page.contributorName}</h3>
                            <div className="flex flex-col sm:flex-row flex-wrap justify-between gap-3 sm:gap-4">
                              {photos.map((photo, idx) => {
                                const style: React.CSSProperties = {
                                  width: photo.size?.width ? `${photo.size.width}px` : '100%',
                                  height: photo.size?.height ? `${photo.size.height}px` : 'auto',
                                  zIndex: idx + 1,
                                  ...photo.styles,
                                };
                                return (
                                  <Image
                                    key={idx}
                                    src={photo.imageUrl || 'https://via.placeholder.com/300x200?text=Image+Not+Found'}
                                    alt="Contribution photo"
                                    width={photo.size?.width || 150}
                                    height={photo.size?.height || 100}
                                    className="rounded w-full h-auto"
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
                          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-5">{page.contributorName}</h3>
                          <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
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
                                    className="text-sm sm:text-base leading-relaxed text-gray-600 mb-3 sm:mb-5 text-center max-w-xs sm:max-w-lg overflow-auto max-h-[350px] sm:max-h-[700px] px-2 sm:px-4"
                                    style={style}
                                  >
                                    {component.value}
                                  </p>
                                );
                              }
                              return null;
                            })}
                            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-3 sm:mt-5">
                              {page.components.map((component, idx) => {
                                if (component.type === 'photo' && component.imageUrl) {
                                  const style: React.CSSProperties = {
                                    position: 'relative',
                                    width: component.size?.width ? `${component.size.width}px` : '100%',
                                    height: component.size?.height ? `${component.size.height}px` : 'auto',
                                    zIndex: idx + 1,
                                    ...component.styles,
                                  };
                                  return (
                                    <Image
                                      key={idx}
                                      src={component.imageUrl || 'https://via.placeholder.com/300x200?text=Image+Not+Found'}
                                      alt="Contribution photo"
                                      width={component.size?.width || 150}
                                      height={component.size?.height || 100}
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
                            <p className="text-center text-gray-400 text-sm sm:text-base">No content available</p>
                          )}
                        </div>
                      </Page>
                    );
                  })}
                  <PageCover>The End</PageCover>
                </HTMLFlipBook>

                <div className="flex justify-center items-center gap-2 mt-3 sm:mt-4">
                  <Button
                    type="button"
                    onClick={prevButtonClick}
                    className="px-2 sm:px-3 py-1 sm:py-2 text-white rounded hover:bg-blue-700 text-xs sm:text-sm w-full sm:w-auto flex items-center"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </Button>
                  <span className="text-xs sm:text-sm">
                    [<span>{currentPage}</span> of <span>{totalPages}</span>]
                  </span>
                  <Button
                    type="button"
                    onClick={nextButtonClick}
                    className="px-2 sm:px-3 py-1 sm:py-2 text-white rounded hover:bg-blue-700 text-xs sm:text-sm w-full sm:w-auto flex items-center"
                  >
                    Next
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>

                <div className="mt-4 sm:mt-6 flex justify-end">
                  {/* Uncomment if Order Book button is needed */}
                  {/* <Button
                    onClick={handleCheckout}
                    className="hover:bg-amber-600 cursor-pointer text-sm sm:text-base px-3 sm:px-4 py-2"
                  >
                    Order Book
                  </Button> */}
                </div>
              </>
            ) : (
              <p className="text-center text-gray-400 text-sm sm:text-base">No book content available</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PreviewBookPage;