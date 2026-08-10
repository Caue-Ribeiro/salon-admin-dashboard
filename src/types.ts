export interface Client {
    id: string | number
    name: string
    phone_number: string
    followup_status?: string
    service_interest?: string
}

export interface Appointment {
    id: string | number
    client_id: string | number
    scheduling_time: string
    status: string
    service_ids?: (string | number)[]
}

export interface Service {
    id: string | number
    name: string
    price: number // in cents
    duration: number // in minutes
}
