import { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";

/* BETTER AUTH SIGN UP CONTROLLER */
export const signUpController = async (req: Request, res: Response) => {
  try {
    const result = await auth.api.signUpEmail({
      body: {
        email: req.body.email,
        name: req.body.name,
        password: req.body.password,
      },
    });
    return res.status(200).json({
      success: true,
      user: result,
      message: "User created successfully!!",
    });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "Internal Server Error!!!" });
  }
};

/* BETTER AUTH SIGN IN CONTROLLER */
export const signInController = async (req: Request, res: Response) => {
  try {
    const response = await auth.api.signInEmail({
      body: {
        email: req.body.email,
        password: req.body.password,
      },
      headers: fromNodeHeaders(req.headers),
      asResponse: true,
    });
    // forward any set-cookie headers to the client browser
    if (response.ok) {
      const setCookieHeader = response.headers.get("set-cookie");
      if (setCookieHeader) {
        res.setHeader("set-cookie", setCookieHeader);
      }
      const data = await response.json();
      return res.status(200).json({
        success: true,
        response: data,
        message: "User logged in successfully!!",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "Internal Server Error!!!" });
  }
};

/* BETTER AUTH SIGN OUT CONTROLLER */
export const logoutController = async (req: Request, res: Response) => {
  try {
    const response = await auth.api.signOut({
      headers: fromNodeHeaders(req.headers),
      asResponse: true,
    });
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      res.setHeader("set-cookie", setCookieHeader);
    }
    return res.status(200).json({
      success: true,
      message: "User signed out successfully!!",
    });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "Sign out failed!!!" });
  }
};
