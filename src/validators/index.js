import {body} from "express-validator";

const userResgisterValidator = ()=>{
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("A Valid email is required"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("username is requierd")
            .isLowercase()
            .withMessage("Username should be in lowercase")
            .isLength({min:3})
            .withMessage("Username should be minimum 3 characters long"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .isLength({min:6})
            .withMessage("Password should be minimum 6 characters long"),
        body("fullname")
            .optional()
            .trim()
    ]
}

const userLoginValidator = ()=>{
    return [
        body("email")
            .trim()
            .optional()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("A valid Email is required"),

        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .isLength({min:3})
            .withMessage("Password should be minimum 3 characters long")
    ]
}

const userChangeCurrentPasswordValidator =()=>{
    return [
        body("oldPassword")
        .notEmpty()
        .withMessage("Old Passoword is required"),

       body("newPassword")
        .notEmpty()
        .withMessage("Old Passoword is required"),
    ]
}

const userForgotPasswordEmailValidator = ()=>{
    return [
        body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("An valid emai is required")
    ]
}

const userResetForgotPasswordValidator = ()=>{
    return [
        body("newPassword")
        .notEmpty()
        .withMessage("Old Passoword is required"),
    ]
}


export {
    userResgisterValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordEmailValidator,
    userResetForgotPasswordValidator
}