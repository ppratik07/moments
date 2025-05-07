'use client'
import { useEffect, useState } from 'react';
import Head from 'next/head';
import HTMLFlipBook from 'react-pageflip';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { HTTP_BACKEND } from '@/utils/config';
import { useAuth } from '@clerk/nextjs';

interface PageData {
    contributorName: string;
    photos: { imageUrl: string }[];
    paragraphs: { value: string }[];
}

const PreviewBookPage = () => {
    const params: Record<string, string | string[]> | null = useParams();
    const project_id = Array.isArray(params?.project_id) ? params.project_id[0] : params?.project_id;
    const [pages, setPages] = useState<PageData[]>([]);
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [memoryBookOpen, setMemoryBookOpen] = useState(true);
    const router = useRouter();
    const {getToken} = useAuth();
    useEffect(() => {
        const fetchBookAndPdf = async () => {
            if (!project_id || typeof project_id !== 'string') return;

            try {
                const token = await getToken();
                if (!token) {
                    router.push('/login');
                    return;
                }

                // Fetch book HTML
                const bookResponse = await fetch(`${HTTP_BACKEND}/api/preview/${project_id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!bookResponse.ok) throw new Error('Failed to fetch book preview');
                const bookText = await bookResponse.text();

                // Parse the book HTML to extract pages
                const parser = new DOMParser();
                const doc = parser.parseFromString(bookText, 'text/html');
                const bookContainer = doc.querySelector('#book-container');
                if (bookContainer) {
                    const pageElements = bookContainer.querySelectorAll('.page');
                    const extractedPages: PageData[] = [];

                    pageElements.forEach((pageElement) => {
                        const contributions = pageElement.querySelectorAll('.contribution');
                        contributions.forEach((contribution) => {
                            const contributorName = contribution.querySelector('.contributor-name')?.textContent || 'Anonymous';
                            const photos = Array.from(contribution.querySelectorAll('.photo')).map((img) => ({
                                imageUrl: img.getAttribute('src') || '',
                            }));
                            const paragraphs = Array.from(contribution.querySelectorAll('.paragraph')).map((p) => ({
                                value: p.textContent || '',
                            }));

                            extractedPages.push({
                                contributorName,
                                photos,
                                paragraphs,
                            });
                        });
                    });

                    setPages(extractedPages);
                }

                // Fetch PDF
                const pdfResponse = await fetch(`${HTTP_BACKEND}/api/pdf/${project_id}`);
                if (!pdfResponse.ok) throw new Error('Failed to fetch PDF');
                const pdfBlob = await pdfResponse.blob();
                const pdfObjectUrl = URL.createObjectURL(pdfBlob);
                setPdfUrl(pdfObjectUrl);
            } catch (error) {
                console.error('Error fetching book or PDF:', error);
            }
        };

        fetchBookAndPdf();
    }, [project_id, router,getToken]);

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
                {/* Menu Toggle Button for Mobile */}
                <button
                    className="fixed top-4 left-4 z-[1001] md:hidden px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    ☰ Menu
                </button>

                {/* Sidebar */}
                <div
                    className={`fixed top-0 left-0 w-64 h-full bg-gray-100 p-4 overflow-y-auto z-[1000] transform transition-transform md:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        } md:translate-x-0`}
                >
                    <div className="flex flex-col h-full">
                        <div className="p-4">
                            <h2 className="text-xl font-bold text-gray-800">Memory Lane</h2>
                        </div>
                        <nav className="mt-4 flex-1">
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href={`/dashboard/${project_id}`}
                                        className="flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded"
                                    >
                                        <span className="ml-3">Dashboard</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href={`/contribution/${project_id}`}
                                        className="flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded"
                                    >
                                        <span className="ml-3">Contribution Form</span>
                                    </a>
                                </li>
                                <li>
                                    <div
                                        className="flex items-center p-2 text-gray-700 cursor-pointer hover:bg-gray-200 rounded"
                                        onClick={() => setMemoryBookOpen(!memoryBookOpen)}
                                    >
                                        <span className="ml-3 font-medium">Memory Book</span>
                                        <svg
                                            className={`w-5 h-5 ml-auto transform transition-transform ${memoryBookOpen ? 'rotate-180' : ''
                                                }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </div>
                                    <ul
                                        className={`pl-6 space-y-1 ${memoryBookOpen ? '' : 'hidden'}`}
                                    >
                                        <li>
                                            <a
                                                href={`/previewbook/${project_id}`}
                                                className="flex items-center p-2 text-gray-600 hover:bg-gray-200 rounded"
                                            >
                                                <span className="ml-3">Preview Book</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href={`${HTTP_BACKEND}/api/pdf/${project_id}`}
                                                className="flex items-center p-2 text-gray-600 hover:bg-gray-200 rounded"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <span className="ml-3">Download PDF</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <a
                                        href={`/feedback/${project_id}`}
                                        className="flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded"
                                    >
                                        <span className="ml-3">Feedback</span>
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 ml-0 md:ml-64 p-6">
                    {/* Book Preview */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-4">Book Preview</h1>
                        {pages.length > 0 ? (
                            <HTMLFlipBook
                                width={420} // A4 width in pixels (210mm at 96dpi)
                                height={594} // A4 height in pixels (297mm at 96dpi)
                                size="stretch"
                                minWidth={315}
                                maxWidth={840}
                                minHeight={445}
                                maxHeight={1188}
                                drawShadow={true}
                                flippingTime={1000}
                                usePortrait={pages.length <= 2}
                                startZIndex={0}
                                autoSize={true}
                                maxShadowOpacity={0.5}
                                showCover={false}
                                mobileScrollSupport={true}
                                className="book-flip"
                                style={{ margin: '0 auto' }} // Added style property
                                startPage={0} // Added startPage property
                                clickEventForward={true} // Added clickEventForward property
                                useMouseEvents={true} // Added useMouseEvents property
                                disableFlipByClick={false} // Added disableFlipByClick property
                                swipeDistance={30} // Added swipeDistance property
                                showPageCorners={true} // Added showPageCorners property
                            >
                                {pages.map((page, index) => (
                                    <div key={index} className="page">
                                        <div className="contribution">
                                            <h2 className="contributor-name">{page.contributorName}</h2>
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
                                    </div>
                                ))}
                            </HTMLFlipBook>
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
        .book-flip .contribution {
          margin-bottom: 10mm;
          border-bottom: 1px solid #eee;
          padding-bottom: 5mm;
        }
        .book-flip .contributor-name {
          font-size: 16pt;
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
      `}</style>
        </>
    );
};

export default PreviewBookPage;