//crypto is used to hash the password
const { createHmac,randomBytes } = require("crypto");
const {Schema,model} = require("mongoose");
const { createTokenForUser } = require("../services/autentication");

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    //salt is use to hash the password
    salt: {
        type: String,
        
    },
    password: {
        type: String,
        required: true
    },
    profileImageURL:{
        type:String,
        default: '/images/default.jpeg',
    },
    role:{
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    }
    
},

        {timestamps: true}
);

// Pre-save hook to hash the password
userSchema.pre("save",function(next){
    const user = this;

    if (!user.isModified("password")) return;


    // Generate a salt and hash the password
    // Using createHmac to hash the password with the salt
    //salt is a random string that is used to hash the password
    //randomBytes is used to generate a random string
    //createHmac is used to hash the password with the salt
    //digest is used to convert the hash to a string    
    //toString is used to convert the random bytes to a string
    //hex is used to convert the hash to a hexadecimal string
    // If the password is not modified, skip hashing

    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac("sha256",salt)
        .update(user.password)
        .digest("hex");


    user.salt = salt;
    user.password = hashedPassword;
    next();
})


//signin mati jyare data aave chhe tyare tene match krva mate function

userSchema.static("matchPasswordAndGenerateToken",async function(email,password){
    // Find the user by email
    // If user is not found, throw an error
    const user = await this.findOne({email});
    if(!user) throw new Error("User not found") ;

    const salt = user.salt;
    const userProvidedHash = createHmac("sha256",salt)
    .update(password)
    .digest("hex")

    if (user.password !== userProvidedHash) {
        throw new Error("Invalid password");
    }

    const token = createTokenForUser(user);
    return token;
})

const User = model("user",userSchema);
module.exports = User;