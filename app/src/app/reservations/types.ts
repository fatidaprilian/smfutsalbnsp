export type Slot = { hour: number; available: boolean };
export type CourtSlots = {
  id: string;
  name: string;
  type: string;
  pricePerHour: number;
  slots: Slot[];
};
export type Court = { id: string; name: string; type: string; pricePerHour: number };
export type Reservation = {
  id: string;
  courtId: string;
  date: string;
  startHour: number;
  endHour: number;
  totalPrice: number;
  status: string;
  paymentType: string;
  court: { name: string; type: string };
  createdAt: string;
};
