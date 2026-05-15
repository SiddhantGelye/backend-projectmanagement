export const asyncHandler = (requestHandler)=>{    
    return (req, res, next)=>{
        Promise.resolve(requestHandler(req, res, next))
        .catch(err=> next(err))
    }
}

// const asyncHandlerWrapper = (requestHandler) => {
//     return (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next))
//             .catch(err => next(err));
//     };  
// };

// export default asyncHandlerWrapper;