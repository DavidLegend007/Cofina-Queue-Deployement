import { ZodError } from 'zod';
export const validate = (schema) => async (req, res, next) => {
    try {
        req.body = await schema.parseAsync(req.body);
        next();
    }
    catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                status: 'VALIDATION_ERROR',
                errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
            });
        }
        return res.status(500).json({ error: 'Erreur interne de validation' });
    }
};
