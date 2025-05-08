'use client'
import { useEffect, useState, useRef, ForwardedRef, forwardRef } from 'react';
import Head from 'next/head';
import HTMLFlipBook from 'react-pageflip';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { HTTP_BACKEND } from '@/utils/config';
import { useAuth } from '@clerk/nextjs';
import Sidebar from '@/components/dashboard/SideBar'; 

// Define the type for HTMLFlipBook ref based on react-pageflip
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

// PageCover Component
const PageCover = forwardRef((props: PageCoverProps, ref: ForwardedRef<HTMLDivElement>) => {
    return (
        <div className="page page-cover" ref={ref} data-density="hard">
            <div className="page-content">
                <h2>{props.children}</h2>
            </div>
        </div>
    );
});
PageCover.displayName = 'PageCover';

// Page Component
const Page = forwardRef((props: PageProps, ref: ForwardedRef<HTMLDivElement>) => {
    return (
        <div className="page" ref={ref}>
            <div className="page-content">
                <h2 className="page-header">Contribution - Page {props.number}</h2>
                <div className="page-text">{props.children}</div>
                <div className="page-footer">{props.number + 1}</div>
            </div>
        </div>
    );
});
Page.displayName = 'Page';

const PreviewBookPage = () => {
    const params: Record<string, string | string[]> | null = useParams();
    const project_id = Array.isArray(params?.project_id) ? params.project_id[0] : params?.project_id;
    const [pages, setPages] = useState<PageData[]>([]);
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const flipBookRef = useRef<FlipBookRef | null>(null);
    const router = useRouter();
    const { getToken } = useAuth();

    useEffect(() => {
        const fetchBookAndPdf = async () => {
            if (!project_id || typeof project_id !== 'string') return;

            try {
                const token = await getToken();
                if (!token) {
                    router.push('/login');
                    return;
                }

                // Fetch book data
                const bookResponse = await fetch(`${HTTP_BACKEND}/api/preview/${project_id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!bookResponse.ok) throw new Error('Failed to fetch book preview');
                const bookData = await bookResponse.json();
                const extractedPages: PageData[] = bookData.pages || [];
                setPages(extractedPages);

                // Fetch PDF
                const pdfResponse = await fetch(`${HTTP_BACKEND}/api/pdf/${project_id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!pdfResponse.ok) throw new Error('Failed to fetch PDF');
                const pdfBlob = await pdfResponse.blob();
                const pdfObjectUrl = URL.createObjectURL(pdfBlob);
                setPdfUrl(pdfObjectUrl);
            } catch (error) {
                console.error('Error fetching book or PDF:', error);
            }
        };

        fetchBookAndPdf();
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

    const nextButtonClick = () => {
        if (flipBookRef.current) {
            flipBookRef.current.pageFlip().flipNext();
        }
    };

    const prevButtonClick = () => {
        if (flipBookRef.current) {
            flipBookRef.current.pageFlip().flipPrev();
        }
    };

    const onPage = (e: any) => {
        setCurrentPage(e.data);
    };

    if (!project_id || typeof project_id !== 'string') {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Head>
                <title>Memory Lane - Book Preview</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" />
            </Head>
            <div className="flex min-h-screen bg-gray-100">
                {/* Sidebar */}
                <Sidebar
                    projectId={project_id}
                    imageKey="default-image-key" // Replace with actual image key or fetch dynamically
                />

                {/* Main Content */}
                <div className="flex-1 ml-0 md:ml-[19rem] p-6">
                    {/* Book Preview */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-4">Book Preview</h1>
                        {pages.length > 0 ? (
                            <div>
                                <HTMLFlipBook
                                    width={550}
                                    height={733}
                                    size="stretch"
                                    minWidth={315}
                                    maxWidth={1000}
                                    minHeight={400}
                                    maxHeight={1533}
                                    drawShadow={true}
                                    flippingTime={1000}
                                    usePortrait={pages.length <= 2}
                                    startZIndex={0}
                                    autoSize={true}
                                    maxShadowOpacity={0.5}
                                    showCover={true}
                                    mobileScrollSupport={true}
                                    className="book-flip"
                                    style={{ margin: '0 auto' }}
                                    startPage={0}
                                    clickEventForward={true}
                                    useMouseEvents={true}
                                    disableFlipByClick={false}
                                    swipeDistance={30}
                                    showPageCorners={true}
                                    onFlip={onPage}
                                    ref={flipBookRef}
                                >
                                    <PageCover>Memory Lane Book</PageCover>
                                    {pages.map((page, index) => (
                                        <Page key={index} number={index + 1}>
                                            <div className="contribution">
                                                <h3 className="contributor-name">{page.contributorName}</h3>
                                                {page.photos.map((photo, photoIndex) => (
                                                    <Image
                                                        key={photoIndex}
                                                        src={photo.imageUrl || 'https://via.placeholder.com/300x200?text=Image+Not+Found'}
                                                        alt="Contribution photo"
                                                        className="photo"
                                                        width={300}
                                                        height={200}
                                                        onError={(e) => {
                                                            e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Failed+to+Load';
                                                            console.error('Image failed to load:', photo.imageUrl);
                                                        }}
                                                    />
                                                ))}
                                                {page.paragraphs.map((paragraph, paraIndex) => (
                                                    <p key={paraIndex} className="paragraph">{paragraph.value}</p>
                                                ))}
                                                {page.photos.length === 0 && page.paragraphs.length === 0 && (
                                                    <p className="no-content">No content available</p>
                                                )}
                                            </div>
                                        </Page>
                                    ))}
                                    <PageCover>The End</PageCover>
                                </HTMLFlipBook>
                                <div className="container mt-4 text-center">
                                    <button
                                        type="button"
                                        onClick={prevButtonClick}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                                    >
                                        Previous page
                                    </button>
                                    <span>
                                        [<span>{currentPage}</span> of <span>{totalPages}</span>]
                                    </span>
                                    <button
                                        type="button"
                                        onClick={nextButtonClick}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ml-2"
                                    >
                                        Next page
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p>Loading book...</p>
                        )}
                    </div>

                    {/* PDF Preview */}
                    {pdfUrl && (
                        <div className="mt-8">
                            <h1 className="text-2xl font-bold mb-4">PDF Preview</h1>
                            <iframe
                                src={pdfUrl}
                                className="w-full h-[80vh] border rounded"
                                title="PDF Preview"
                            />
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .book-flip {
                    margin: 0 auto;
                    max-width: 80%;
                }
                .book-flip .page {
                    background: #fff;
                    padding: 10mm;
                    box-sizing: border-box;
                }
                .book-flip .page-cover {
                    background: #f5f5f5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid #333;
                }
                .book-flip .page-cover .page-content {
                    text-align: center;
                }
                .book-flip .page-cover h2 {
                    font-size: 24pt;
                    color: #333;
                    font-weight: bold;
                }
                .book-flip .page-content {
                    padding: 10mm;
                }
                .book-flip .page-header {
                    font-size: 16pt;
                    font-weight: bold;
                    margin-bottom: 5mm;
                    color: #333;
                    text-align: center;
                }
                .book-flip .page-footer {
                    position: absolute;
                    bottom: 10mm;
                    right: 10mm;
                    font-size: 10pt;
                    color: #999;
                }
                .book-flip .contribution {
                    margin-bottom: 10mm;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 5mm;
                }
                .book-flip .contributor-name {
                    font-size: 14pt;
                    font-weight: bold;
                    margin-bottom: 5mm;
                    color: #333;
                }
                .book-flip .photo {
                    max-width: 100%;
                    height: auto;
                    margin-bottom: 5mm;
                    border-radius: 4px;
                    display: block;
                }
                .book-flip .paragraph {
                    font-size: 12pt;
                    line-height: 1.5;
                    color: #555;
                    margin-bottom: 5mm;
                }
                .book-flip .no-content {
                    font-size: 12pt;
                    color: #999;
                    text-align: center;
                }
                .container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;
                }
            `}</style>
        </>
    );
};

export default PreviewBookPage;