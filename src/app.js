require('dotenv').config();
const express = require("express");
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcrypt");
const Register = require("./models/registers");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

const app = express();
require("./db/conn");

const port = process.env.PORT || 3000;
const staticPath = path.join(__dirname,"../public");
const viewsPath = path.join(__dirname,"../templates/views");
const partialPath = path.join(__dirname,"../templates/partials");


app.use(express.static(staticPath));
app.set("view engine","hbs");
app.set("views",viewsPath);
hbs.registerPartials(partialPath);
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());


app.get("/",(req,res)=>{
    res.render("index");
})
app.get("/about",(req,res)=>{
    res.render("about");
})
app.get("/contact",(req,res)=>{
    res.render("contact");
})
app.get("/glasses",(req,res)=>{
    res.render("glasses");
})
app.get("/shop",auth,(req,res)=>{
    console.log(`this is cookie ${req.cookies.jwt}`);
    res.render("shop");
})
app.get("/login",(req,res)=>{
    res.render("login");
})
app.get("/logout",auth, async (req,res)=>{

    try{
        console.log(req.user);
        req.user.tokens = req.user.tokens.filter((curEle)=>{
            return curEle.token !== req.token;
        })
        res.clearCookie("jwt");
        console.log("logout Successfully");
        await req.user.save();
        res.render("login");
    }catch(err){
        res.status(500).send(err);
    }
})

app.post("/login", async (req,res)=>{
    try{
        const uemail = req.body.email;
        const upass = req.body.pass;

        const userData = await Register.findOne({email:uemail});

        const isMatch = await bcrypt.compare(upass,userData.password);
        const token = await userData.generateAuthToken();
        console.log(`token is ${token}`);

        res.cookie("jwt",token,{
            expires : new Date(Date.now()+500000),
            httpOnly:true
        });

        if(isMatch){
            res.status(201).render("index");
        }else{
            res.status(401).send("password is not matched");
        }

    }catch(err){
        res.status(400).send("invalid login details");
    }
})


app.get("/register",(req,res)=>{
    res.render("register");
})

app.post("/register",async (req,res)=>{
    try{
        const pass = req.body.pass;
        const cpass = req.body.cpass;

        if(pass === cpass)
        {
            const hashPass = await bcrypt.hash(cpass,10);
            const userRegisteration = new Register({
                name : req.body.name,
                email : req.body.email,
                phone : req.body.phone,
                age :  req.body.age,
                password : hashPass
            })

            const token = await userRegisteration.generateAuthToken();
            console.log(`token is ${token}`);

            res.cookie("jwt",token,{
                expires : new Date(Date.now()+500000),
                httpOnly:true
            });

            const registered =await userRegisteration.save();
            res.status(201).render("login");
        }
        else{
            res.send("Opps! Passwrod not matched")
        }    
    }catch(error){
        res.status(400).send(error);
    }
})

app.get("*",(req,res)=>{
    res.render("404");
})

app.listen(port , ()=>{
    console.log(`server is running at port no ${port}`);
});