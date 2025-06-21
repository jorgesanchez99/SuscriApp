import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'El nombre  es obligatorio'],
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
      maxlength: [50, 'El nombre no debe superar los 50 caracteres'],
      match: [/^[a-zA-Z\s]+$/, 'El nombre solo puede contener letras sin tildes ni ñ, y espacios'],
    },
    lastName: {
        type: String,
        required: [true, 'El apellido es obligatorio'],
        trim: true,
        minlength: [3, 'El apellido debe tener al menos 3 caracteres'],
        maxlength: [50, 'El apellido no debe superar los 50 caracteres'],
        match: [/^[a-zA-Z\s]+$/, 'El apellido solo puede contener letras sin tildes ni ñ, y espacios'],
    },
    email: {
        type: String,
        required: [true, 'El correo electrónico es obligatorio'],
        unique: true,
        trim: true,
        lowercase: [true, 'El correo electrónico debe estar en minúsculas'],
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'El correo electrónico no es válido'],
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        //select: false, // No mostrar la contraseña por defecto
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
},{timestamps: true});

const User = mongoose.model('User', userSchema);
export default User;