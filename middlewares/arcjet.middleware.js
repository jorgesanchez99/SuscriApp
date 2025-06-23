import aj from "../config/arcjet.js";


const arcjetMiddleware = async (req, res, next) => {

    try {
        const decision = await aj.protect(req, { requested: 1});
        if(decision.isDenied()) {
            if(decision.reason.isRateLimit()) return res.status(429).send({error: "Rate Limit Exceeded"});
            if(decision.reason.isBot()) return res.status(403).send( {error: "Bots Exceeded", message: decision.results});

            return res.status(403).send({error: "Access Denied"});
        }

        next();
    } catch (error) {
        console.log(`Error in arcjetMiddleware: ${error.message}`);
        next(error);
    }
}

export default arcjetMiddleware;