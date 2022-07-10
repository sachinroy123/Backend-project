const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    phone : {
        type :Number,
        required : true
    },
    age : {
        type :Number,
        required : true
    },
    password : {
        type :  String,
        required : true,
        unique : true
    },
    tokens :[{
        token :{
            type : String,
            required : true
        }
    }]
}) 




userSchema.methods.generateAuthToken = async function()
{
    try{
        // console.log(this._id);
        const token = jwt.sign({_id : this._id.toString()},process.env.SECRET_KEY);
        // console.log(token);
        this.tokens =this.tokens.concat({token:token}); 
        await this.save()
        return token;

    }catch(err){
        console.log(`the error part ${err}`);
        res.send(`the error part ${err}`);
    }
}


// create collection
const Register = new mongoose.model("User",userSchema);

module.exports = Register;
