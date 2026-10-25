import Login_service from "../../servces/login/login.service.js";

const Login = async (req, res) => {
    try {
        const { email, password } = req.body ?? {};

        if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
            return res.status(400).send({
                success: false,
                message: "Email and password are required",
            });
        }

        const data = await Login_service(email.trim().toLowerCase(), password);

        if (!data) {
            return res.status(401).send({
                success: false,
                message: "Invalid email or password",
            });
        }

        res.status(200).send({
            success: true,
            message: "Login successful",
            data,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
};

export default Login;
