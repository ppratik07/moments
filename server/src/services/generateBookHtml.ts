export function generateBookHtml(data: {
  projectName: string;
  contributions: any[];
  frontCover: {
    title: string;
    imageUrl: string;
    description: string;
    titleStyle: any;
    imageStyle: any;
    descriptionStyle: any;
    containerStyle: any;
    hoverEffects: any;
  } | null;
}): string {
  const { projectName, contributions, frontCover } = data;
  let pageContent = '';

  // Add front cover as the first page
  pageContent += '<div class="page front-cover">';
  if (frontCover) {
    pageContent += `
      <div class="front-cover-container">
        <h1 class="front-cover-title">${frontCover.title}</h1>
        ${
          frontCover.imageUrl
            ? `<img 
                 src="${frontCover.imageUrl}" 
                 alt="Front Cover" 
                 class="front-cover-image" 
                 onerror="this.src='https://via.placeholder.com/300x200?text=Front+Cover+Image+Failed+to+Load'; console.error('Front cover image failed to load:', '${frontCover.imageUrl}')"
               >`
            : ''
        }
        ${
          frontCover.description
            ? `<p class="front-cover-description">${frontCover.description}</p>`
            : ''
        }
      </div>
    `;
  } else {
    pageContent += `
      <div class="front-cover-container">
        <h1 class="front-cover-title">Memory Lane Book</h1>
      </div>
    `;
  }
  pageContent += '</div>';

  // Debug contributions data
  console.log('Contributions:', JSON.stringify(contributions, null, 2));

  // Filter contributions to exclude empty or invalid pages
  const filteredContributions = contributions
    .map((contribution, contribIndex) => {
      if (contribution.excludedFromBook) return null;

      // Filter pages with meaningful content (photos or paragraphs)
      const validPages = contribution.pages.filter((page: any, pageIndex: number) => {
        const components = page.components || [];
        const hasContent = components.some((comp: any) => {
          if (comp.type === 'photo' && comp.imageUrl) return true;
          if (
            comp.type === 'paragraph' &&
            comp.value &&
            comp.value.trim() !== '' &&
            !comp.value.toLowerCase().includes('test document') &&
            !comp.value.toLowerCase().includes('document doesn\'t look right')
          ) {
            // Check for repetitive content (e.g., repeated "T"s)
            const trimmedValue = comp.value.trim();
            const charCount = trimmedValue.length;
            const uniqueChars = new Set(trimmedValue.split('')).size;
            const isRepetitive = charCount > 10 && uniqueChars <= 2; // More than 10 chars but 2 or fewer unique characters
            return !isRepetitive;
          }
          return false;
        });

        console.log(
          `Contribution ${contribIndex}, Page ${pageIndex} has content: ${hasContent}`,
          components
        );

        return hasContent;
      });

      if (validPages.length === 0) return null;

      return {
        ...contribution,
        pages: validPages,
      };
    })
    .filter((contribution) => contribution !== null);

  console.log('Filtered Contributions:', JSON.stringify(filteredContributions, null, 2));

  // Add contribution pages
  let pageCount = 0; // Start after front cover
  filteredContributions.forEach((contribution: any, contribIndex: number) => {
    contribution.pages.forEach((page: any, pageIndex: number) => {
      console.log(`Processing page ${pageIndex} of contribution ${contribIndex}:`, page);

      if (pageCount % 2 === 0) {
        if (pageCount > 0) {
          pageContent += '</div>';
        }
        pageContent += '<div class="page">';
      }

      pageContent += `
        <div class="contribution">
          <h2 class="contributor-name">Contributed By: ${contribution.contributorName}</h2>
      `;

      const photos = page.components.filter((comp: any) => comp.type === 'photo' && comp.imageUrl);
      const paragraphs = page.components.filter(
        (comp: any) =>
          comp.type === 'paragraph' &&
          comp.value &&
          comp.value.trim() !== '' &&
          !comp.value.toLowerCase().includes('test document') &&
          !comp.value.toLowerCase().includes('document doesn\'t look right')
      );

      if (photos.length === 0 && paragraphs.length > 0) {
        pageContent += `
          <div class="content-container">
            ${paragraphs
              .map(
                (paragraph: any) => `
              <p class="paragraph">${paragraph.value}</p>
            `
              )
              .join('')}
          </div>
        `;
      } else if (photos.length > 0) {
        // Group photos into rows of 2
        const rows: any[][] = [];
        for (let i = 0; i < photos.length; i += 2) {
          rows.push(photos.slice(i, i + 2));
        }

        // Calculate the height of each row based on the tallest image in that row
        const rowHeights: number[] = rows.map((row) =>
          Math.max(
            ...row.map((photo: any) => {
              const size = photo.size && typeof photo.size === 'object' ? photo.size : {};
              const maxHeight = 300; // Cap image height to fit within page
              return Math.min(size.height || 180, maxHeight);
            })
          )
        );

        // Calculate the starting Y position for each row
        let currentY = 0;
        const rowPositions: number[] = [];
        rowHeights.forEach((height, idx) => {
          rowPositions.push(currentY);
          currentY += height + 20; // Add 20px gap between rows
        });

        // Ensure total image container height fits within the page
        const maxImageContainerHeight = 600; // Leave space for paragraphs and contributor name
        if (currentY > maxImageContainerHeight) {
          currentY = maxImageContainerHeight;
        }

        pageContent += `
          <div class="content-container relative w-full" style="max-height: ${maxImageContainerHeight}px; overflow: hidden;">
            ${rows
              .map((row, rowIdx) => {
                const rowY = rowPositions[rowIdx];
                return `
                <div class="image-row relative" style="height: ${rowHeights[rowIdx]}px;">
                  ${row
                    .map((photo: any, idx: number) => {
                      const size = photo.size && typeof photo.size === 'object' ? photo.size : { width: 250, height: 180 };
                      const position = photo.position && typeof photo.position === 'object' ? photo.position : { x_coordinate: idx * 250, y_coordinate: 0 };

                      // Cap image size to fit within page
                      const maxWidth = 250; // Slightly less than half of 520px usable width
                      const maxHeight = 300; // Cap height to fit within page
                      const finalWidth = Math.min(size.width || 250, maxWidth);
                      const finalHeight = Math.min(size.height || 180, maxHeight);

                      // Adjust position with a 20px gap between images
                      const gap = 20;
                      const totalImageWidth = finalWidth * row.length + gap * (row.length - 1);
                      const startX = (520 - totalImageWidth) / 2; // Center the images within 520px usable width
                      const clampedX = position.x_coordinate
                        ? Math.min(Math.max(position.x_coordinate, 0), 520 - finalWidth)
                        : startX + idx * (finalWidth + gap);

                      const maxHeightForPosition = rowHeights[rowIdx] - finalHeight;
                      const clampedY = position.y_coordinate
                        ? Math.min(Math.max(position.y_coordinate, 0), maxHeightForPosition)
                        : 0;

                      const inlineStyles = `
                        position: absolute;
                        left: ${clampedX}px;
                        top: ${clampedY + rowY}px;
                        width: ${finalWidth}px;
                        height: ${finalHeight}px;
                        z-index: ${rowIdx * 2 + idx + 1};
                        border-radius: 4px;
                        object-fit: cover;
                        border: 1px solid #ccc; /* Temporary border to debug image visibility */
                      `;

                      return `
                      <img 
                        src="${photo.imageUrl || 'https://via.placeholder.com/300x200?text=Image+Not+Found'}" 
                        alt="Contribution photo" 
                        class="photo" 
                        style="${inlineStyles}"
                        onerror="this.src='https://via.placeholder.com/300x200?text=Image+Failed+to+Load'; console.error('Image failed to load:', '${photo.imageUrl}')"
                      >
                    `;
                    })
                    .join('')}
                </div>
              `;
              })
              .join('')}

            ${paragraphs
              .map((paragraph: any) => {
                const size = paragraph.size && typeof paragraph.size === 'object' ? paragraph.size : {};
                const paraStyles = `
                  position: relative;
                  width: ${size.width ? `${size.width}px` : '100%'};
                  max-width: 448px;
                  margin-top: ${currentY}px;
                `;
                return `
                <p class="paragraph" style="${paraStyles}">
                  ${paragraph.value}
                </p>
              `;
              })
              .join('')}
          </div>
        `;
      }

      if (photos.length === 0 && paragraphs.length === 0) {
        pageContent += `<p class="no-content">No content available</p>`;
      }

      pageContent += '</div>';
      pageCount++;
    });
  });

  // Close the last page div if it's open (odd number of pages)
  if (pageCount % 2 !== 0) {
    pageContent += '</div>';
  }

  // Add "The End" page as a standalone page
  pageContent += `
    <div class="page">
      <div class="page-cover flex items-center justify-center h-full">
        <h2 class="text-2xl font-bold text-gray-800">The End</h2>
      </div>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${projectName} - Book Preview</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background: #fff;
        }
        .book-container {
          max-width: 600px;
          margin: 0 auto;
          background: #fff;
        }
        .page {
          width: 600px;
          height: 900px;
          padding: 40px;
          box-sizing: border-box;
          background: #fff;
          position: relative;
          page-break-after: always;
        }
        .front-cover {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 80px;
          background: #fff;
        }
        .front-cover-container {
          position: relative;
          width: 100%;
          max-width: 440px;
          text-align: center;
          border: 2px dashed #9ca3af;
          padding: 40px;
          box-sizing: border-box;
        }
        .front-cover-title {
          font-size: ${frontCover?.titleStyle?.fontSize || '30pt'};
          font-weight: ${frontCover?.titleStyle?.fontWeight || 'bold'};
          margin-bottom: ${frontCover?.titleStyle?.marginBottom || '60px'};
          margin-top: ${frontCover?.titleStyle?.marginTop || '40px'};
          text-align: ${frontCover?.titleStyle?.textAlign || 'center'};
          color: #000;
          word-break: break-word;
        }
        .front-cover-image {
          width: ${frontCover?.imageStyle?.width ? `${frontCover.imageStyle.width}px` : '280px'};
          height: ${frontCover?.imageStyle?.height ? `${frontCover.imageStyle.height}px` : '200px'};
          object-fit: ${frontCover?.imageStyle?.objectFit || 'contain'};
          box-shadow: ${frontCover?.imageStyle?.shadow || '0 4px 6px rgba(0, 0, 0, 0.1)'};
          margin-bottom: ${frontCover?.imageStyle?.marginBottom || '60px'};
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        .front-cover-description {
          max-width: ${frontCover?.descriptionStyle?.maxWidth || '80%'};
          color: ${frontCover?.descriptionStyle?.color || '#4b5563'};
          font-size: ${frontCover?.descriptionStyle?.fontSize || '13pt'};
          text-align: ${frontCover?.descriptionStyle?.textAlign || 'center'};
          margin-top: ${frontCover?.descriptionStyle?.marginTop || '40px'};
          font-style: ${frontCover?.descriptionStyle?.fontStyle || 'italic'};
          line-height: ${frontCover?.descriptionStyle?.lineHeight || '1.5'};
          word-break: break-word;
          margin-left: auto;
          margin-right: auto;
        }
        .contribution {
          margin-bottom: 20px;
          padding-bottom: 20px;
          height: calc(100% - 40px);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .contributor-name {
          font-size: 16pt;
          font-weight: bold;
          margin-bottom: 20px;
          color: #333;
          text-align: center;
        }
        .content-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          min-height: 0;
          max-height: 820px;
        }
        .image-row {
          width: 100%;
          position: relative;
        }
        .photo {
          height: auto;
          border-radius: 4px;
        }
        .paragraph {
          font-size: 12pt;
          line-height: 1.5;
          color: #555;
          margin-bottom: 20px;
          max-width: 520px;
          text-align: center;
          white-space: normal;
          word-wrap: break-word;
        }
        .no-content {
          font-size: 12pt;
          color: #999;
          text-align: center;
        }
        .page-cover {
          height: 100%;
          background: #f3f4f6;
          border: 2px solid #1f2937;
        }
        @page {
          size: 600px 900px;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div id="book-container" class="book-container">
        ${pageContent}
      </div>
    </body>
    </html>
  `;
}