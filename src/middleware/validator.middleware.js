import {validationResult } from 'express-validator';
import {ApiError} from '../utils/api-error';


export const validate = (req, res, next)=>{
    const errors = validationResult(req);
    if(errors.isEmpty()){
        return next()
    }
}