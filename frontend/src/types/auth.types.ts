export interface ILoginRequest {
    login: string;
    password: string;
}

export interface IAuthResponse {
    access_token: string;
    token_type: string;
}

export interface IRegVolunteerRequest {
    login: string;
    password: string;
    firstName: string;
    secondName: string;
    middleName: string;
    about: string;
    birthday: string;
    city: string;
    sex: string;
    email: string;
    phone: string;
}
