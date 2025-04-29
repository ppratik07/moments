// Updated layout categories (10 categories total)
export const layoutCategories = [
    { title: 'Message Only', layouts: [() => 0, () => 0] }, // 0 photos
    { title: 'Photos Only (2 Photos)', layouts: [() => 2, () => 2] }, // 2 photos
    { title: 'Photos Only (3 Photos)', layouts: [() => 3, () => 3] }, // 3 photos
    { title: 'Photos Only (4 Photos)', layouts: [() => 4, () => 4] }, // 4 photos
    { title: 'Message with 1 Photo', layouts: [() => 1, () => 1] }, // 1 photo + message
    { title: 'Message with 2 Photos', layouts: [() => 2, () => 2] }, // 2 photos + message
    { title: 'Message with 3 Photos', layouts: [() => 3, () => 3] }, // 3 photos + message
    { title: 'Message with 4 Photos', layouts: [() => 4, () => 4] }, // 4 photos + message
    { title: 'Caption with Photos (2 Photos)', layouts: [() => 2, () => 2] }, // 2 photos + caption
    { title: 'Heading with Photos (3 Photos)', layouts: [() => 3, () => 3] }, // 3 photos + heading
  ];
  