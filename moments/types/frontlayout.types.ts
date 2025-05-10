// Define types for layout configuration
export interface BorderStyle {
    type: string;
    width: number;
    color: string;
    inset: number;
  }
  
  export interface ContainerStyle {
    shadow: string;
    border: string;
    width: string;
    height: string;
    padding: string;
    display: string;
  }
  
  export interface TitleStyle {
    fontSize: string;
    fontWeight: string;
    marginBottom: string;
    textAlign: string;
    marginTop: string;
    wordBreak: string;
  }
  
  export interface ImageStyle {
    width: number;
    height: number;
    objectFit: string;
    shadow: string;
    marginBottom: string;
  }
  
  export interface DescriptionStyle {
    maxWidth: string;
    color: string;
    fontSize: string;
    textAlign: string;
    marginTop: string;
    fontStyle: string;
    lineHeight: string;
    wordBreak: string;
  }
  
  export interface HoverEffects {
    rotate: string;
    scale: string;
    shadow: string;
  }
  
  export interface LayoutConfig {
    [key: string]: unknown;
    imageKey?: string | null;
    title?: string;
    description?: string;
    text?: string;
    backgroundColor: string;
    alignment: string;
    borderStyle?: BorderStyle;
    containerStyle?: ContainerStyle;
    titleStyle?: TitleStyle;
    imageStyle?: ImageStyle;
    descriptionStyle?: DescriptionStyle;
    hoverEffects?: HoverEffects;
  }
  
  export interface Layout {
    id: string;
    pageType: string;
    isPreview: boolean;
    section?: string;
    config: LayoutConfig;
  }
  
  
  
  // Define types for useCurrentUser
  export interface CurrentUser {
    isSignedIn: boolean | undefined;
  }
  
  