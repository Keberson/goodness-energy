export interface IVolunteer {
    id: number;
    firstName: string;
    secondName: string;
    middleName: string | null;
    about: string;
    birthday: string;
    city: string;
    sex: "male" | "female";
    email: string;
    phone: string;
    created_at: string;
}

export interface IVolunteerEdit {
    firstName: string;
    secondName: string;
    middleName: string | null;
    about: string;
    birthday: string;
    city: string;
    sex: "male" | "female";
    email: string;
    phone: string;
}
