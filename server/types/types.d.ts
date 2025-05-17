// Extend the Request interface to include userId
export declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export interface Courier{
  courier_company_id: string;
  courier_name: string;
  freight_charge: any | number | bigint | Enumerator;
  estimated_delivery_days : string;
}