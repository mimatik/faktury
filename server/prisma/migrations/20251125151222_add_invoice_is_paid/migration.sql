-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "issueDate" DATETIME NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "taxableDate" DATETIME NOT NULL,
    "variableSymbol" TEXT,
    "constantSymbol" TEXT,
    "specificSymbol" TEXT,
    "note" TEXT,
    "total" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CZK',
    "language" TEXT NOT NULL DEFAULT 'cs',
    "isVatReverseCharge" BOOLEAN NOT NULL DEFAULT false,
    "qrCodeString" TEXT,
    "qrCodeDataUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("constantSymbol", "createdAt", "currency", "customerId", "dueDate", "id", "isVatReverseCharge", "issueDate", "language", "note", "number", "qrCodeDataUrl", "qrCodeString", "specificSymbol", "status", "taxableDate", "total", "updatedAt", "userId", "variableSymbol") SELECT "constantSymbol", "createdAt", "currency", "customerId", "dueDate", "id", "isVatReverseCharge", "issueDate", "language", "note", "number", "qrCodeDataUrl", "qrCodeString", "specificSymbol", "status", "taxableDate", "total", "updatedAt", "userId", "variableSymbol" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
