// Main user interface from API
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: UserAddress;
  phone: string;
  website: string;
  company: UserCompany;
}

// User address details
export interface UserAddress {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: UserGeo;
}

// Geographic coordinates
export interface UserGeo {
  lat: string;
  lng: string;
}

// User company information
export interface UserCompany {
  name: string;
  catchPhrase: string;
  bs: string;
}