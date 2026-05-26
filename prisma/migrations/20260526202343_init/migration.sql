-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'reserved',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "cancelledAt" DATETIME,
    "rescheduledFromId" TEXT,
    CONSTRAINT "Booking_rescheduledFromId_fkey" FOREIGN KEY ("rescheduledFromId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
