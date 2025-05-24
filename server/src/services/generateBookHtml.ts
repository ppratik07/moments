function generateBookHtml(data: {
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
                   onerror="this.src='https://via.placeholder.com/300x200?text=Image+Failed+to+Load'; console.error('Front cover image failed to load:', '${frontCover.imageUrl}')"
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
  
    // Add contribution pages
    let pageCount = 0; // Start after front cover
    contributions.forEach((contribution) => {
      if (contribution.excludedFromBook) return;
  
      contribution.pages.forEach((page: any) => {
        if (pageCount % 2 === 0 && pageCount > 0) {
          pageContent += '</div>';
        }
        if (pageCount % 2 === 0) {
          pageContent += '<div class="page">';
        }
  
        pageContent += `
          <div class="contribution">
            <h2 class="contributor-name">${contribution.contributorName}</h2>
        `;
  
        const photos = page.components.filter((comp: any) => comp.type === 'photo' && comp.imageUrl);
        photos.forEach((photo: any) => {
          pageContent += `
            <img 
              src="${photo.imageUrl || 'https://via.placeholder.com/300x200?text=Image+Not+Found'}" 
              alt="Contribution photo" 
              class="photo" 
              onerror="this.src='https://via.placeholder.com/300x200?text=Image+Failed+to+Load'; console.error('Image failed to load:', '${photo.imageUrl}')"
            >
          `;
        });
  
        const paragraphs = page.components.filter((comp: any) => comp.type === 'paragraph' && comp.value);
        paragraphs.forEach((paragraph: any) => {
          pageContent += `<p class="paragraph">${paragraph.value}</p>`;
        });
  
        if (photos.length === 0 && paragraphs.length === 0) {
          pageContent += `<p class="no-content">No content available</p>`;
        }
  
        pageContent += '</div>';
        pageCount++;
      });
    });
  
    if (pageCount % 2 !== 0 || pageCount === 0) {
      pageContent += '</div>';
    }
  
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
            max-width: 210mm;
            margin: 0 auto;
            background: #fff;
          }
          .page {
            width: 210mm;
            min-height: 297mm;
            padding: 10mm;
            box-sizing: border-box;
            background: #fff;
            page-break-after: always;
          }
          .front-cover {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            padding: 20mm;
            background: #fff;
          }
          .front-cover-container {
            position: relative;
            width: 100%;
            max-width: 180mm;
            text-align: center;
            border: 2px dashed #9ca3af;
            padding: 10mm;
            box-sizing: border-box;
          }
          .front-cover-title {
            font-size: ${frontCover?.titleStyle?.fontSize || '30pt'};
            font-weight: ${frontCover?.titleStyle?.fontWeight || 'bold'};
            margin-bottom: ${frontCover?.titleStyle?.marginBottom || '15mm'};
            margin-top: ${frontCover?.titleStyle?.marginTop || '10mm'};
            text-align: ${frontCover?.titleStyle?.textAlign || 'center'};
            color: #000;
            word-break: break-word;
          }
          .front-cover-image {
            width: ${frontCover?.imageStyle?.width ? `${frontCover.imageStyle.width}px` : '280px'};
            height: ${frontCover?.imageStyle?.height ? `${frontCover.imageStyle.height}px` : '200px'};
            object-fit: ${frontCover?.imageStyle?.objectFit || 'contain'};
            box-shadow: ${frontCover?.imageStyle?.shadow || '0 4px 6px rgba(0, 0, 0, 0.1)'};
            margin-bottom: ${frontCover?.imageStyle?.marginBottom || '15mm'};
            display: block;
            margin-left: auto;
            margin-right: auto;
          }
          .front-cover-description {
            max-width: ${frontCover?.descriptionStyle?.maxWidth || '80%'};
            color: ${frontCover?.descriptionStyle?.color || '#4b5563'};
            font-size: ${frontCover?.descriptionStyle?.fontSize || '13pt'};
            text-align: ${frontCover?.descriptionStyle?.textAlign || 'center'};
            margin-top: ${frontCover?.descriptionStyle?.marginTop || '10mm'};
            font-style: ${frontCover?.descriptionStyle?.fontStyle || 'italic'};
            line-height: ${frontCover?.descriptionStyle?.lineHeight || '1.5'};
            word-break: break-word;
            margin-left: auto;
            margin-right: auto;
          }
          .contribution {
            margin-bottom: 10mm;
            border-bottom: 1px solid #eee;
            padding-bottom: 5mm;
          }
          .contributor-name {
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 5mm;
            color: #333;
          }
          .photo {
            max-width: 100%;
            height: auto;
            margin-bottom: 5mm;
            border-radius: 4px;
            display: block;
          }
          .paragraph {
            font-size: 12pt;
            line-height: 1.5;
            color: #555;
            margin-bottom: 5mm;
          }
          .no-content {
            font-size: 12pt;
            color: #999;
            text-align: center;
          }
          @page {
            size: A4;
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