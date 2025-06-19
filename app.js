import express from "express";
import {PORT} from "./config/env.js";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
// Middleware to parse cookies
app.use(cookieParser())
// // Middleware to handle CORS
// import cors from "cors";
// app.use(cors());
// // Middleware to handle static files
// import path from "path";
// app.use(express.static(path.join(process.cwd(), "public")));

// Middleware to handle API versioning
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);

app.use(errorMiddleware);



// Define the root route and send a welcome message
app.get("/", (req, res) => {
    res.send('Bienvenido a Suscripcion Tracker API');
})



app.listen(PORT, async () => {
    console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);

    await connectToDatabase()
});

// Export the app for testing purposes
export default app;