"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBookHtml = generateBookHtml;
function generateBookHtml(data) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    const { projectName, contributions, frontCover } = data;
    let pageContent = '';
    // Add front cover as the first page
    pageContent += '<div class="page front-cover">';
    if (frontCover) {
        pageContent += `
      <div class="front-cover-container">
        <h1 class="front-cover-title">${frontCover.title}</h1>
        ${frontCover.imageUrl
            ? `<img 
                 src="${frontCover.imageUrl}" 
                 alt="Front Cover" 
                 class="front-cover-image" 
                 onerror="this.src='https://via.placeholder.com/300x200?text=Front+Cover+Image+Failed+to+Load'; console.error('Front cover image failed to load:', '${frontCover.imageUrl}')"
               >`
            : ''}
        ${frontCover.description
            ? `<p class="front-cover-description">${frontCover.description}</p>`
            : ''}
      </div>
    `;
    }
    else {
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
        if (contribution.excludedFromBook)
            return null;
        // Filter pages with meaningful content (photos or paragraphs)
        const validPages = contribution.pages.filter((page, pageIndex) => {
            const components = page.components || [];
            const hasContent = components.some((comp) => {
                if (comp.type === 'photo' && comp.imageUrl)
                    return true;
                if (comp.type === 'paragraph' &&
                    comp.value &&
                    comp.value.trim() !== '' &&
                    !comp.value.toLowerCase().includes('test document') &&
                    !comp.value.toLowerCase().includes('document doesn\'t look right')) {
                    // Check for repetitive content (e.g., repeated "T"s)
                    const trimmedValue = comp.value.trim();
                    const charCount = trimmedValue.length;
                    const uniqueChars = new Set(trimmedValue.split('')).size;
                    const isRepetitive = charCount > 10 && uniqueChars <= 2; // More than 10 chars but 2 or fewer unique characters
                    return !isRepetitive;
                }
                return false;
            });
            console.log(`Contribution ${contribIndex}, Page ${pageIndex} has content: ${hasContent}`, components);
            return hasContent;
        });
        if (validPages.length === 0)
            return null;
        return Object.assign(Object.assign({}, contribution), { pages: validPages });
    })
        .filter((contribution) => contribution !== null);
    console.log('Filtered Contributions:', JSON.stringify(filteredContributions, null, 2));
    // Add contribution pages
    let pageCount = 0; // Start after front cover
    filteredContributions.forEach((contribution, contribIndex) => {
        contribution.pages.forEach((page, pageIndex) => {
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
            const photos = page.components.filter((comp) => comp.type === 'photo' && comp.imageUrl);
            const paragraphs = page.components.filter((comp) => comp.type === 'paragraph' &&
                comp.value &&
                comp.value.trim() !== '' &&
                !comp.value.toLowerCase().includes('test document') &&
                !comp.value.toLowerCase().includes('document doesn\'t look right'));
            if (photos.length === 0 && paragraphs.length > 0) {
                pageContent += `
          <div class="content-container">
            ${paragraphs
                    .map((paragraph) => `
              <p class="paragraph">${paragraph.value}</p>
            `)
                    .join('')}
          </div>
        `;
            }
            else if (photos.length > 0) {
                // Group photos into rows of 2
                const rows = [];
                for (let i = 0; i < photos.length; i += 2) {
                    rows.push(photos.slice(i, i + 2));
                }
                // Calculate the height of each row based on the tallest image in that row
                const rowHeights = rows.map((row) => Math.max(...row.map((photo) => {
                    const size = photo.size && typeof photo.size === 'object' ? photo.size : {};
                    const maxHeight = 300; // Cap image height to fit within page
                    return Math.min(size.height || 180, maxHeight);
                })));
                // Calculate the starting Y position for each row
                let currentY = 0;
                const rowPositions = [];
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
                    // Track image URLs in this row to detect duplicates
                    const imageUrls = new Set();
                    return `
                <div class="image-row relative" style="height: ${rowHeights[rowIdx]}px;">
                  ${row
                        .map((photo, idx) => {
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
                        // Debug image URL
                        console.log(`Contribution ${contribIndex}, Page ${pageIndex}, Image ${idx} URL:`, photo.imageUrl);
                        // Check for duplicate image URLs in the row
                        let imageSrc = photo.imageUrl || 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                        if (imageUrls.has(photo.imageUrl)) {
                            console.log(`Duplicate image URL detected in Contribution ${contribIndex}, Page ${pageIndex}, Image ${idx}:`, photo.imageUrl);
                            imageSrc = 'https://via.placeholder.com/300x200?text=Duplicate+Image';
                        }
                        else {
                            imageUrls.add(photo.imageUrl);
                        }
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
                        src="${imageSrc}" 
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
                    .map((paragraph) => {
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
          font-size: ${((_a = frontCover === null || frontCover === void 0 ? void 0 : frontCover.titleStyle) === null || _a === void 0 ? void 0 : _a.fontSize) || '30pt'};
          font-weight: ${((_b = frontCover === null || frontCover === void 0 ? void 0 : frontCover.titleStyle) === null || _b === void 0 ? void 0 : _b.fontWeight) || 'bold'};
          margin-bottom: ${((_c = frontCover === null || frontCover === void 0 ? void 0 : frontCover.titleStyle) === null || _c === void 0 ? void 0 : _c.marginBottom) || '60px'};
          margin-top: ${((_d = frontCover === null || frontCover === void 0 ? void 0 : frontCover.titleStyle) === null || _d === void 0 ? void 0 : _d.marginTop) || '40px'};
          text-align: ${((_e = frontCover === null || frontCover === void 0 ? void 0 : frontCover.titleStyle) === null || _e === void 0 ? void 0 : _e.textAlign) || 'center'};
          color: #000;
          word-break: break-word;
        }
        .front-cover-image {
          width: ${((_f = frontCover === null || frontCover === void 0 ? void 0 : frontCover.imageStyle) === null || _f === void 0 ? void 0 : _f.width) ? `${frontCover.imageStyle.width}px` : '280px'};
          height: ${((_g = frontCover === null || frontCover === void 0 ? void 0 : frontCover.imageStyle) === null || _g === void 0 ? void 0 : _g.height) ? `${frontCover.imageStyle.height}px` : '200px'};
          object-fit: ${((_h = frontCover === null || frontCover === void 0 ? void 0 : frontCover.imageStyle) === null || _h === void 0 ? void 0 : _h.objectFit) || 'contain'};
          box-shadow: ${((_j = frontCover === null || frontCover === void 0 ? void 0 : frontCover.imageStyle) === null || _j === void 0 ? void 0 : _j.shadow) || '0 4px 6px rgba(0, 0, 0, 0.1)'};
          margin-bottom: ${((_k = frontCover === null || frontCover === void 0 ? void 0 : frontCover.imageStyle) === null || _k === void 0 ? void 0 : _k.marginBottom) || '60px'};
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        .front-cover-description {
          max-width: ${((_l = frontCover === null || frontCover === void 0 ? void 0 : frontCover.descriptionStyle) === null || _l === void 0 ? void 0 : _l.maxWidth) || '80%'};
          color: ${((_m = frontCover === null || frontCover === void 0 ? void 0 : frontCover.descriptionStyle) === null || _m === void 0 ? void 0 : _m.color) || '#4b5563'};
          font-size: ${((_o = frontCover === null || frontCover === void 0 ? void 0 : frontCover.descriptionStyle) === null || _o === void 0 ? void 0 : _o.fontSize) || '13pt'};
          text-align: ${((_p = frontCover === null || frontCover === void 0 ? void 0 : frontCover.descriptionStyle) === null || _p === void 0 ? void 0 : _p.textAlign) || 'center'};
          margin-top: ${((_q = frontCover === null || frontCover === void 0 ? void 0 : frontCover.descriptionStyle) === null || _q === void 0 ? void 0 : _q.marginTop) || '40px'};
          font-style: ${((_r = frontCover === null || frontCover === void 0 ? void 0 : frontCover.descriptionStyle) === null || _r === void 0 ? void 0 : _r.fontStyle) || 'italic'};
          line-height: ${((_s = frontCover === null || frontCover === void 0 ? void 0 : frontCover.descriptionStyle) === null || _s === void 0 ? void 0 : _s.lineHeight) || '1.5'};
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
