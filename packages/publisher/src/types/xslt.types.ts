export interface XslAttribute {
  '@name': string;
  '#': string;
}

export interface XslAttributeSet {
  '@name': string;
  'xsl:attribute': XslAttribute | XslAttribute[];
}

export interface XslVariable {
  '@name': string;
  '#': string;
}

export interface XslStylesheet {
  'xsl:attribute-set'?: XslAttributeSet | XslAttributeSet[];
  'xsl:variable'?: XslVariable | XslVariable[];
  '#'?: any[]; // Mixed content
  [key: string]: any;
}

export interface XslDoc {
  'xsl:stylesheet': XslStylesheet;
}
