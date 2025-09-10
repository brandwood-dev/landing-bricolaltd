import { Booking } from '@/types/bridge';

export interface RequestBase extends Booking {
  toolName: string;
  toolDescription: string;
  toolImage: string;
  owner: string;
  pickupTime: string;
  message: string;
  isOwnerView: boolean;
  refusalReason?: string;
  refusalMessage?: string;
  cancellationReason?: string;
  cancellationMessage?: string;
  renterHasReturned?: boolean;
  hasActiveClaim?: boolean;
}

export interface OwnerRequest extends RequestBase {
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  renterAvatar: string;
  ownerEmail: string;
  ownerPhone: string;
  isOwnerView: true;
}

export interface RenterRequest extends RequestBase {
  renterName?: undefined;
  renterEmail?: undefined;
  renterPhone?: undefined;
  renterAvatar?: undefined;
  ownerEmail?: undefined;
  ownerPhone?: undefined;
  isOwnerView: false;
}

export type Request = OwnerRequest | RenterRequest;

export interface StatusOption {
  value: string;
  label: string;
}