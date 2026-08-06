import assert from "node:assert/strict";
import test from "node:test";

import { buildAzerbaijanChecklist } from "./lib.js";

const validTrip = {
  arrivalDate: "2026-09-01",
  passportExpiry: "2027-12-01",
  stayDays: 10,
};

test("traveller and child counts must be whole numbers", () => {
  const fractionalParty = buildAzerbaijanChecklist({
    ...validTrip,
    travellers: 2.5,
    children: 1,
  });
  const fractionalChildren = buildAzerbaijanChecklist({
    ...validTrip,
    travellers: 3,
    children: 1.5,
  });

  assert.match(fractionalParty.error, /whole numbers/i);
  assert.match(fractionalChildren.error, /whole numbers/i);
});
