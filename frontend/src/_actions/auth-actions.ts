"use server";

import { LoginSchemaType, RegisterSchemaType } from "@/schemas/auth-schemas";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/* REGISTER ACTION */
export const registerAction = async (data: RegisterSchemaType) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error:
          responseData.message || responseData.error || "Registration failed",
      };
    }

    return {
      success: true,
      message: "Successfully registered, you can log in now!",
      user: responseData.user,
    };
  } catch (error) {
    const err = error as Error;
    console.error(err.message);
    return { success: false, message: err.message };
  }
};

/* LOGIN ACTION */
/* export const loginAction = async (data: LoginSchemaType) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-in/email`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      },
    );
    const responseData = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: responseData.message || responseData.error || "Login failed",
      };
    }
    return {
      success: true,
      message: "Successfully logged in, welcome back ",
      user: responseData.user,
    };
  } catch (error) {
    const err = error as Error;
    console.error(err.message);
    return { success: false, message: err.message };
  }
}; */
