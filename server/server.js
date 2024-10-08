import path from "path";
import express from 'express'
import dotenv from 'dotenv'
import connectDb from './db/connectDb.js'
import cors from "cors";
import cookieParser from 'cookie-parser'
import userRoutes from './routes/userRoutes.js'
import postRoutes from './routes/postRoutes.js'

import messageRoutes from './routes/messageRoute.js'
import { v2 as cloudinary } from 'cloudinary'
import {app,server} from './socket/socket.js'

dotenv.config();
connectDb();


const PORT = process.env.PORT || 6000;
const __dirname = path.resolve();

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(
  cors({
    origin: ["https://chat-rocket-webapp-kumar-studio.onrender.com/"],
    credentials: true,
  })
);
app.use(cookieParser())

app.use("/api/users",userRoutes);
app.use("/api/posts",postRoutes);
app.use("/api/messages",messageRoutes);

// http://localhost:3000 front
// http://localhost:2000

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/client/dist")));

	// react app
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
	});
}

server.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});
