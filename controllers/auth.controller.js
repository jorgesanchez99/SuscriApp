import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {JWT_EXPIRATION, JWT_SECRET} from "../config/env.js";

export const signUp = async (req,res,next) => {

    //session de Mongoose para transacciones, se utiliza para realizar operaciones atómicas en la base de datos
    //No es una session de usuario ni una session de autenticacion
    const session = await mongoose.startSession();
    session.startTransaction()

    try {

        const {name, lastName, email, password} = req.body;

        // Validar que los campos requeridos no estén vacíos
        if (!name || !lastName || !email || !password) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }



        //Validar que el usuario no exista
        const existingUser = await User.findOne({ email }).session(session);
        if (existingUser) {
            const error = new Error("El usuario ya existe");
            error.statusCode = 409; // Conflict
            throw error;
        }

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear un nuevo usuario
        const newUsers = await User.create([{
            name,
            lastName,
            email,
            password: hashedPassword
        }],{session}); // Pasar la sesión para que la operación se realice dentro de la transacción

        const token = jwt.sign({ id: newUsers[0]._id}, JWT_SECRET,{ expiresIn: JWT_EXPIRATION });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            succes: true,
            message: "Usuario creado exitosamente",
            data: {
                token,
                user: newUsers[0]
            },
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }


}

export const signIn = async (req,res,next) => {
    try {

        const {email, password} = req.body;

        // Validar que los campos requeridos no estén vacíos
        if (!email?.trim() || !password?.trim()) {
            const error = new Error("Email y contraseña son obligatorios");
            error.statusCode = 400; // Bad Request
            throw error;
        }

        // Buscar el usuario por email
        const user = await User.findOne({email});
        if (!user) {
            const error = new Error("Usuario o contraseña incorrectos");
            error.statusCode = 401; // Unauthorized
            throw error;
        }


        // Verificar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            const error = new Error("Usuario o contraseña incorrectos");
            error.statusCode = 401; // Unauthorized
            throw error;
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

        res.status(200).json({
            success: true,
            message: "Inicio de sesión exitoso",
            data: {
                token,
                user
            },
        });

    } catch(error) {
        next(error);
    }
}

export const signOut = async (req,res,next) => {
    // Logica para cerrar sesion
}