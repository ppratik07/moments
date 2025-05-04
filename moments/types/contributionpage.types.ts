// Type definitions
export interface Position {
    x_position?: number;
    y_position?: number;
    x_coordinate?: number;
    y_coordinate?: number;
  }
  
  export interface Size {
    width: number;
    height: number;
  }
  
  export interface Styles {
    font_family?: string;
    font_size?: number;
    font_weight?: string;
  }
  
  export interface Editor {
    label: string;
    placeholder: string;
    max_characters: number;
  }
  
  export interface CroppingInfo {
    x_position: number;
    y_position: number;
    width: number;
    height: number;
  }
  
  export interface Original {
    url: string;
    cropping_info: CroppingInfo;
  }
  
  export interface Component {
    type: 'heading' | 'signature' | 'paragraph' | 'caption' | 'photo';
    position: Position;
    size: Size;
    styles?: Styles;
    editor?: Editor;
    value?: string;
    image_url?: string;
    original?: Original;
  }
  
  export interface Layout {
    guid: string;
    name?: string;
    components: Component[];
  }
  
