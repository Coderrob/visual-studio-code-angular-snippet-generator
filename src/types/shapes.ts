export interface PropertyShape {
  name: string;
  type?: string;
}

export interface ComponentShape {
  className: string;
  selector: string;
  inputs: PropertyShape[];
  outputs: PropertyShape[];
}
