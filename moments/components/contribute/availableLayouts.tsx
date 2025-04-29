import { Layout } from "@/app/contribution/[projectId]/page";
// Updated available layouts (one layout per category for simplicity)
export const availableLayouts: Layout[] = [
    // Category 0: Message Only
    {
      guid: 'layout-0',
      name: 'Message Only',
      components: [
        {
          type: 'paragraph',
          position: { x_position: 50, y_position: 50 },
          size: { width: 500, height: 200 },
          styles: { font_family: 'Arial', font_size: 16, font_weight: 'normal' },
          editor: { label: 'Message', placeholder: 'Enter your message', max_characters: 500 },
          value: ''
        }
      ]
    },
    // Category 1: Photos Only (2 Photos)
    {
      guid: 'layout-1',
      name: 'Photos Only (2 Photos)',
      components: [
        {
          type: 'photo',
          position: { x_coordinate: 50, y_coordinate: 50 },
          size: { width: 300, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        },
        {
          type: 'photo',
          position: { x_coordinate: 400, y_coordinate: 50 },
          size: { width: 300, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        }
      ]
    },
    // Category 2: Photos Only (3 Photos)
    {
      guid: 'layout-2',
      name: 'Photos Only (3 Photos)',
      components: [
        {
          type: 'photo',
          position: { x_coordinate: 50, y_coordinate: 50 },
          size: { width: 200, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        },
        {
          type: 'photo',
          position: { x_coordinate: 300, y_coordinate: 50 },
          size: { width: 200, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        },
        {
          type: 'photo',
          position: { x_coordinate: 550, y_coordinate: 50 },
          size: { width: 200, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        }
      ]
    },
    // Category 3: Photos Only (4 Photos)
    {
      guid: 'layout-3',
      name: 'Photos Only (4 Photos)',
      components: [
        {
          type: 'photo',
          position: { x_coordinate: 50, y_coordinate: 50 },
          size: { width: 200, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        },
        {
          type: 'photo',
          position: { x_coordinate: 300, y_coordinate: 50 },
          size: { width: 200, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        },
        {
          type: 'photo',
          position: { x_coordinate: 50, y_coordinate: 300 },
          size: { width: 200, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        },
        {
          type: 'photo',
          position: { x_coordinate: 300, y_coordinate: 300 },
          size: { width: 200, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        }
      ]
    },
    // Category 4: Message with 1 Photo
    {
      guid: 'layout-4',
      name: 'Message with 1 Photo',
      components: [
        {
          type: 'paragraph',
          position: { x_position: 370, y_position: 50 },
          size: { width: 400, height: 200 },
          styles: { font_family: 'Arial', font_size: 16, font_weight: 'normal' },
          editor: { label: 'Message', placeholder: 'Enter your message', max_characters: 500 },
          value: ''
        },
        {
          type: 'photo',
          position: { x_coordinate: 50, y_coordinate: 50 },
          size: { width: 300, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        }
      ]
    },
    // Category 5: Message with 2 Photos
    {
      guid: 'layout-5',
      name: 'Message with 2 Photos',
      components: [
        {
          type: 'paragraph',
          position: { x_position: 50, y_position: 300 },
          size: { width: 700, height: 200 },
          styles: { font_family: 'Arial', font_size: 16, font_weight: 'normal' },
          editor: { label: 'Message', placeholder: 'Enter your message', max_characters: 500 },
          value: ''
        },
        {
          type: 'photo',
          position: { x_coordinate: 50, y_coordinate: 50 },
          size: { width: 300, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        },
        {
          type: 'photo',
          position: { x_coordinate: 400, y_coordinate: 50 },
          size: { width: 300, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        }
      ]
    },
    // Category 6: Message with 3 Photos
    {
      guid: 'layout-6',
      name: 'Message with 3 Photos',
      components: [
        {
          type: 'paragraph',
          position: { x_position: 50, y_position: 300 },
          size: { width: 700, height: 200 },
          styles: { font_family: 'Arial', font_size: 16, font_weight: 'normal' },
          editor: { label: 'Message', placeholder: 'Enter your message', max_characters: 500 },
          value: ''
        },
        {
          type: 'photo',
          position: { x_coordinate: 50, y_coordinate: 50 },
          size: { width: 200, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        },
        {
          type: 'photo',
          position: { x_coordinate: 300, y_coordinate: 50 },
          size: { width: 200, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        },
        {
          type: 'photo',
          position: { x_coordinate: 550, y_coordinate: 50 },
          size: { width: 200, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        }
      ]
    },
    // Category 7: Message with 4 Photos
    {
      guid: 'layout-7',
      name: 'Message with 4 Photos',
      components: [
        {
          type: 'paragraph',
          position: { x_position: 50, y_position: 550 }, // Adjusted from 520 to 550
          size: { width: 700, height: 100 },
          styles: { font_family: 'Arial', font_size: 16, font_weight: 'normal' },
          editor: { label: 'Message', placeholder: 'Enter your message', max_characters: 500 },
          value: ''
        },
        {
          type: 'photo',
          position: { x_coordinate: 50, y_coordinate: 50 },
          size: { width: 200, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        },
        {
          type: 'photo',
          position: { x_coordinate: 300, y_coordinate: 50 },
          size: { width: 200, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        },
        {
          type: 'photo',
          position: { x_coordinate: 50, y_coordinate: 300 },
          size: { width: 200, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        },
        {
          type: 'photo',
          position: { x_coordinate: 300, y_coordinate: 300 },
          size: { width: 200, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        }
      ]
    },
    // Category 8: Caption with Photos (2 Photos)
    {
      guid: 'layout-8',
      name: 'Caption with Photos (2 Photos)',
      components: [
        {
          type: 'caption',
          position: { x_position: 50, y_position: 300 },
          size: { width: 700, height: 50 },
          styles: { font_family: 'Arial', font_size: 14, font_weight: 'normal' },
          editor: { label: 'Caption', placeholder: 'Enter a caption', max_characters: 100 },
          value: ''
        },
        {
          type: 'photo',
          position: { x_coordinate: 50, y_coordinate: 50 },
          size: { width: 300, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        },
        {
          type: 'photo',
          position: { x_coordinate: 400, y_coordinate: 50 },
          size: { width: 300, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        }
      ]
    },
    // Category 9: Heading with Photos (3 Photos)
    {
      guid: 'layout-9',
      name: 'Heading with Photos (3 Photos)',
      components: [
        {
          type: 'heading',
          position: { x_position: 50, y_position: 20 },
          size: { width: 700, height: 40 },
          styles: { font_family: 'Arial', font_size: 24, font_weight: 'bold' },
          editor: { label: 'Heading', placeholder: 'Enter a heading', max_characters: 50 },
          value: ''
        },
        {
          type: 'photo',
          position: { x_coordinate: 50, y_coordinate: 100 },
          size: { width: 200, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        },
        {
          type: 'photo',
          position: { x_coordinate: 300, y_coordinate: 100 },
          size: { width: 200, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        },
        {
          type: 'photo',
          position: { x_coordinate: 550, y_coordinate: 100 },
          size: { width: 200, height: 200 },
          styles: {},
          image_url: '',
          original: { url: '', cropping_info: { x_position: 0, y_position: 0, width: 0, height: 0 } }
        }
      ]
    }
  ];