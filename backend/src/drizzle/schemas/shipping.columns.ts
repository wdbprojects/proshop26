import { doublePrecision, text } from "drizzle-orm/pg-core";

export const shippingColumns = () => {
  return {
    shipFullName: text("ship_full_name"),
    shipPhone: text("ship_phone"),
    shipCity: text("ship_city"),
    shipZone: text("ship_zone"),
    shipStreet: text("ship_street"),
    shipReference: text("ship_reference"),
    shipLatitude: doublePrecision("ship_latitude"),
    shipLongitude: doublePrecision("ship_longitude"),
  };
};
