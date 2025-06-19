import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'El nombre de la suscripcion es obligatorio'],
        trim: true,
        minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
        maxlength: [100, 'El nombre no debe superar los 100 caracteres'],
        match: [/^[a-zA-Z\s]+$/, 'El nombre solo puede contener letras sin tildes ni ñ, y espacios'],
    },
    price: {
        type: Number,
        required: [true, 'El precio de la suscripción es obligatorio'],
        min: [0, 'El precio no puede ser negativo'],
    },
    currency: {
        type: String,
        required: [true, 'La moneda es obligatoria'],
        enum: ['USD', 'EUR', 'PEN'], // Puedes agregar más monedas según sea necesario
        default: 'PEN',
    },
    frequency: {
        type: String,
        required: [true, 'La frecuencia de la suscripción es obligatoria'],
        enum: ['diaria','semanal','mensual', 'anual'],
        default: 'mensual',
    },
    category: {
        type: String,
        required: [true, 'La categoría de la suscripción es obligatoria'],
        enum: ['deportes', 'noticias', 'entretenimiento', 'estilo de vida','tecnologia', 'educación', 'salud', 'finanzas', 'otros']
    },
    paymentMethod: {
        type: String,
        required: [true, 'El método de pago es obligatorio'],
        enum: ['tarjeta de crédito', 'tarjeta de débito', 'PayPal', 'transferencia bancaria', 'otros'],
        default: 'tarjeta de crédito',
        trim: true,
    },
    status: {
        type: String,
        required: [true, 'El estado de la suscripción es obligatorio'],
        enum: ['activa', 'cancelada', 'pendiente', 'expirada'],
        default: 'activa',
    },
    startDate: {
        type: Date,
        required: [true, 'La fecha de inicio es obligatoria'],
        validate: {
            validator : (value) => value <= new Date(),
            message: 'La fecha de inicio no puede ser futura',
        }
    },
    renewalDate: {
        type: Date,
        validate: {
            validator: function(value) {
                return value > this.startDate;
            },
            message: 'La fecha de renovación debe ser futura',
        }
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario es obligatorio'],
        index: true, // Para mejorar el rendimiento en consultas
    }
},{timestamps:true});


// Middleware que se ejecuta antes de guardar o modificar una suscripción
subscriptionSchema.pre('save', function (next) {
    // Si no se ha definido la fecha de renovación, la calcula automáticamente
    if(!this.renewalDate) {
        // Días correspondientes a cada frecuencia
        const renewalPeriods = {
            diaria: 1,
            semanal: 7,
            mensual: 30,
            anual: 365
        };

        // Establece la fecha de renovación sumando los días según la frecuencia
        this.renewalDate = new Date(this.startDate);
        this.renewalDate.setDate(this.renewalDate.getDate() + renewalPeriods[this.frequency]);
    }

    // Si la fecha de renovación ya pasó, marca la suscripción como expirada
    if(this.renewalDate < new Date()){
        this.status = 'expired';
    }

    // Continúa con el proceso de guardado
    next();
});


const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;