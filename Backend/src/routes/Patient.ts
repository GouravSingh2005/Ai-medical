import { Router, type Request, type Response } from "express";
 const PatientRouter = Router();

PatientRouter.post('/signin', (req: Request, res: Response) => {
    // Destructure the expected fields from the request body
    const { email, password } = req.body;

    // Normally, you'd check the DB here for user credentials

    res.status(200).json({
        message: "You have signed in successfully",
        data: {
            email,
            password
        }
    });
});
export default PatientRouter;

