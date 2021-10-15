export default interface Task {
    id: string;
    creationAuthor: number;
    creationDate: string;
    endDate: string;
    planStartDate: string;
    planEndDate: string;
    executor: number;
    order: number;
    status: number;
    description: string;
    subject: string;
}