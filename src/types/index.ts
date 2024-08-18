export interface Suggestion {
  id: string;
  name: string;
}

export interface Country {
  flag: string;
  name: {
    common: string;
    official?: string;
  };
  currencies?: {
    [code: string]: {
      name: string;
      symbol: string;
    };
  };
}