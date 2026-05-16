import mongoose , {Schema} from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new Schema({ 
    avatar:{
        type:{
            url: String,
            publicpath: String
        },
        default:{
            url: "https://placehold.co/200x200",
            publicpath:""
        }
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true, // spaces are gone,
        index: true //indexing will happen on this field but do not give index field to many more things because it will slow down the database it is best for indexing 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName:{
        type: String,
        required: false,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"]
    },
    isEmailVarified: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String,
    },
    forgotPasswordToken: {  
        type: String,
    },
    forgotPasswordTokenExpiry: {
        type: Date,
    },
    emailVerificationToken: {
        type: String,
    },
    emailVerificationTokenExpiry: {
        type: Date,
    },
    // role: {
    //     type: String,
    //     enum: ['user', 'admin'],
    //     default: 'user'
    // },  
    // createdAt: {
    //     type: Date,
    //     default: Date.now
    // }
},{timestamps: true});


userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return;
    }
    this.password  = await bcrypt.hash(this.password, 10);
    // next();
})

userSchema.methods.isPasswordCorrect = async function(userPassword){
    return await bcrypt.compare(userPassword, this.password);
    // it will return booelan value as if password is correct or not 
}

userSchema.methods.generateAccessToken =  function(){
    return jwt.sign(
        {
            _id : this._id,
            email: this.email,
            username : this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn : process.env.ACCESS_TOKEN_EXPIRY}
    )   
}

userSchema.methods.generateRefreshToken=  function(){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn : process.env.REFRESH_TOKEN_EXPIRY}
    )   
}


userSchema.methods.generateTempToken = async function(){
    const unHasedToken = crypto.randomBytes(20).toString('hex');
    const hasedToken = crypto.createHash('sha256')
                             .update(unHasedToken)
                             .digest('hex');
    const tokenExpiry = Date.now() + (20* 60* 1000) // 20 minutes

    return {unHasedToken, hasedToken, tokenExpiry};
}

export const User = mongoose.model('User', userSchema);