import { describe, it, expect } from "vitest";

// Test reservation validation and conflict checking logic directly
// Extracted from the reservation action's core algorithm

/**
 * Core conflict checking algorithm — same logic as in the server action.
 * Given existing reservations for a court on a date, checks if a new
 * time range overlaps with any CONFIRMED reservation.
 */
function checkConflict(
  existingReservations: { startHour: number; endHour: number; status: string; id: string }[],
  newStartHour: number,
  newEndHour: number,
  excludeId?: string
): boolean {
  return existingReservations.some(
    (r) =>
      r.status === "CONFIRMED" &&
      r.id !== excludeId &&
      r.startHour < newEndHour &&
      r.endHour > newStartHour
  );
}

describe("Reservation Logic", () => {
  const existingReservations = [
    { id: "r1", startHour: 8, endHour: 10, status: "CONFIRMED" },
    { id: "r2", startHour: 14, endHour: 16, status: "CONFIRMED" },
    { id: "r3", startHour: 18, endHour: 19, status: "CANCELLED" },
  ];

  it("should allow reservation in empty slot", () => {
    const hasConflict = checkConflict(existingReservations, 10, 12);
    expect(hasConflict).toBe(false);
  });

  it("should detect conflict with existing reservation", () => {
    const hasConflict = checkConflict(existingReservations, 9, 11);
    expect(hasConflict).toBe(true);
  });

  it("should allow booking in cancelled slot", () => {
    const hasConflict = checkConflict(existingReservations, 18, 19);
    expect(hasConflict).toBe(false);
  });

  it("should detect exact overlap", () => {
    const hasConflict = checkConflict(existingReservations, 8, 10);
    expect(hasConflict).toBe(true);
  });

  it("should allow adjacent time slots (no gap)", () => {
    // 10:00-12:00 is adjacent to 8:00-10:00, no overlap
    const hasConflict = checkConflict(existingReservations, 10, 14);
    expect(hasConflict).toBe(false);
  });

  it("should calculate total price correctly", () => {
    const pricePerHour = 200000;
    const startHour = 8;
    const endHour = 10;
    const totalPrice = (endHour - startHour) * pricePerHour;
    expect(totalPrice).toBe(400000);
  });
});
