"use server";

import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/auth-utils";

const base = process.env.NEXT_PUBLIC_API_URL;

export const fetchOrdersAction = async () => {
  // const session = await getSession();
  // if (!session) {
  //   throw new Error("Unauthorized!!!");
  // }
  try {
    const response = await fetch(
      `${base}/api/orders` /* {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    } */,
    );
    const data = await response.json();
    if (!response.ok) {
      return "ERROR";
    }
    return data;
  } catch (err) {
    console.log(`Error from apiFetch catch(): ${err}`);
    throw err;
  }
};
