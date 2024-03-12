export interface UserWithToken {
  token: string
  user: UserI
}

export interface UserI {
  id?: number;
  name: string;
  last_name: string;
  password: string;
  username: string;
  email: string
  superuser?: boolean
  role: Roles
}

export enum Roles {
  admin = 'admin',
  user = 'user',
  visit = 'visit',
}
